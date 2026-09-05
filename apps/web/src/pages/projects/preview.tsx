import {
  PreviewModeToggle,
  type PreviewMode,
} from "@/components/workspace/PreviewModeToggle";
import { WebContainerPreview } from "@/components/workspace/WebContainerPreview";
import { ArrowLeft, ExternalLink, Loader2, FileCode2 } from "lucide-react";
import { LivePreviewPanel } from "@/components/LivePreviewPanel";
import { isWebContainerSupported } from "@/lib/webcontainer";
import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
}

function looksLikeReactViteProject(files: ProjectFile[]): boolean {
  const paths = files.map(f => f.path.toLowerCase());
  const hasIndexHtml = paths.some(p => p === "index.html");
  const hasMainTsx = paths.some(
    p => p.endsWith("src/main.tsx") || p.endsWith("src/main.jsx"),
  );
  const hasAppTsx = paths.some(
    p =>
      p.endsWith("src/app.tsx") ||
      p.endsWith("src/App.tsx") ||
      p.endsWith("src/app.jsx") ||
      p.endsWith("src/App.jsx"),
  );
  const pkg = files.find(f => f.path.toLowerCase() === "package.json");
  let pkgLooksLikeViteReact = false;
  if (pkg) {
    try {
      const parsed = JSON.parse(pkg.content);
      const deps = { ...parsed.dependencies, ...parsed.devDependencies };
      pkgLooksLikeViteReact =
        (deps.react && deps.vite) ||
        (deps.react && deps["@vitejs/plugin-react"]) ||
        (deps["react-dom"] && deps.vite);
    } catch {
      // ignore bad JSON
    }
  }
  return hasIndexHtml && (hasMainTsx || hasAppTsx || pkgLooksLikeViteReact);
}

export default function ProjectPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("cloud");

  const webContainerSupported = useMemo(() => isWebContainerSupported(), []);
  const isReactVite = useMemo(
    () => files.length > 0 && looksLikeReactViteProject(files),
    [files],
  );

  useEffect(() => {
    async function loadFiles() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getProjectFiles(id);
        setFiles(data as ProjectFile[]);
      } catch {
        setError("Failed to load project files");
      } finally {
        setIsLoading(false);
      }
    }
    loadFiles();
  }, [id]);

  const previewFiles = useMemo(
    () => files.map(f => ({ path: f.path, content: f.content })),
    [files],
  );

  const entryFile = files.find(f => f.path === "index.html") || files[0];
  const previewCode = entryFile?.content || "";
  const canLivePreview = webContainerSupported && isReactVite;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${id}`)}
            className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Project
          </button>
        </div>
        <div className="flex items-center gap-2">
          {canLivePreview && (
            <PreviewModeToggle
              mode={previewMode}
              onChange={setPreviewMode}
              liveSupported={webContainerSupported}
            />
          )}
          <Button size="sm" variant="outlined">
            <ExternalLink size={16} className="mr-2" /> Open in New Tab
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <FileCode2 size={24} className="text-primary" />
        <Typography variant="headline">Live Preview</Typography>
      </div>

      <div className="border border-outline/20 rounded-xl overflow-hidden bg-surface-variant/5">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <Typography>Loading preview...</Typography>
            </div>
          </div>
        ) : error || !previewCode ? (
          <div className="flex flex-col items-center justify-center h-[500px] space-y-4 text-foreground/40">
            <FileCode2 size={48} className="opacity-20" />
            <Typography variant="title">No Preview Available</Typography>
            <Typography variant="body">
              {error ||
                "This project does not have a previewable entry file yet."}
            </Typography>
          </div>
        ) : canLivePreview && previewMode === "live" ? (
          <WebContainerPreview files={previewFiles} />
        ) : (
          <LivePreviewPanel
            initialCode={previewCode}
            projectName={entryFile.path.split("/").pop() || "Preview"}
          />
        )}
      </div>
    </div>
  );
}
