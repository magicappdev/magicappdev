import { ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import type { StitchStarterScreen } from "@/lib/stitch.js";
import { Button } from "@cloudflare/kumo";
import React from "react";

interface StitchPreviewCardProps {
  preview: StitchStarterScreen | null;
  isGenerating: boolean;
  error: string | null;
  onUseInPrompt: () => void;
  onClear: () => void;
}

export function StitchPreviewCard({
  preview,
  isGenerating,
  error,
  onUseInPrompt,
  onClear,
}: StitchPreviewCardProps) {
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
