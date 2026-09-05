import {
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  Cloud,
  Download,
  ExternalLink,
  FileCode,
  FolderOpen,
  Loader2,
  Paperclip,
  PenTool,
  Send,
  Sparkles,
  Star,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  generateStitchStarterScreen,
  isStitchConfigured,
  type StitchStarterScreen,
} from "@/lib/stitch.js";
import {
  useAgentConnection,
  useAgentMessages,
  usePreviewErrorListener,
} from "@/lib/agent-websocket.js";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  type Template,
  type TemplateCategory,
} from "./templates.js";
import { getPromptPresets, type PromptPreset } from "@magicappdev/shared/utils";
import { Button, Dialog, Input, TooltipProvider } from "@cloudflare/kumo";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Preview, { type PreviewFile } from "@/components/ui/Preview.js";
import { GitHubIcon as Github } from "@/components/ui/GitHubIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

// ─── TemplateGallery ─────────────────────────────────────────────────────────
function TemplateGallery({ onSelect }: { onSelect: (t: Template) => void }) {
  const [activeTab, setActiveTab] = useState<TemplateCategory>("all");
  const filtered =
    activeTab === "all"
      ? TEMPLATES
      : TEMPLATES.filter(t => t.category === activeTab);

  return (
    <div>
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === cat.id
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(template => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="group text-left rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
          >
            <div
              className={cn(
                "h-28 flex items-center justify-center text-4xl bg-gradient-to-br",
                template.gradientFrom,
                template.gradientTo,
              )}
            >
              {template.emoji}
            </div>
            <div className="p-3 bg-zinc-900">
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-white leading-tight">
                  {template.name}
                </span>
                {!template.free && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    PRO
                  </span>
                )}
                {template.category === "component" && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    COMPONENT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2">
                {template.description}
              </p>
              {template.preview && (
                <p className="text-[10px] text-zinc-600 line-clamp-1 mb-2">
                  {template.preview}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <Star className="w-2.5 h-2.5 fill-zinc-600" />
                <span>{template.likes.toLocaleString()}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── InputArea ────────────────────────────────────────────────────────────────
interface InputAreaProps {
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  isConnected: boolean;
  isGeneratingStitch: boolean;
  stitchAvailable: boolean;
  uploadedFile: File | null;
  onUploadFile: (file: File | null) => void;
  onGenerateWithStitch: () => void | Promise<void>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (promptText?: string) => void;
  isLanding?: boolean;
}

function InputArea({
  input,
  setInput,
  isLoading,
  isConnected,
  isGeneratingStitch,
  stitchAvailable,
  uploadedFile,
  onUploadFile,
  onGenerateWithStitch,
  textareaRef,
  onSubmit,
  isLanding = false,
}: InputAreaProps) {
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!attachmentOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node))
        setAttachmentOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [attachmentOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Attachment popover */}
      {attachmentOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden min-w-[220px]">
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Add Attachments
              </p>
            </div>
            <div className="p-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Upload className="w-4 h-4 text-zinc-400 shrink-0" />
                Upload a file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onUploadFile(file);
                    setAttachmentOpen(false);
                  }
                }}
              />
            </div>
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Add a Starting Point
              </p>
            </div>
            <div className="p-1 pb-2">
              <button
                type="button"
                onClick={() => {
                  setAttachmentOpen(false);
                  const url = window.prompt(
                    "Enter Figma file URL. Leave blank to generate a starter screen with Stitch.",
                  );
                  if (url === null) return;
                  if (url.trim()) {
                    setInput(input + (input ? "\n" : "") + `[Figma: ${url}]`);
                    return;
                  }
                  if (stitchAvailable) {
                    void onGenerateWithStitch();
                  } else {
                    window.alert(
                      "No Figma URL provided. Configure Stitch to generate a starter screen instead.",
                    );
                  }
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <PenTool className="w-4 h-4 text-zinc-400 shrink-0" />
                Import a Figma design
              </button>
              <button
                type="button"
                disabled={!stitchAvailable || isGeneratingStitch}
                onClick={() => {
                  setAttachmentOpen(false);
                  void onGenerateWithStitch();
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  stitchAvailable && !isGeneratingStitch
                    ? "text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-500 cursor-not-allowed",
                )}
              >
                {isGeneratingStitch ? (
                  <Loader2 className="w-4 h-4 text-zinc-400 shrink-0 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
                {isGeneratingStitch
                  ? "Generating with Stitch..."
                  : "Generate a screen with Stitch"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttachmentOpen(false);
                  const url = window.prompt("Enter GitHub repository URL:");
                  if (url)
                    setInput(
                      input + (input ? "\n" : "") + `[GitHub repo: ${url}]`,
                    );
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Github className="w-4 h-4 text-zinc-400 shrink-0" />
                Import an existing project
              </button>
              <button
                type="button"
                onClick={() => {
                  setAttachmentOpen(false);
                  document
                    .getElementById("template-gallery")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
                Browse templates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main input card */}
      <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl focus-within:border-zinc-500 transition-colors backdrop-blur-sm">
        {uploadedFile && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-300">
              <Upload className="w-3 h-3 text-zinc-400" />
              <span className="max-w-[160px] truncate">
                {uploadedFile.name}
              </span>
              <button
                type="button"
                onClick={() => onUploadFile(null)}
                className="ml-1 text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isLanding
              ? "Describe what you want to build… (Shift+Enter for new line)"
              : "Continue the conversation…"
          }
          className="w-full bg-transparent text-white placeholder-zinc-600 resize-none outline-none px-4 pt-4 pb-2 text-sm leading-relaxed"
          style={{ minHeight: isLanding ? "96px" : "60px", maxHeight: "200px" }}
          disabled={!isConnected}
          rows={isLanding ? 3 : 2}
        />
        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAttachmentOpen(v => !v)}
              className={cn(
                "p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors",
                attachmentOpen && "text-zinc-200 bg-zinc-800",
              )}
              title="Add attachment or starting point"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            {!isConnected && (
              <span className="text-[11px] text-zinc-600 ml-1">
                Reconnecting…
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking…
              </span>
            )}
            <button
              type="button"
              onClick={() => onSubmit()}
              disabled={!input.trim() || isLoading || !isConnected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isLanding ? "Create" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DeployModal ──────────────────────────────────────────────────────────────
function DeployModal({
  project,
  onClose,
}: {
  project: GeneratedProject;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog size="lg" className="p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Dialog.Title className="flex items-center gap-2 text-white">
              <Cloud className="w-5 h-5 text-orange-400" />
              Deploy to Cloudflare
            </Dialog.Title>
            <Dialog.Description className="text-sm text-zinc-400">
              Deploy{" "}
              <span className="font-medium text-zinc-100">
                {project.projectName}
              </span>{" "}
              to Cloudflare Workers or Pages.
            </Dialog.Description>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              One-Click Deploy to Cloudflare Pages
            </p>
            <Button
              type="button"
              variant="primary"
              className="w-full justify-center"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() =>
                window.open(
                  "https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/workers-sdk/tree/main/templates/worker-typescript",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Deploy Now
            </Button>
          </div>
          <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              CLI Deploy
            </p>
            <pre className="text-xs text-green-400 bg-black/60 rounded-lg p-3 overflow-x-auto leading-relaxed">
              {`cd ${project.projectName}\nnpx wrangler deploy`}
            </pre>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

// ─── ExportGitHubModal ────────────────────────────────────────────────────────
function ExportGitHubModal({
  project,
  onClose,
}: {
  project: GeneratedProject;
  onClose: () => void;
}) {
  const [repoName, setRepoName] = useState(
    project.projectName.toLowerCase().replace(/\s+/g, "-"),
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const { api } = await import("@/lib/api.js");
      try {
        const res = await api.unwrap<{ repoUrl: string }>(
          "/github/create-repo",
          {
            method: "POST",
            body: JSON.stringify({
              name: repoName,
              description: `Generated by MagicAppDev — ${project.projectName}`,
              isPrivate,
              files: project.files,
            }),
          },
        );
        setResultUrl(res.repoUrl ?? null);
        setStatus("done");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog size="lg" className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Dialog.Title className="flex items-center gap-2 text-white">
              <Github className="w-5 h-5 text-white" />
              Export to GitHub
            </Dialog.Title>
            <Dialog.Description className="text-sm text-zinc-400">
              Create a GitHub repository for{" "}
              <span className="font-medium text-zinc-100">
                {project.projectName}
              </span>{" "}
              and push all{" "}
              <span className="font-medium text-zinc-100">
                {project.files.length} files
              </span>
              .
            </Dialog.Description>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "done" && resultUrl ? (
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-green-300">
              ✓ Repository created!
            </p>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-400 underline break-all"
            >
              {resultUrl}
            </a>
          </div>
        ) : (
          <>
            <Input
              label="Repository Name"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
              placeholder="my-awesome-app"
              disabled={status === "loading"}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
                className="rounded border-zinc-600"
                disabled={status === "loading"}
              />
              Make repository private
            </label>

            {errorMsg && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Manual alternative
              </p>
              <pre className="text-xs text-green-400 bg-black/60 rounded-lg p-3 overflow-x-auto leading-relaxed">
                {`cd ${repoName || "my-app"}\ngit init && git add .\ngit commit -m "Initial commit"\ngh repo create ${repoName || "my-app"} --public --push --source=.`}
              </pre>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {status === "done" ? "Close" : "Cancel"}
          </Button>
          {status !== "done" && (
            <Button
              type="button"
              variant="primary"
              icon={
                status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Github className="w-4 h-4" />
                )
              }
              onClick={handleCreate}
              disabled={status === "loading" || !repoName.trim()}
            >
              {status === "loading" ? "Creating…" : "Create on GitHub"}
            </Button>
          )}
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

function StitchPreviewCard({
  preview,
  isGenerating,
  error,
  onUseInPrompt,
  onClear,
}: {
  preview: StitchStarterScreen | null;
  isGenerating: boolean;
  error: string | null;
  onUseInPrompt: () => void;
  onClear: () => void;
}) {
  if (!preview && !isGenerating && !error) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Stitch starter screen
          </div>
          <p className="text-sm text-zinc-400">
            {preview
              ? `Generated from: "${preview.prompt}"`
              : "Create a visual starting point from your prompt before sending it to the agent."}
          </p>
        </div>
        {(preview || error) && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            shape="square"
            aria-label="Dismiss Stitch preview"
            onClick={onClear}
            icon={<X className="w-4 h-4" />}
          />
        )}
      </div>

      {isGenerating && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/30 px-4 py-3 text-sm text-zinc-300">
          <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
          Generating a starter screen with Stitch...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {preview && (
        <div className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black/40">
            <img
              src={preview.imageUrl}
              alt={`Stitch preview for ${preview.prompt}`}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="primary"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() =>
                window.open(preview.htmlUrl, "_blank", "noopener,noreferrer")
              }
            >
              Open HTML
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={() =>
                window.open(preview.imageUrl, "_blank", "noopener,noreferrer")
              }
            >
              Open Screenshot
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onUseInPrompt}
            >
              Use in prompt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
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

  // New AI Studio Canvas Layout mode state
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
      } else if (type === "chat_chunk") {
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
      } else if (type === "chat_done") {
        let completedContent = "";
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.id === "streaming") {
            completedContent = last.content;
            return [...prev.slice(0, -1), { ...last, id: crypto.randomUUID() }];
          }
          return prev;
        });
        // Persist completed assistant message to session (best-effort)
        if (sessionIdRef.current && completedContent) {
          import("@/lib/api.js").then(({ api }) => {
            api
              .addChatMessage(sessionIdRef.current!, {
                role: "assistant",
                content: completedContent,
              })
              .catch(() => {});
          });
        }
        setIsLoading(false);
        if (data.suggestedTemplate) {
          setSuggestedTemplate(data.suggestedTemplate as string);
        }
        if (Array.isArray(data.suggestedPrompts)) {
          setSuggestedPrompts(data.suggestedPrompts as string[]);
        }
      } else if (type === "error") {
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
      } else if (type === "generation_start") {
        setIsGenerating(true);
        pendingFilesRef.current = [];
        setGeneratedProject(null);
      } else if (type === "generation_file") {
        pendingFilesRef.current = [
          ...pendingFilesRef.current,
          { path: data.path as string, content: data.content as string },
        ];
      } else if (type === "generation_complete") {
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
            } catch {
              // Silently fail auto-save; user can still use manual Save button
            }
          })();
        }
      } else if (type === "generation_error") {
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
      } else if (type === "tool_pending_approval") {
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
      } else if (type === "tool_result") {
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
      } else if (type === "tool_error") {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: `Tool error: ${(data.error as string) || "unknown"}`,
            timestamp: Date.now(),
          },
        ]);
      } else if (type === "wizard_start") {
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
        .catch(() => {});
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
                />
              </div>

              {(stitchPreview || isGeneratingStitch || stitchError) && (
                <div className="mb-8">
                  <StitchPreviewCard
                    preview={stitchPreview}
                    isGenerating={isGeneratingStitch}
                    error={stitchError}
                    onUseInPrompt={attachStitchPreviewToPrompt}
                    onClear={() => {
                      setStitchPreview(null);
                      setStitchError(null);
                    }}
                  />
                </div>
              )}

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
                      icon={<Github className="w-3.5 h-3.5" />}
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
      </div>
      {showUpgradeModal && upgradeTemplate && (
        <Dialog.Root open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <Dialog size="lg" className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold text-white">
                Upgrade to Pro
              </Dialog.Title>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Dialog.Description className="text-sm text-zinc-400 mb-6">
              <span className="text-white font-semibold">
                {upgradeTemplate.name}
              </span>{" "}
              is a PRO template. Upgrade to unlock all premium templates,
              priority support, and unlimited projects.
            </Dialog.Description>
            <div className="bg-zinc-800/60 rounded-xl p-4 mb-6 border border-zinc-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">Pro Plan</div>
                  <div className="text-xs text-zinc-400">
                    $0/month — Free during beta
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  All premium templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Unlimited projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Priority AI models
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  GitHub repo push
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe later
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  window.alert(
                    "Pro upgrades will be available soon. Stay tuned!",
                  );
                  setShowUpgradeModal(false);
                }}
              >
                Upgrade now
              </Button>
            </div>
          </Dialog>
        </Dialog.Root>
      )}
    </TooltipProvider>
  );
}
