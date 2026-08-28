import {
  buildDefaultVariables,
  renderTemplateFiles,
} from "@/lib/template-preview";
import { TemplateVariableForm } from "./TemplateVariableForm";
import { TemplateFilePreview } from "./TemplateFilePreview";
import { registry } from "@magicappdev/templates";
import { useState, useMemo } from "react";
import JSZip from "jszip";

interface TemplateCustomizerProps {
  templateId: string;
  onClose: () => void;
}

export function TemplateCustomizer({
  templateId,
  onClose,
}: TemplateCustomizerProps) {
  const template = useMemo(() => registry.get(templateId), [templateId]);
  const [variables, setVariables] = useState<
    Record<string, string | boolean | number>
  >(() => (template ? buildDefaultVariables(template.variables) : {}));
  const [downloading, setDownloading] = useState(false);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Template not found
      </div>
    );
  }

  const renderedFiles = renderTemplateFiles(template, variables);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      for (const file of renderedFiles) {
        zip.file(file.path, file.content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.slug}-generated.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to create zip:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              {template.name}
            </h2>
            <p className="text-[10px] text-zinc-500">
              {renderedFiles.length} files
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {downloading ? "Packing..." : "Download ZIP"}
        </button>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Variables form */}
        <div className="w-80 border-r border-zinc-800 overflow-y-auto p-4">
          <TemplateVariableForm
            variables={template.variables}
            values={variables}
            onChange={setVariables}
          />

          {/* Dependencies info */}
          {(template.dependencies || template.devDependencies) && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide">
                Dependencies
              </h3>
              {template.dependencies && (
                <div className="space-y-1">
                  {Object.entries(template.dependencies).map(([pkg, ver]) => (
                    <div
                      key={pkg}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-zinc-400 font-mono">{pkg}</span>
                      <span className="text-zinc-600 font-mono">{ver}</span>
                    </div>
                  ))}
                </div>
              )}
              {template.devDependencies && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">
                    Dev
                  </span>
                  {Object.entries(template.devDependencies).map(
                    ([pkg, ver]) => (
                      <div
                        key={pkg}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-zinc-400 font-mono">{pkg}</span>
                        <span className="text-zinc-600 font-mono">{ver}</span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: File preview */}
        <div className="flex-1 overflow-hidden p-4">
          <TemplateFilePreview files={renderedFiles} />
        </div>
      </div>
    </div>
  );
}
