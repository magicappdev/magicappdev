import {
  ChevronDown,
  ChevronRight,
  Cloud,
  Download,
  FileCode,
  FolderOpen,
  Loader2,
  Sparkles,
  User as UserIcon,
  Bot,
} from "lucide-react";
import {
  isStitchConfigured,
  generateStitchStarterScreen,
  type StitchStarterScreen,
} from "@/lib/stitch.js";
import {
  useAgentConnection,
  useAgentMessages,
  usePreviewErrorListener,
} from "@/lib/agent-websocket.js";
import { getPromptPresets, type PromptPreset } from "@magicappdev/shared/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Preview, { type PreviewFile } from "@/components/ui/Preview.js";
import { Button, TooltipProvider } from "@cloudflare/kumo";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { MessageType } from "@magicappdev/shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import {
  TemplateGallery,
  InputArea,
  DeployModal,
  ExportGitHubModal,
  UpgradeModal,
} from "./components/index.js";

import { type Template } from "./templates.js";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratedProject {
  projectName: string;
  templateSlug: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [, setSuggestedTemplate] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [promptPresets, setPromptPresets] = useState<PromptPreset[]>([]);
  const [presetSeed, setPresetSeed] = useState(() => Date.now());
  const [generatedProject, setGeneratedProject] =
    useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [stitchPreview, setStitchPreview] =
    useState<StitchStarterScreen | null>(null);
  const [stitchError, setStitchError] = useState<string | null>(null);
  const [isGeneratingStitch, setIsGeneratingStitch] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTemplate, setUpgradeTemplate] = useState<Template | null>(null);

  const [canvasViewMode, setCanvasViewMode] = useState<
    "split" | "chat" | "preview"
  >("split");
  const [selectedModel, setSelectedModel] = useState<string>(
    "cloudflare-llama-3.3",
  );

  const pendingFilesRef = useRef<GeneratedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Initialize chat session for persistence
  useEffect(() => {
    const initSession = async () => {
      try {
        const { api } = await import("@/lib/api.js");
        const session = await api.createChatSession({ title: "New Chat" });
        sessionIdRef.current = session.id;

        // Load existing messages from session
        const { messages: savedMessages } = await api.getChatSession(
          session.id,
        );
        if (savedMessages.length > 0) {
          setMessages(
            savedMessages.map(m => ({
              id: m.id,
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
              timestamp: new Date(m.timestamp).getTime(),
            })),
          );
        }
      } catch {
        // Session creation is best-effort — chat still works without persistence
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    setPromptPresets(
      getPromptPresets({
        messageCount: messages.length,
        seed: presetSeed,
        count: 4,
      }),
    );
  }, [messages.length, presetSeed]);

  const handleRerollPrompts = useCallback(() => {
    setPresetSeed(prev => prev + 1);
  }, []);

  const handleAgentMessage = useCallback(
    (type: string, data: Record<string, unknown>) => {
      if (type === "history") {
        const historyMessages: Message[] = (
          (data.messages as Array<{
            id: string;
            role: string;
            content: string;
            timestamp: number;
          }>) || []
        ).map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
          timestamp: m.timestamp,
        }));
        setMessages(historyMessages);
      } else if (type === "history_cleared") {
        setMessages([]);
      } else if (type === MessageType.CHAT_CHUNK) {
        const chunk = (data.content as string) || "";
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant" && last.id === "streaming") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ];
          }
          return [
            ...prev,
            {
              id: "streaming",
              role: "assistant",
              content: chunk,
              timestamp: Date.now(),
            },
          ];
        });
      } else if (type === MessageType.CHAT_DONE) {
        let completedContent = "";
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.id === "streaming") {
            completedContent = last.content;
            return [...prev.slice(0, -1), { ...last, id: crypto.randomUUID() }];
          }
          return prev;
        });
        if (sessionIdRef.current && completedContent) {
          import("@/lib/api.js").then(({ api }) => {
            api
              .addChatMessage(sessionIdRef.current!, {
                role: "assistant",
                content: completedContent,
              })
              .catch(err =>
                console.warn("Failed to persist assistant message", err),
              );
          });
        }
        setIsLoading(false);
        if (data.suggestedTemplate) {
          setSuggestedTemplate(data.suggestedTemplate as string);
        }
        if (Array.isArray(data.suggestedPrompts)) {
          setSuggestedPrompts(data.suggestedPrompts as string[]);
        }
      } else if (type === MessageType.ERROR) {
        setIsLoading(false);
        setIsGenerating(false);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: `Error: ${data.message || "Something went wrong. Please try again."}`,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === MessageType.GENERATION_START) {
        setIsGenerating(true);
        pendingFilesRef.current = [];
        setGeneratedProject(null);
      } else if (type === MessageType.GENERATION_FILE) {
        pendingFilesRef.current = [
          ...pendingFilesRef.current,
          { path: data.path as string, content: data.content as string },
        ];
      } else if (type === MessageType.GENERATION_COMPLETE) {
        const files = pendingFilesRef.current;
        setGeneratedProject({
          projectName: data.projectName as string,
          templateSlug: data.templateSlug as string,
          files,
          dependencies: (data.dependencies as Record<string, string>) || {},
          devDependencies:
            (data.devDependencies as Record<string, string>) || {},
        });
        if (files.length > 0) {
          setExpandedFiles(new Set([files[0].path]));
        }
        setIsGenerating(false);

        // Auto-save the generated project to the user's workspace
        if (files.length > 0) {
          (async () => {
            try {
              const { api } = await import("@/lib/api.js");
              const project = await api.createProject({
                name: data.projectName as string,
              });
              await api.bulkSaveProjectFiles(
                project.id,
                files.map(f => ({
                  path: f.path,
                  content: f.content,
                })),
              );

              setMessages(prev => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "system",
                  content: `Project saved to your workspace. ${files.length} files created.`,
                  timestamp: Date.now(),
                },
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: `I built ${data.projectName} with ${files.length} files. You can continue editing it in the workspace, download it as ZIP, or push it to GitHub.`,
                  timestamp: Date.now(),
                },
              ]);
            } catch (err) {
              console.warn("Auto-save failed", err);
            }
          })();
        }
      } else if (type === MessageType.GENERATION_ERROR) {
        setIsGenerating(false);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: `Generation failed: ${data.error || "An error occurred during project generation."}`,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === MessageType.TOOL_PENDING_APPROVAL) {
        const approval = data.approval as
          | {
              id: string;
              tool: string;
              description?: string;
            }
          | undefined;
        if (approval) {
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "system",
              content: `Tool "${approval.tool}" needs approval: ${approval.description || "auto-triggered"}. Open the workspace to approve.`,
              timestamp: Date.now(),
            },
          ]);
        }
      } else if (type === MessageType.TOOL_RESULT) {
        const tool = data.tool as string;
        const result = data.result as Record<string, unknown> | undefined;

        let content: string;
        if (tool === "patchError" && result) {
          const applied = result.applied
            ? "and applied"
            : " (manual apply needed)";
          const summary = (result.summary as string) || "Patch generated";
          const path = (result.filePath as string) || "";
          content = `Auto-fix ${applied}: ${summary}${path ? `\nFile: ${path}` : ""}`;
        } else {
          const resultStr =
            typeof data.result === "string"
              ? data.result
              : JSON.stringify(data.result);
          content = `Tool "${tool}" executed:\n${resultStr?.slice(0, 800)}`;
        }

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === MessageType.TOOL_ERROR) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: `Tool error: ${(data.error as string) || "unknown"}`,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === MessageType.WIZARD_START) {
        navigate("/wizard");
      }
    },
    [],
  );

  const { connected, send } = useAgentConnection();
  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);
  useAgentMessages(handleAgentMessage);
  usePreviewErrorListener(payload => {
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "system",
        content: `Preview error reported from ${payload.filePath}: ${payload.errorMessage}. Agent is analyzing a patch…`,
        timestamp: Date.now(),
      },
    ]);
  });

  const handleSubmit = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSuggestedPrompts([]);
    setPromptPresets([]);
    setIsLoading(true);
    setSuggestedTemplate(null);

    send({
      type: "chat",
      content: userMsg.content,
      model: selectedModel,
    });

    // Persist user message to session (best-effort)
    if (sessionIdRef.current) {
      const { api } = await import("@/lib/api.js");
      api
        .addChatMessage(sessionIdRef.current, {
          role: "user",
          content: userMsg.content,
        })
        .catch(err => console.warn("Failed to persist user message", err));
    }
  };

  const toggleFileExpanded = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const downloadProject = async () => {
    if (!generatedProject) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(generatedProject.projectName) ?? zip;
      for (const file of generatedProject.files) {
        folder.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedProject.projectName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const projectContent = generatedProject.files
        .map(f => `=== ${f.path} ===\n${f.content}`)
        .join("\n\n");
      const blob = new Blob([projectContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedProject.projectName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleGenerateWithStitch = async () => {
    const prompt = input.trim();
    if (!prompt) {
      window.alert(
        "Describe what you want to build before generating a Stitch starter screen.",
      );
      return;
    }
    if (!isStitchConfigured()) {
      window.alert("Stitch is not configured for this environment.");
      return;
    }

    setIsGeneratingStitch(true);
    setStitchError(null);

    try {
      const preview = await generateStitchStarterScreen(prompt);
      setStitchPreview(preview);
    } catch (error) {
      setStitchError(
        error instanceof Error
          ? error.message
          : "Failed to generate a Stitch starter screen.",
      );
    } finally {
      setIsGeneratingStitch(false);
    }
  };

  const attachStitchPreviewToPrompt = () => {
    if (!stitchPreview) return;
    setInput(prev =>
      [
        prev.trim(),
        `Use this Stitch starter screen as inspiration: ${stitchPreview.htmlUrl}`,
        `Screenshot reference: ${stitchPreview.imageUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    textareaRef.current?.focus();
  };

  const handleSaveToProject = useCallback(async () => {
    if (!generatedProject || isSaving) return;
    setIsSaving(true);
    try {
      const { api } = await import("@/lib/api.js");
      const project = await api.createProject({
        name: generatedProject.projectName,
      });
      await api.bulkSaveProjectFiles(
        project.id,
        generatedProject.files.map(f => ({
          path: f.path,
          content: f.content,
        })),
      );
      navigate(`/projects/${project.id}/workspace`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setIsSaving(false);
    }
  }, [generatedProject, isSaving, navigate]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden">
        {showDeployModal && generatedProject && (
          <DeployModal
            project={generatedProject}
            onClose={() => setShowDeployModal(false)}
          />
        )}
        {showExportModal && generatedProject && (
          <ExportGitHubModal
            project={generatedProject}
            onClose={() => setShowExportModal(false)}
          />
        )}

        {messages.length === 0 ? (
          /* ── LANDING STATE ── */
          <div className="flex-1 overflow-y-auto">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-24">
              <div className="flex justify-center mb-8">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border",
                    isConnected
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10",
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isConnected
                        ? "bg-green-400"
                        : "bg-yellow-400 animate-pulse",
                    )}
                  />
                  {isConnected ? "Agent connected" : "Connecting to agent…"}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-center leading-tight mb-3">
                <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  What do you want to create?
                </span>
              </h1>
              <p className="text-zinc-500 text-center text-base mb-10">
                Describe your idea and MagicAgent will build it for you — no
                code needed.
              </p>

              <div className="mb-6">
                <InputArea
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  isConnected={isConnected}
                  isGeneratingStitch={isGeneratingStitch}
                  stitchAvailable={isStitchConfigured()}
                  uploadedFile={uploadedFile}
                  onUploadFile={setUploadedFile}
                  onGenerateWithStitch={handleGenerateWithStitch}
                  textareaRef={textareaRef}
                  onSubmit={handleSubmit}
                  isLanding
                  stitchPreview={stitchPreview}
                  stitchError={stitchError}
                  onUseStitchInPrompt={attachStitchPreviewToPrompt}
                  onClearStitch={() => {
                    setStitchPreview(null);
                    setStitchError(null);
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-16">
                {promptPresets.map(preset => (
                  <button
                    key={`${preset.label}-${preset.prompt}`}
                    type="button"
                    onClick={() => {
                      setInput(preset.prompt);
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/60 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleRerollPrompts}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-800 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
                  aria-label="Refresh suggestions"
                >
                  <Sparkles className="w-3 h-3" />
                  Reroll
                </button>
              </div>

              <div id="template-gallery">
                <h2 className="text-lg font-semibold text-zinc-200 mb-5">
                  Start from a template
                </h2>
                <TemplateGallery
                  onSelect={t => {
                    if (!t.free && !user?.isPro) {
                      setUpgradeTemplate(t);
                      setShowUpgradeModal(true);
                      return;
                    }
                    setInput(t.prompt);
                    textareaRef.current?.focus();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── AI STUDIO CANVAS SPLIT STATE ── */
          <>
            {/* Header bar with AI Studio Mode Switcher */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">
                    AI Studio Canvas
                  </span>
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isConnected
                        ? "bg-green-400"
                        : "bg-yellow-400 animate-pulse",
                    )}
                  />
                </div>
                <div className="h-4 w-px bg-zinc-800" />
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded-lg px-2 py-1 outline-none"
                >
                  <option value="cloudflare-llama-3.3">
                    Cloudflare Llama 3.3
                  </option>
                  <option value="deepseek-r1">DeepSeek R1</option>
                  <option value="openai-gpt-4o">OpenAI GPT-4o</option>
                  <option value="anthropic-claude-3.5">
                    Anthropic Claude 3.5
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("split")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                      canvasViewMode === "split"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    Split View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("chat")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                      canvasViewMode === "chat"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    Chat Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasViewMode("preview")}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                      canvasViewMode === "preview"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white",
                    )}
                  >
                    Canvas Preview
                  </button>
                </div>

                {generatedProject && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={handleSaveToProject}
                      disabled={isSaving}
                      icon={
                        isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FolderOpen className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={downloadProject}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      ZIP
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowExportModal(true)}
                      icon={<GitHubIcon className="w-3.5 h-3.5" />}
                    >
                      GitHub
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => setShowDeployModal(true)}
                      icon={<Cloud className="w-3.5 h-3.5" />}
                    >
                      Deploy
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Split Canvas Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Chat & Prompt Flow */}
              <div
                className={cn(
                  "flex flex-col border-r border-zinc-800 bg-[#0a0a0a] transition-all duration-300",
                  canvasViewMode === "split" && "w-1/2",
                  canvasViewMode === "chat" && "w-full",
                  canvasViewMode === "preview" && "hidden",
                )}
              >
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-2xl",
                        msg.role === "user"
                          ? "ml-auto flex-row-reverse"
                          : "mr-auto",
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold",
                          msg.role === "user"
                            ? "bg-zinc-700 text-zinc-200"
                            : "bg-orange-500/20 text-orange-400",
                        )}
                      >
                        {msg.role === "user" ? (
                          <UserIcon className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-lg",
                          msg.role === "user"
                            ? "bg-zinc-800 text-zinc-100 rounded-tr-none"
                            : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800",
                          msg.id === "streaming" && "border-orange-500/30",
                        )}
                      >
                        {msg.content}
                        {msg.id === "streaming" && (
                          <span className="inline-block w-1 h-4 ml-0.5 bg-orange-400 animate-pulse rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                      <span className="text-sm">
                        Building application architecture & writing files…
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {(suggestedPrompts.length > 0 || promptPresets.length > 0) &&
                  !isLoading && (
                    <div className="px-4 pb-2 overflow-x-auto">
                      <div className="flex gap-2">
                        {(suggestedPrompts.length > 0
                          ? suggestedPrompts
                          : promptPresets.map(p => p.prompt)
                        ).map(prompt => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handleSubmit(prompt)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/60 whitespace-nowrap transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            {prompt}
                          </button>
                        ))}
                        {suggestedPrompts.length === 0 && (
                          <button
                            type="button"
                            onClick={handleRerollPrompts}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 whitespace-nowrap transition-colors"
                            aria-label="Refresh suggestions"
                          >
                            <Sparkles className="w-3 h-3" />
                            Reroll
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 shrink-0">
                  <InputArea
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    isConnected={isConnected}
                    isGeneratingStitch={isGeneratingStitch}
                    stitchAvailable={isStitchConfigured()}
                    uploadedFile={uploadedFile}
                    onUploadFile={setUploadedFile}
                    onGenerateWithStitch={handleGenerateWithStitch}
                    textareaRef={textareaRef}
                    onSubmit={handleSubmit}
                    stitchPreview={stitchPreview}
                    stitchError={stitchError}
                    onUseStitchInPrompt={attachStitchPreviewToPrompt}
                    onClearStitch={() => {
                      setStitchPreview(null);
                      setStitchError(null);
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Live App Canvas Preview & File Explorer */}
              <div
                className={cn(
                  "flex flex-col bg-zinc-950 overflow-hidden transition-all duration-300",
                  canvasViewMode === "split" && "w-1/2",
                  canvasViewMode === "chat" && "hidden",
                  canvasViewMode === "preview" && "w-full",
                )}
              >
                {generatedProject ? (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-semibold text-white">
                          {generatedProject.projectName}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          ({generatedProject.files.length} files)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPreview(true)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                            showPreview
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:text-white",
                          )}
                        >
                          Live Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPreview(false)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                            !showPreview
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:text-white",
                          )}
                        >
                          Files
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {showPreview ? (
                        <div className="h-full">
                          <Preview
                            files={generatedProject.files.map(
                              f =>
                                ({
                                  path: f.path,
                                  content: f.content,
                                }) as PreviewFile,
                            )}
                            activeFile={previewFile || undefined}
                            onFileSelect={setPreviewFile}
                            className="h-full"
                          />
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                            {generatedProject.files.map(file => (
                              <div key={file.path}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleFileExpanded(file.path);
                                    setPreviewFile(file.path);
                                  }}
                                  className="flex items-center w-full gap-2 px-4 py-2.5 text-left hover:bg-zinc-800/40 transition-colors"
                                >
                                  {expandedFiles.has(file.path) ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                                  )}
                                  <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                  <span className="font-mono text-xs text-zinc-300">
                                    {file.path}
                                  </span>
                                </button>
                                {expandedFiles.has(file.path) && (
                                  <pre className="px-4 pb-3 overflow-x-auto text-xs bg-black/60 border-t border-zinc-800/40">
                                    <code className="text-green-400">
                                      {file.content}
                                    </code>
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                    <Sparkles className="w-10 h-10 text-zinc-700 mb-3 animate-pulse" />
                    <p className="text-sm font-medium text-zinc-300">
                      No application generated yet
                    </p>
                    <p className="text-xs text-zinc-500 max-w-sm mt-1">
                      Type your app idea in the chat or select a template to
                      generate a live preview canvas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          upgradeTemplate={upgradeTemplate}
        />
      </div>
    </TooltipProvider>
  );
}
