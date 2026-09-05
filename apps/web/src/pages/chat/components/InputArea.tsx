import {
  BookOpen,
  Loader2,
  Paperclip,
  PenTool,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { StitchPreviewCard } from "./StitchPreviewCard.js";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  stitchPreview: import("@/lib/stitch.js").StitchStarterScreen | null;
  stitchError: string | null;
  onUseStitchInPrompt: () => void;
  onClearStitch: () => void;
}

export function InputArea({
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
  stitchPreview,
  stitchError,
  onUseStitchInPrompt,
  onClearStitch,
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
                  const raw = window.prompt(
                    "Enter Figma file URL. Leave blank to generate a starter screen with Stitch.",
                  );
                  if (raw === null) return;
                  const url = raw.trim();
                  if (!url) {
                    if (stitchAvailable) {
                      void onGenerateWithStitch();
                    } else {
                      window.alert(
                        "No Figma URL provided. Configure Stitch to generate a starter screen instead.",
                      );
                    }
                    return;
                  }
                  try {
                    const parsed = new URL(url);
                    if (parsed.protocol !== "https:") {
                      window.alert("Please enter an HTTPS URL.");
                      return;
                    }
                    setInput(
                      input + (input ? "\n" : "") + `[Figma: ${parsed.href}]`,
                    );
                  } catch {
                    window.alert("Please enter a valid URL.");
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
                  const raw = window.prompt("Enter GitHub repository URL:");
                  if (!raw) return;
                  const url = raw.trim();
                  try {
                    const parsed = new URL(url);
                    if (parsed.protocol !== "https:") {
                      window.alert("Please enter an HTTPS URL.");
                      return;
                    }
                    setInput(
                      input +
                        (input ? "\n" : "") +
                        `[GitHub repo: ${parsed.href}]`,
                    );
                  } catch {
                    window.alert("Please enter a valid URL.");
                  }
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <GitHubIcon className="w-4 h-4 text-zinc-400 shrink-0" />
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

      {(stitchPreview || isGeneratingStitch || stitchError) && (
        <div className="mt-4">
          <StitchPreviewCard
            preview={stitchPreview}
            isGenerating={isGeneratingStitch}
            error={stitchError}
            onUseInPrompt={onUseStitchInPrompt}
            onClear={onClearStitch}
          />
        </div>
      )}
    </div>
  );
}
