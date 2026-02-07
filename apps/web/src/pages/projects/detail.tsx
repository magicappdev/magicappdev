import {
  ArrowLeft,
  Settings,
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  Shield,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getProjects, type Project, deleteProject } from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const projects = await getProjects();
        const found = projects.find(p => p.id === id);
        if (found) {
          setProject(found);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleDelete = async () => {
    if (!project || !confirm("Are you sure you want to delete this project?"))
      return;

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      navigate("/projects");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete project");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <Typography>Loading project details...</Typography>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-error" />
        <Typography variant="title">{error || "Project not found"}</Typography>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <Typography variant="headline">{project.name}</Typography>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
              {project.status}
            </span>
          </div>
          <Typography variant="body" className="text-foreground/60">
            {project.description || "No description provided."}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => navigate(`/projects/${project.id}/settings`)}
          >
            <Settings size={16} className="mr-2" /> Settings
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/projects/${project.id}/preview`)}
          >
            <ExternalLink size={16} className="mr-2" /> Open Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-outline/10 bg-surface-variant/10 flex justify-between items-center">
              <Typography
                variant="title"
                className="text-sm font-bold uppercase tracking-wider text-foreground/50"
              >
                Recent Activity
              </Typography>
            </div>
            <div className="p-12 text-center text-foreground/40 space-y-2">
              <Clock size={32} className="mx-auto opacity-20" />
              <Typography>No recent activity recorded.</Typography>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <Typography variant="title">Project Resources</Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResourceItem
                icon={Globe}
                title="Web App"
                subtitle="Production Deployment"
                status="Active"
              />
              <ResourceItem
                icon={Shield}
                title="Security"
                subtitle="Auth & Permissions"
                status="Secure"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <Typography variant="title" className="text-base">
              Details
            </Typography>

            <div className="space-y-4">
              <DetailItem
                label="Created"
                value={new Date(project.createdAt).toLocaleDateString()}
                icon={Calendar}
              />
              <DetailItem
                label="Last Updated"
                value={new Date(project.updatedAt).toLocaleDateString()}
                icon={Clock}
              />
              <DetailItem
                label="ID"
                value={project.id}
                className="font-mono text-[10px]"
              />
            </div>

            <div className="pt-4 border-t border-outline/10">
              <Button
                variant="text"
                className="w-full justify-start text-error hover:bg-error/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                Delete Project
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { LucideIcon } from "lucide-react";

function ResourceItem({
  icon: Icon,
  title,
  subtitle,
  status,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-outline/5 hover:bg-surface-variant/10 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[10px] opacity-50">{subtitle}</div>
      </div>
      <div className="text-[10px] font-bold text-green-500 uppercase">
        {status}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={16} className="text-foreground/30 mt-0.5" />}
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold uppercase text-foreground/40">
          {label}
        </div>
        <div className={`text-sm ${className}`}>{value}</div>
      </div>
    </div>
  );
}
