/**
 * Project Workspace Page
 *
 * A full-featured development workspace with file tree, code editor, and live preview
 */

import {
  ArrowLeft,
  Save,
  RefreshCw,
  Download,
  Settings,
  Loader2,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { LivePreview } from "@/components/workspace/LivePreview";

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

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  file?: ProjectFile;
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "app", "components"]));
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load project files
  useEffect(() => {
    async function loadFiles() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const files = await api.getProjectFiles(id);
        setProjectFiles(files);
        if (files.length > 0 && !selectedFile) {
          setSelectedFile(files[0]);
          setFileContent(files[0].content);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project files");
      } finally {
        setIsLoading(false);
      }
    }
    loadFiles();
  }, [id]);

  // Build file tree
  const fileTree: FileNode[] = buildFileTree(projectFiles);

  // Save file
  const handleSave = async () => {
    if (!selectedFile || !id) return;
    setIsSaving(true);
    try {
      const updated = await api.saveProjectFile(id, {
        path: selectedFile.path,
        content: fileContent,
        language: selectedFile.language,
      });
      setSelectedFile(updated);
      setProjectFiles(files => files.map(f => f.id === updated.id ? updated : f));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  // Create new file
  const handleCreateFile = async (path: string) => {
    if (!id) return;
    const name = prompt("Enter file name:", "untitled.tsx");
    if (!name) return;

    const fullPath = path ? `${path}/${name}` : name;
    try {
      const newFile = await api.saveProjectFile(id, {
        path: fullPath,
        content: "",
      });
      setProjectFiles(files => [...files, newFile]);
      setSelectedFile(newFile);
      setFileContent("");
      if (fullPath.includes("/")) {
        const folder = fullPath.substring(0, fullPath.lastIndexOf("/"));
        setExpandedFolders(prev => new Set(prev).add(folder));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create file");
    }
  };

  // Delete file
  const handleDeleteFile = async () => {
    if (!selectedFile || !id) return;
    if (!confirm(`Delete ${selectedFile.path}?`)) return;

    try {
      await api.deleteProjectFile(id, selectedFile.path);
      setProjectFiles(files => files.filter(f => f.id !== selectedFile.id));
      setSelectedFile(null);
      setFileContent("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete file");
    }
  };

  // Export project
  const handleExport = async () => {
    if (!id) return;
    try {
      const exportData = await api.exportProject(id);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportData.project.name}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to export project");
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <Typography>Loading workspace...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Typography variant="headline" className="text-error">{error}</Typography>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline/10 bg-surface">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <div className="h-6 w-px bg-outline/10" />
          <Typography variant="title" className="text-base">
            Workspace
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" onClick={handleExport}>
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button variant="outlined" size="sm">
            <Settings size={16} className="mr-2" /> Settings
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-outline/10 bg-surface-variant/5 flex flex-col">
          <div className="p-3 border-b border-outline/10 flex items-center justify-between">
            <Typography variant="label" className="text-xs uppercase tracking-wider">
              Files ({projectFiles.length})
            </Typography>
            <Button variant="text" size="sm" className="h-6 w-6 p-0" onClick={() => handleCreateFile("")}>
              <Plus size={14} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {fileTree.length === 0 ? (
              <div className="text-center py-8 text-foreground/40">
                <FileText size={24} className="mx-auto mb-2 opacity-50" />
                <Typography variant="body" className="text-sm">No files yet</Typography>
                <Button size="sm" className="mt-2" onClick={() => handleCreateFile("")}>
                  <Plus size={14} className="mr-1" /> Create File
                </Button>
              </div>
            ) : (
              <FileTree
                nodes={fileTree}
                expandedFolders={expandedFolders}
                selectedPath={selectedFile?.path}
                onSelect={path => {
                  const file = projectFiles.find(f => f.path === path);
                  if (file) {
                    setSelectedFile(file);
                    setFileContent(file.content);
                  }
                }}
                onToggle={toggleFolder}
                onCreateFile={handleCreateFile}
              />
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-outline/10 bg-surface-variant/5">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-foreground/40" />
                  <Typography variant="body" className="text-sm font-medium">
                    {selectedFile.path}
                  </Typography>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary">
                    {selectedFile.language}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outlined" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin mr-1" />
                    ) : (
                      <Save size={14} className="mr-1" />
                    )}
                    Save
                  </Button>
                  <Button variant="text" size="sm" className="text-error" onClick={handleDeleteFile}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  value={fileContent}
                  onChange={e => setFileContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
                  spellCheck={false}
                  onKeyDown={e => {
                    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-foreground/40">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <Typography>Select a file to edit</Typography>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Sidebar */}
        <div className="w-96 border-l border-outline/10 flex flex-col">
          <div className="p-3 border-b border-outline/10 flex items-center justify-between">
            <Typography variant="label" className="text-xs uppercase tracking-wider">
              Preview
            </Typography>
            <Button variant="text" size="sm" className="h-6 w-6 p-0">
              <RefreshCw size={14} />
            </Button>
          </div>

          <LivePreview projectId={id || ""} files={projectFiles} />
        </div>
      </div>
    </div>
  );
}

function FileTree({
  nodes,
  level = 0,
  expandedFolders,
  selectedPath,
  onSelect,
  onToggle,
  onCreateFile,
}: {
  nodes: FileNode[];
  level?: number;
  expandedFolders: Set<string>;
  selectedPath?: string;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onCreateFile: (path: string) => void;
}) {
  return (
    <div>
      {nodes.map(node => (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-surface-variant/10 transition-colors ${
              selectedPath === node.path ? "bg-primary/10 text-primary" : ""
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => {
              if (node.type === "directory") {
                onToggle(node.path);
              } else {
                onSelect(node.path);
              }
            }}
          >
            {node.type === "directory" ? (
              <>
                {expandedFolders.has(node.path) ? (
                  <ChevronDown size={14} className="text-foreground/30" />
                ) : (
                  <ChevronRight size={14} className="text-foreground/30" />
                )}
                <Folder size={14} className="text-foreground/40" />
                <span className="text-sm">{node.name}</span>
              </>
            ) : (
              <>
                <span className="w-4" />
                <FileText size={14} className="text-foreground/40" />
                <span className="text-sm">{node.name}</span>
              </>
            )}
          </div>

          {node.type === "directory" && expandedFolders.has(node.path) && node.children && (
            <FileTree
              nodes={node.children}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onToggle={onToggle}
              onCreateFile={onCreateFile}
            />
          )}

          {node.type === "directory" && expandedFolders.has(node.path) && (
            <div
              className="flex items-center gap-1 py-1 px-2 text-foreground/30 hover:text-primary transition-colors cursor-pointer"
              style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }}
              onClick={() => onCreateFile(node.path)}
            >
              <Plus size={12} />
              <span className="text-xs">New File</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function buildFileTree(files: ProjectFile[]): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  // Sort files by path
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split("/");
    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      let node = map.get(currentPath);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "directory",
          children: isFile ? undefined : [],
          file: isFile ? file : undefined,
        };

        map.set(currentPath, node);
        currentLevel.push(node);
        // Sort this level
        currentLevel.sort((a, b) => {
          // Directories first
          if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      }

      if (!isFile && node.children) {
        currentLevel = node.children;
      }
    }
  }

  return root;
}
