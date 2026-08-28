import { Monitor, Code } from "lucide-react";

export type PreviewMode = "cloud" | "live";

interface PreviewModeToggleProps {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
  liveSupported?: boolean;
}

export function PreviewModeToggle({
  mode,
  onChange,
  liveSupported = true,
}: PreviewModeToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
      <button
        type="button"
        onClick={() => onChange("cloud")}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
          mode === "cloud"
            ? "bg-zinc-700 text-zinc-200"
            : "text-zinc-500 hover:text-zinc-400"
        }`}
      >
        <Monitor size={12} />
        Cloud
      </button>
      <button
        type="button"
        onClick={() => liveSupported && onChange("live")}
        disabled={!liveSupported}
        title={
          liveSupported
            ? "Run in-browser via WebContainer"
            : "Requires Chrome/Edge with cross-origin isolation"
        }
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
          mode === "live"
            ? "bg-zinc-700 text-zinc-200"
            : liveSupported
              ? "text-zinc-500 hover:text-zinc-400"
              : "text-zinc-700 cursor-not-allowed"
        }`}
      >
        <Code size={12} />
        Live
      </button>
    </div>
  );
}
