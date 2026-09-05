import { ArrowLeft, ExternalLink, Loader2, FileCode2 } from "lucide-react";
import { LivePreviewPanel } from "@/components/LivePreviewPanel";
import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ProjectFile {
  id: string;
  path: string;
  content: string;
  language: string;
  size: number;
}

export default function ProjectPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const entryFile = files.find(f => f.path === "index.html") || files[0];
  const previewCode = entryFile?.content || "";

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
        <Button size="sm" variant="outlined">
          <ExternalLink size={16} className="mr-2" /> Open in New Tab
        </Button>
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
