/**
 * LivePreview Component
 *
 * Provides real-time preview of project with iframe and hot reload
 */

import { Loader2, RefreshCw, AlertCircle, Code2 } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface LivePreviewProps {
  projectId: string;
  files: ProjectFile[];
}

export function LivePreview({ files }: LivePreviewProps) {
  const [previewStatus, setPreviewStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{
      type: "log" | "error" | "warn";
      message: string;
      timestamp: number;
    }>
  >([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-reload on file changes
  useEffect(() => {
    if (previewStatus === "ready") {
      // Debounce reload
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }

      reloadTimeoutRef.current = setTimeout(() => {
        handleReload();
      }, 1000);

      return () => {
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current);
        }
      };
    }
  }, [files, previewStatus]);

  const handleReload = () => {
    if (iframeRef.current) {
      setPreviewStatus("loading");
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Inject console interceptor into iframe
  const injectConsoleInterceptor = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        { type: "MAGICAPPDEV_CONSOLE_INIT" },
        "*",
      );
    } catch (err) {
      // Cross-origin restrictions may apply
      console.debug("Could not inject console interceptor:", err);
    }
  };

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "MAGICAPPDEV_CONSOLE") {
        setConsoleLogs(prev => [
          ...prev,
          {
            type: event.data.level,
            message: event.data.message,
            timestamp: Date.now(),
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Build a simple HTML preview from project files
  const buildPreviewHtml = () => {
    // Find index.html or create a default one
    const indexFile = files.find(
      f => f.path.endsWith("index.html") || f.path === "index.html",
    );

    if (indexFile) {
      return indexFile.content;
    }

    // Create a simple preview from React/JSX files
    const reactFiles = files.filter(
      f =>
        f.path.endsWith(".tsx") ||
        f.path.endsWith(".jsx") ||
        f.path.endsWith(".ts") ||
        f.path.endsWith(".js"),
    );

    if (reactFiles.length > 0) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${reactFiles.map(f => `// ${f.path}\n${f.content}`).join("\n\n")}
  </script>
</body>
</html>`;
    }

    // Default preview
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { margin: 0 0 1rem; font-size: 2rem; }
    p { margin: 0; opacity: 0.9; }
    .badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba(255,255,255,0.2);
      border-radius: 9999px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 MagicAppDev</h1>
    <p>Your app is ready to build!</p>
    <div class="badge">${files.length} files in workspace</div>
  </div>
</body>
</html>`;
  };

  const previewHtml = buildPreviewHtml();

  // Create blob URL for preview
  const blobUrl = `data:text/html;base64,${btoa(previewHtml)}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Preview Content */}
      <div className="flex-1 relative bg-background">
        <iframe
          ref={iframeRef}
          src={blobUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => {
            setPreviewStatus("ready");
            injectConsoleInterceptor();
          }}
          onError={() => setPreviewStatus("error")}
        />

        {/* Loading Overlay */}
        {previewStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <Typography variant="body" className="text-sm">
                Loading preview...
              </Typography>
            </div>
          </div>
        )}

        {/* Error State */}
        {previewStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <Typography variant="body" className="text-sm text-error">
                Preview failed to load
              </Typography>
              <Button size="sm" className="mt-2" onClick={handleReload}>
                <RefreshCw size={14} className="mr-1" /> Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div className="h-48 border-t border-outline/10 bg-surface-variant flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-outline/10">
            <Typography
              variant="label"
              className="text-xs uppercase tracking-wider"
            >
              Console ({consoleLogs.length})
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="sm"
                className="text-xs"
                onClick={() => setConsoleLogs([])}
              >
                Clear
              </Button>
              <Button
                variant="text"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowConsole(false)}
              >
                ×
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
            {consoleLogs.length === 0 ? (
              <div className="text-foreground/30 text-center py-4">
                No console output
              </div>
            ) : (
              consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.type === "error"
                      ? "text-error"
                      : log.type === "warn"
                        ? "text-yellow-500"
                        : "text-foreground"
                  }`}
                >
                  <span className="opacity-50">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Console Toggle Bar */}
      <div className="border-t border-outline/10 bg-surface p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" onClick={handleReload}>
            <RefreshCw size={14} className="mr-1" /> Reload
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
          >
            <Code2 size={14} className="mr-1" /> Console
          </Button>
        </div>

        <div className="flex items-center gap-1 text-xs text-foreground/40">
          <div
            className={`w-2 h-2 rounded-full ${
              previewStatus === "ready"
                ? "bg-green-500"
                : previewStatus === "loading"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
            }`}
          />
          {previewStatus === "ready" ? "Ready" : previewStatus}
        </div>
      </div>
    </div>
  );
}
