import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { ArrowLeft, Settings } from "lucide-react";

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} className="mr-1" /> Back to Project
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Settings size={24} className="text-primary" />
        <Typography variant="headline">Project Settings</Typography>
      </div>

      <div className="max-w-2xl">
        <Typography variant="body" className="text-foreground/60">
          Project settings functionality coming soon. Configure your project
          preferences, deployment settings, and team permissions here.
        </Typography>
      </div>
    </div>
  );
}
