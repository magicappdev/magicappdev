import { getProjects, createProject, type Project } from "@/lib/api";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Plus, Folder } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const newProject = await createProject({ name: newProjectName });
      setProjects([newProject, ...projects]);
      setNewProjectName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Typography variant="headline">Projects</Typography>
          <Typography variant="body" className="text-sm">
            Manage your MagicAppDev projects
          </Typography>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus size={16} className="mr-2" /> New Project
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 border border-primary/20 bg-primary/5">
          <form onSubmit={handleCreateProject} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="My Awesome App"
                autoFocus
              />
            </div>
            <Button type="submit">Create</Button>
            <Button
              type="button"
              variant="text"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
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
              className="p-6 hover:border-primary/50 transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Folder size={20} />
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    project.status === "active"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-surface-variant text-foreground/50 border-outline/10"
                  }`}
                >
                  {project.status}
                </span>
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
