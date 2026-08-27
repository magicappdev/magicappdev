import React, { useState } from "react";

interface LivePreviewPanelProps {
  initialCode?: string;
  projectName?: string;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  initialCode = "<div class='p-6 text-center font-sans'><h1 class='text-2xl font-bold text-indigo-600'>Live App Preview</h1><p class='text-gray-500 mt-2'>Your generated code will render here in real-time.</p></div>",
  projectName = "Preview",
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const previewHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body class="bg-white text-slate-900">
        ${code}
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-300 text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span className="ml-2 font-medium">{projectName}</span>
        </div>
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === "preview"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === "code"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Code
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        {activeTab === "preview" ? (
          <iframe
            title="Live Preview"
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        ) : (
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 resize-none focus:outline-none"
            placeholder="Enter HTML/JSX code here..."
          />
        )}
      </div>
    </div>
  );
};
