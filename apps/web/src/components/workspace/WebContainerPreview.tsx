import { setCurrentVM, toProjectFiles } from "@/lib/webcontainer";
import { useEffect, useRef, useState } from "react";
import StackBlitzSDK from "@stackblitz/sdk";

interface WebContainerPreviewProps {
  files: Array<{ path: string; content: string }>;
}

/** Minimal Vite+React package.json for the embedded project */
const BASE_PACKAGE_JSON = {
  name: "magicappdev-preview",
  private: true,
  type: "module",
  scripts: {
    dev: "vite --port 3000 --host",
    build: "tsc && vite build",
  },
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.6.3",
    vite: "^6.0.3",
  },
};

export function WebContainerPreview({ files }: WebContainerPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<
    "idle" | "embedding" | "ready" | "error"
  >("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const vmRef = useRef<unknown>(null);
  const initialFilesRef = useRef(files);

  // Embed the project on mount
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const embed = async () => {
      setStatus("embedding");
      try {
        const projectFiles = toProjectFiles(initialFilesRef.current);

        const vm = await StackBlitzSDK.embedProject(
          containerRef.current!,
          {
            title: "MagicAppDev Preview",
            description: "Live preview of your generated app",
            template: "node",
            files: {
              ...projectFiles,
              // Ensure base config files exist
              "package.json": JSON.stringify(BASE_PACKAGE_JSON, null, 2),
              "vite.config.ts": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
});`,
              "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
            "noEmit": true,
            "jsx": "react-jsx",
            "strict": true
          },
          "include": ["src"]
        }`,
              "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MagicAppDev Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
              "src/main.tsx": `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);`,
              "src/App.tsx": `export default function App() {
  return <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
    <h1>MagicAppDev Preview</h1>
    <p>Edit files to see changes here.</p>
  </div>;
}`,
            },
          },
          {
            openFile: "src/App.tsx",
            view: "preview",
            height: 500,
          },
        );

        if (cancelled) return;

        vmRef.current = vm;
        setCurrentVM(vm as unknown as import("@stackblitz/sdk").VM);
        setStatus("ready");

        // Poll for preview URL
        const pollInterval = setInterval(async () => {
          try {
            const url = await vm.preview.getUrl();
            if (url && !cancelled) {
              setPreviewUrl(url);
              clearInterval(pollInterval);
            }
          } catch {
            // Preview not ready yet
          }
        }, 2000);

        return () => clearInterval(pollInterval);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to embed project:", err);
          setStatus("error");
        }
      }
    };

    embed();

    return () => {
      cancelled = true;
      setCurrentVM(null);
    };
    // Only embed once on mount — file updates handled by applyFsDiff effect below
  }, []);

  // Update files when they change
  useEffect(() => {
    if (!vmRef.current || status !== "ready") return;

    const vm = vmRef.current as unknown as import("@stackblitz/sdk").VM;
    const fileMap = toProjectFiles(files);

    vm.applyFsDiff({
      create: fileMap,
      destroy: [], // We don't remove files, just overwrite
    }).catch(() => {
      // Ignore errors during file sync
    });
  }, [files, status]);

  return (
    <div className="flex flex-col h-full">
      {status === "embedding" && (
        <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
          <div className="animate-spin w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full mr-2" />
          Booting WebContainer...
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center h-32 text-zinc-500 text-sm gap-2">
          <p>WebContainer failed to load.</p>
          <p className="text-xs text-zinc-600">
            Try Chrome, Edge, or Brave with cross-origin isolation enabled.
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 ${status === "ready" ? "" : "hidden"}`}
        style={{ minHeight: 500 }}
      />

      {previewUrl && (
        <div className="px-3 py-1.5 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
          Preview: {previewUrl}
        </div>
      )}
    </div>
  );
}
