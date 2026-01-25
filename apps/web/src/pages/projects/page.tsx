import {
  getProjects,
  createProject,
  deleteProject,
  type Project,
} from "@/lib/api";
import { Plus, Folder, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load projects";
      setError(errorMessage);
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim() || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const newProject = await createProject({
        name: newProjectName,
        description: newProjectDescription || undefined,
      });
      setProjects([newProject, ...projects]);
      setNewProjectName("");
      setNewProjectDescription("");
      setIsCreating(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
      setError(errorMessage);
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this project? This action cannot be undone.",
        )
      ) {
        return;
      }

      setError(null);
      setDeletingProjectId(projectId);

      try {
        await deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete project";
        setError(errorMessage);
        console.error("Failed to delete project:", error);
      } finally {
        setDeletingProjectId(null);
      }
    },
    [projects],
  );

  const handleRetry = () => {
    setIsLoading(true);
    loadProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="headline">Projects</Typography>
          <Typography variant="body" className="text-sm text-foreground/60">
            Manage your MagicAppDev projects
          </Typography>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} disabled={isLoading}>
          <Plus size={16} className="mr-2" /> New Project
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <Typography
              variant="label"
              className="text-red-700 dark:text-red-400"
            >
              Error
            </Typography>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <Button size="sm" variant="text" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      )}

      {/* Create Project Form */}
      {isCreating && (
        <Card className="p-6 border border-primary/20 bg-primary/5">
          <Typography variant="title" className="mb-4">
            Create New Project
          </Typography>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name *</label>
              <Input
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="My Awesome App"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newProjectDescription}
                onChange={e => setNewProjectDescription(e.target.value)}
                placeholder="A brief description of your project"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !newProjectName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center p-12 bg-surface-variant/30 rounded-3xl border border-dashed border-outline/20">
          <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/30">
            <Folder size={32} />
          </div>
          <Typography variant="title" className="mb-2">
            No projects yet
          </Typography>
          <Typography variant="body" className="mb-6 max-w-sm mx-auto">
            Create your first project to start building with MagicAppDev.
          </Typography>
          <Button onClick={() => setIsCreating(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card
              key={project.id}
              className="p-6 hover:border-primary/50 transition-colors group cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Folder size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      project.status === "active"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-surface-variant text-foreground/50 border-outline/10"
                    }`}
                  >
                    {project.status}
                  </span>
                  <Button
                    size="sm"
                    variant="text"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    disabled={deletingProjectId === project.id}
                    title="Delete project"
                  >
                    {deletingProjectId === project.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-sm text-foreground/60 line-clamp-2 mb-4">
                {project.description || "No description"}
              </p>
              <div className="text-xs text-foreground/40">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
