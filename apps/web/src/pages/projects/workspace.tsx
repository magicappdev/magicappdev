/**
 * Project Workspace — v0/Lovable-style AI-powered code editor
 * 3-panel layout: File Tree | Monaco Editor | Preview + AI Chat
 */

import {
  ArrowLeft,
  Save,
  Download,
  Loader2,
  FileText,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  SendHorizonal,
  RefreshCw,
  Bot,
  Eye,
  GitCommit,
  Sparkles,
  X,
} from "lucide-react";
import {
  api,
  generateCode,
  downloadProjectZip,
  type WorkspaceFile,
} from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import Editor from "@monaco-editor/react";

type ProjectFile = WorkspaceFile;

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  file?: ProjectFile;
}

interface ChatMessage {
  role: "user" | "assistant" | "error";
  content: string;
}

/** Map file extension to Monaco language */
function getLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    css: "css",
    scss: "scss",
    less: "less",
    html: "html",
    htm: "html",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    py: "python",
    sh: "shell",
    bash: "shell",
    toml: "ini",
    yaml: "yaml",
    yml: "yaml",
    sql: "sql",
  };
  return map[ext] ?? "plaintext";
}

type RightTab = "preview" | "ai" | "info";

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "app", "components", "pages", "lib"]),
  );

  // Right panel
  const [rightTab, setRightTab] = useState<RightTab>("ai");
  const [previewSrc, setPreviewSrc] = useState("");

  // AI chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        'Hi! Tell me what you want to build and I\'ll generate the code. Try: "Create a landing page with a hero section and pricing table"',
    },
  ]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Commit modal
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);

  // Load project files
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getProjectFiles(id)
      .then(files => {
        setProjectFiles(files as ProjectFile[]);
        if (files.length > 0) {
          const first = files[0] as ProjectFile;
          setSelectedFile(first);
          setFileContent(first.content);
        }
      })
      .catch(err =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load files",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  // Scroll AI chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Refresh preview when HTML file is selected
  useEffect(() => {
    if (
      selectedFile &&
      (selectedFile.language === "html" || selectedFile.path.endsWith(".html"))
    ) {
      setPreviewSrc(fileContent);
    }
  }, [fileContent, selectedFile]);

  const fileTree = buildFileTree(projectFiles);

  const selectFile = (file: ProjectFile) => {
    setSelectedFile(file);
    setFileContent(file.content);
    setIsDirty(false);
  };

  const handleSave = useCallback(async () => {
    if (!selectedFile || !id || !isDirty) return;
    setIsSaving(true);
    try {
      const updated = await api.saveProjectFile(id, {
        path: selectedFile.path,
        content: fileContent,
        language: selectedFile.language,
      });
      const updatedFile = updated as ProjectFile;
      setSelectedFile(updatedFile);
      setProjectFiles(files =>
        files.map(f => (f.id === updatedFile.id ? updatedFile : f)),
      );
      setIsDirty(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }, [selectedFile, id, isDirty, fileContent]);

  const handleCreateFile = async (folderPath: string) => {
    if (!id) return;
    const name = prompt("File name (e.g. Button.tsx):");
    if (!name) return;
    const fullPath = folderPath ? `${folderPath}/${name}` : name;
    try {
      const newFile = (await api.saveProjectFile(id, {
        path: fullPath,
        content: "",
        language: getLanguage(fullPath),
      })) as ProjectFile;
      setProjectFiles(files => [...files, newFile]);
      selectFile(newFile);
      if (fullPath.includes("/")) {
        const folder = fullPath.substring(0, fullPath.lastIndexOf("/"));
        setExpandedFolders(prev => new Set([...prev, folder]));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile || !id) return;
    if (!confirm(`Delete "${selectedFile.path}"?`)) return;
    try {
      await api.deleteProjectFile(id, selectedFile.path);
      const remaining = projectFiles.filter(f => f.id !== selectedFile.id);
      setProjectFiles(remaining);
      if (remaining.length > 0) {
        selectFile(remaining[0]);
      } else {
        setSelectedFile(null);
        setFileContent("");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !id || isGenerating) return;
    const prompt = aiPrompt.trim();
    setAiPrompt("");
    setIsGenerating(true);
    setChatMessages(prev => [...prev, { role: "user", content: prompt }]);
    setChatMessages(prev => [
      ...prev,
      { role: "assistant", content: "⏳ Generating code..." },
    ]);

    try {
      const result = await generateCode(id, prompt);
      const summary = `✅ ${result.description}\n\n**Changed ${result.files.length} file(s):**\n${result.files.map(f => `• \`${f.path}\``).join("\n")}`;
      setChatMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: summary };
        return next;
      });

      // Reload files
      const freshFiles = (await api.getProjectFiles(id)) as ProjectFile[];
      setProjectFiles(freshFiles);

      // Select first changed file
      const first = result.files[0];
      if (first) {
        const match = freshFiles.find(f => f.path === first.path);
        if (match) selectFile(match);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setChatMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "error", content: `❌ ${msg}` };
        return next;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || !id) return;
    setIsCommitting(true);
    try {
      // Save a snapshot via export (stores in fileHistory implicitly via save)
      // Just export the project as confirmation
      await api.exportProject(id);
      setShowCommitModal(false);
      setCommitMessage("");
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `✅ Snapshot saved: "${commitMessage}"`,
        },
      ]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Commit failed");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleExport = () => {
    if (!id) return;
    const projectName = "project";
    downloadProjectZip(id, projectName).catch(err =>
      alert(err instanceof Error ? err.message : "Export failed"),
    );
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <Typography>Loading workspace…</Typography>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Typography variant="headline" className="text-error">
          {loadError}
        </Typography>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-outline/10 bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center text-sm text-foreground/50 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Projects
          </button>
          <span className="text-foreground/20">|</span>
          <Typography variant="title" className="text-sm">
            Workspace
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {isDirty && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Save size={14} className="mr-1" />
              )}
              Save
            </Button>
          )}
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setShowCommitModal(true)}
          >
            <GitCommit size={14} className="mr-1" /> Commit
          </Button>
          <Button variant="outlined" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── File Tree (240px) ─────────────────────────────────────────────── */}
        <aside className="w-60 border-r border-outline/10 bg-surface-variant/5 flex flex-col shrink-0">
          <div className="px-3 py-2 border-b border-outline/10 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-foreground/40">
              Files ({projectFiles.length})
            </span>
            <button
              onClick={() => handleCreateFile("")}
              className="p-1 rounded hover:bg-surface-variant/20 text-foreground/40 hover:text-primary transition-colors"
              title="New file"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {fileTree.length === 0 ? (
              <div className="text-center py-8 text-foreground/40">
                <FileText size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs mb-2">No files yet</p>
                <button
                  onClick={() => handleCreateFile("")}
                  className="text-xs text-primary hover:underline"
                >
                  + Create a file
                </button>
              </div>
            ) : (
              <FileTree
                nodes={fileTree}
                expandedFolders={expandedFolders}
                selectedPath={selectedFile?.path}
                onSelect={path => {
                  const file = projectFiles.find(f => f.path === path);
                  if (file) selectFile(file);
                }}
                onToggle={toggleFolder}
                onCreateFile={handleCreateFile}
              />
            )}
          </div>
        </aside>

        {/* ── Monaco Editor (flex-1) ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              {/* Tab bar */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-outline/10 bg-surface-variant/5 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-foreground/30" />
                  <span className="text-sm font-medium">
                    {selectedFile.path}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary">
                    {selectedFile.language}
                  </span>
                  {isDirty && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-400"
                      title="Unsaved changes"
                    />
                  )}
                </div>
                <button
                  onClick={handleDeleteFile}
                  className="p-1 rounded hover:bg-error/10 text-foreground/30 hover:text-error transition-colors"
                  title="Delete file"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Editor */}
              <div
                className="flex-1 overflow-hidden"
                onKeyDown={e => {
                  if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              >
                <Editor
                  height="100%"
                  language={getLanguage(selectedFile.path)}
                  value={fileContent}
                  onChange={value => {
                    setFileContent(value ?? "");
                    setIsDirty(true);
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily:
                      "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    padding: { top: 12 },
                    tabSize: 2,
                    renderWhitespace: "none",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-foreground/30">
              <div className="text-center">
                <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm mb-1">
                  Select a file or ask AI to generate code
                </p>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    setRightTab("ai");
                  }}
                >
                  Open AI Chat →
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── Right Panel (380px) ───────────────────────────────────────────── */}
        <aside className="w-96 border-l border-outline/10 flex flex-col shrink-0">
          {/* Tab buttons */}
          <div className="flex border-b border-outline/10 shrink-0">
            {(["ai", "preview", "info"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors
                  ${
                    rightTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-foreground/40 hover:text-foreground/70"
                  }`}
              >
                {tab === "ai" && <Bot size={13} />}
                {tab === "preview" && <Eye size={13} />}
                {tab === "info" && <GitCommit size={13} />}
                {tab === "ai"
                  ? "AI Chat"
                  : tab === "preview"
                    ? "Preview"
                    : "Info"}
              </button>
            ))}
          </div>

          {/* AI Chat */}
          {rightTab === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : msg.role === "error"
                            ? "bg-error/20 text-error"
                            : "bg-surface-variant text-foreground/60"
                      }`}
                    >
                      {msg.role === "user" ? (
                        "U"
                      ) : msg.role === "error" ? (
                        "!"
                      ) : (
                        <Bot size={12} />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap
                      ${
                        msg.role === "user"
                          ? "bg-primary/10 text-foreground ml-auto"
                          : msg.role === "error"
                            ? "bg-error/10 text-error"
                            : "bg-surface-variant/20 text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center">
                      <Loader2
                        size={12}
                        className="animate-spin text-primary"
                      />
                    </div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-surface-variant/20">
                      <span className="animate-pulse">Generating code…</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 border-t border-outline/10 shrink-0">
                <div className="flex gap-2">
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAiGenerate();
                      }
                    }}
                    placeholder="Describe what you want to build…"
                    rows={3}
                    className="flex-1 text-sm bg-surface-variant/10 border border-outline/10 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary/50 placeholder-foreground/30"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="self-end p-2.5 rounded-lg bg-primary text-white disabled:opacity-40 hover:bg-primary/80 transition-colors"
                  >
                    {isGenerating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <SendHorizonal size={16} />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-foreground/30 mt-1.5">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          )}

          {/* Preview */}
          {rightTab === "preview" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-outline/10 flex items-center justify-between shrink-0">
                <span className="text-xs text-foreground/40">Live Preview</span>
                <button
                  onClick={() => setPreviewSrc(fileContent)}
                  className="p-1 hover:text-primary transition-colors text-foreground/30"
                  title="Refresh"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              {selectedFile?.language === "html" ||
              selectedFile?.path.endsWith(".html") ? (
                <iframe
                  key={previewSrc}
                  srcDoc={previewSrc || fileContent}
                  className="flex-1 w-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-foreground/30 p-4 text-center">
                  <div>
                    <Eye size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">
                      Preview is available for HTML files.
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                      Select an <code>.html</code> file or ask AI to generate
                      one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          {rightTab === "info" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/40 mb-2">
                  Project Files
                </p>
                <p className="text-foreground/70">
                  {projectFiles.length} files
                </p>
                <p className="text-foreground/50 text-xs mt-1">
                  {(
                    projectFiles.reduce((sum, f) => sum + f.size, 0) / 1024
                  ).toFixed(1)}{" "}
                  KB total
                </p>
              </div>
              {selectedFile && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-foreground/40 mb-2">
                    Selected File
                  </p>
                  <p className="font-mono text-xs text-primary">
                    {selectedFile.path}
                  </p>
                  <p className="text-foreground/50 text-xs mt-1">
                    {selectedFile.language} ·{" "}
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-foreground/30 text-xs mt-1">
                    Updated {new Date(selectedFile.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wider text-foreground/40 mb-2">
                  Deploy
                </p>
                <p className="text-foreground/50 text-xs">
                  Export your project as JSON and deploy to Cloudflare Pages:
                </p>
                <button
                  onClick={handleExport}
                  className="mt-2 w-full text-xs bg-primary/10 text-primary px-3 py-2 rounded hover:bg-primary/20 transition-colors text-left"
                >
                  <Download size={12} className="inline mr-1" />
                  Download Project Export
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <footer className="flex items-center gap-4 px-4 py-1 border-t border-outline/10 bg-surface text-[11px] text-foreground/40 shrink-0">
        {selectedFile ? (
          <>
            <span className="text-primary/70">{selectedFile.path}</span>
            <span>{selectedFile.language}</span>
            <span>{(fileContent.length / 1024).toFixed(1)} KB</span>
            {isDirty ? (
              <span className="text-amber-400">● Unsaved</span>
            ) : (
              <span className="text-green-400">✓ Saved</span>
            )}
          </>
        ) : (
          <span>No file selected</span>
        )}
        <span className="ml-auto">Ctrl+S to save</span>
      </footer>

      {/* ── Commit Modal ────────────────────────────────────────────────────── */}
      {showCommitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Typography variant="title">Save Snapshot</Typography>
              <button onClick={() => setShowCommitModal(false)}>
                <X
                  size={20}
                  className="text-foreground/40 hover:text-foreground"
                />
              </button>
            </div>
            <input
              type="text"
              value={commitMessage}
              onChange={e => setCommitMessage(e.target.value)}
              placeholder="Describe what changed…"
              className="w-full bg-surface-variant/10 border border-outline/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
              onKeyDown={e => {
                if (e.key === "Enter") handleCommit();
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => setShowCommitModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCommit}
                disabled={isCommitting || !commitMessage.trim()}
              >
                {isCommitting ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : (
                  <GitCommit size={14} className="mr-1" />
                )}
                Save Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}
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

          {node.type === "directory" &&
            expandedFolders.has(node.path) &&
            node.children && (
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
