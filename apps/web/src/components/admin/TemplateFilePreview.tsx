import type { RenderedFile } from "@/lib/template-preview";
import { getFileLanguage } from "@/lib/template-preview";
import { useState, useEffect, useRef } from "react";

interface TemplateFilePreviewProps {
  files: RenderedFile[];
}

export function TemplateFilePreview({ files }: TemplateFilePreviewProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const codeRef = useRef<HTMLElement>(null);
  const selected = files[selectedIdx];

  // Re-highlight when selection changes
  useEffect(() => {
    if (!codeRef.current) return;
    let cancelled = false;

    import("highlight.js/lib/core").then(hljs => {
      if (cancelled) return;
      // Register only the languages we need
      import("highlight.js/lib/languages/typescript").then(m => {
        if (!cancelled) hljs.default.registerLanguage("typescript", m.default);
      });
      import("highlight.js/lib/languages/javascript").then(m => {
        if (!cancelled) hljs.default.registerLanguage("javascript", m.default);
      });
      import("highlight.js/lib/languages/json").then(m => {
        if (!cancelled) hljs.default.registerLanguage("json", m.default);
      });
      import("highlight.js/lib/languages/xml").then(m => {
        if (!cancelled) hljs.default.registerLanguage("xml", m.default);
      });
      import("highlight.js/lib/languages/css").then(m => {
        if (!cancelled) hljs.default.registerLanguage("css", m.default);
      });
      import("highlight.js/lib/languages/markdown").then(m => {
        if (!cancelled) hljs.default.registerLanguage("markdown", m.default);
      });
      import("highlight.js/lib/languages/ini").then(m => {
        if (!cancelled) hljs.default.registerLanguage("toml", m.default);
      });

      if (codeRef.current) {
        codeRef.current.removeAttribute("data-highlighted");
        hljs.default.highlightElement(codeRef.current);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedIdx]);

  if (!files.length) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No files generated
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* File tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-1 mb-3">
        {files.map((f, i) => (
          <button
            key={f.path}
            type="button"
            onClick={() => setSelectedIdx(i)}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
              i === selectedIdx
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent"
            }`}
          >
            {f.path.split("/").pop()}
          </button>
        ))}
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-auto rounded-lg bg-zinc-950 border border-zinc-800">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
          <span className="text-[10px] text-zinc-500 font-mono">
            {selected.path}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono">
            {getFileLanguage(selected.path)}
          </span>
        </div>
        <pre className="p-4 overflow-auto text-xs leading-relaxed">
          <code
            ref={codeRef}
            className={`language-${getFileLanguage(selected.path)}`}
          >
            {selected.content}
          </code>
        </pre>
      </div>
    </div>
  );
}
