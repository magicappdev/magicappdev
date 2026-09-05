import { registry } from "@magicappdev/templates-engine/registry";
import { LivePreviewPanel } from "@/components/LivePreviewPanel";
import type { Template } from "@magicappdev/templates-engine";
import { useAgentMessages } from "@/lib/agent-websocket";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

type WizardStep = "idea" | "template" | "name" | "preview" | "deploy";

interface WizardState {
  step: WizardStep;
  idea: string;
  selectedTemplate: Template | null;
  projectName: string;
  generatedFiles: Array<{ path: string; content: string }>;
  generatedProjectId: string | null;
  isGenerating: boolean;
  error: string | null;
}

const STORAGE_KEY = "magicappdev-wizard-state";

function loadSavedState(): Partial<WizardState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

function saveState(state: Partial<WizardState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function ProjectWizardPage() {
  const navigate = useNavigate();
  const saved = loadSavedState();

  const [state, setState] = useState<WizardState>({
    step: saved?.step || "idea",
    idea: saved?.idea || "",
    selectedTemplate: saved?.selectedTemplate || null,
    projectName: saved?.projectName || "",
    generatedFiles: saved?.generatedFiles || [],
    generatedProjectId: saved?.generatedProjectId || null,
    isGenerating: false,
    error: saved?.error || null,
  });

  const updateState = useCallback((patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useAgentMessages((type, data) => {
    if (type === "wizard_start") {
      const idea = (data.idea as string) || state.idea;
      const templateSlug = data.templateSlug as string | undefined;
      const projectName = data.projectName as string | undefined;

      const template = templateSlug ? registry.get(templateSlug) : null;

      if (template && projectName) {
        updateState({
          idea,
          selectedTemplate: template,
          projectName,
          step: "preview",
          isGenerating: true,
          error: null,
        });

        try {
          const result = registry.generate(
            template.slug || template.id,
            projectName,
            {},
          );
          if (result.success) {
            updateState({
              generatedFiles: result.files,
              isGenerating: false,
            });
          } else {
            updateState({
              error: result.error || "Failed to generate project",
              isGenerating: false,
            });
          }
        } catch (err) {
          updateState({
            error: err instanceof Error ? err.message : "Generation failed",
            isGenerating: false,
          });
        }
      } else if (template) {
        updateState({ idea, selectedTemplate: template, step: "name" });
      } else {
        updateState({ idea, step: "template" });
      }
    } else if (
      type === "wizard_select_template" &&
      typeof data.templateId === "string"
    ) {
      const template = registry.get(data.templateId as string);
      if (template) {
        updateState({ selectedTemplate: template, step: "name" });
      }
    } else if (type === "wizard_set_name" && typeof data.name === "string") {
      updateState({ projectName: data.name as string, step: "preview" });
    } else if (type === "wizard_complete") {
      updateState({ step: "deploy" });
    }
  });

  const handleIdeaSubmit = useCallback(
    (idea: string) => {
      updateState({ idea, step: "template" });
    },
    [updateState],
  );

  const handleTemplateSelect = useCallback(
    (template: Template) => {
      updateState({ selectedTemplate: template, step: "name" });
    },
    [updateState],
  );

  const handleNameSubmit = useCallback(
    (name: string) => {
      if (!state.selectedTemplate) return;
      updateState({
        projectName: name,
        step: "preview",
        isGenerating: true,
        error: null,
      });

      try {
        const result = registry.generate(
          state.selectedTemplate.slug || state.selectedTemplate.id,
          name,
          {},
        );

        if (result.success) {
          updateState({
            generatedFiles: result.files,
            isGenerating: false,
          });
        } else {
          updateState({
            error: result.error || "Failed to generate project",
            isGenerating: false,
          });
        }
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : "Generation failed",
          isGenerating: false,
        });
      }
    },
    [state.selectedTemplate, updateState],
  );

  const handleSaveProject = useCallback(async () => {
    if (!state.projectName || state.generatedFiles.length === 0) return;
    updateState({ isGenerating: true, error: null });

    try {
      const project = await api.createProject({ name: state.projectName });
      await api.bulkSaveProjectFiles(
        project.id,
        state.generatedFiles.map(f => ({ path: f.path, content: f.content })),
      );
      updateState({ generatedProjectId: project.id, isGenerating: false });
      navigate(`/projects/${project.id}/workspace`);
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Failed to save project",
        isGenerating: false,
      });
    }
  }, [state.projectName, state.generatedFiles, navigate, updateState]);

  const handleDownloadZip = useCallback(async () => {
    if (state.generatedFiles.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(state.projectName || "project") ?? zip;
    for (const file of state.generatedFiles) {
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
    a.download = `${state.projectName || "project"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.generatedFiles, state.projectName]);

  const goBack = useCallback(() => {
    const steps: WizardStep[] = [
      "idea",
      "template",
      "name",
      "preview",
      "deploy",
    ];
    const current = steps.indexOf(state.step);
    if (current > 0) {
      updateState({ step: steps[current - 1] });
    }
  }, [state.step, updateState]);

  const startOver = useCallback(() => {
    updateState({
      step: "idea",
      idea: "",
      selectedTemplate: null,
      projectName: "",
      generatedFiles: [],
      generatedProjectId: null,
      isGenerating: false,
      error: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, [updateState]);

  const entryFile =
    state.generatedFiles.find(f => f.path === "index.html") ||
    state.generatedFiles[0];
  const previewCode = entryFile?.content || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        {(
          ["idea", "template", "name", "preview", "deploy"] as WizardStep[]
        ).map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                state.step === step
                  ? "bg-primary text-white border-primary"
                  : idx <
                      ["idea", "template", "name", "preview", "deploy"].indexOf(
                        state.step,
                      )
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-zinc-800 text-zinc-500 border-zinc-700",
              )}
            >
              {idx + 1}
            </div>
            {idx < 4 && <div className="w-8 h-px bg-zinc-800" />}
          </div>
        ))}
      </div>

      {state.error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {state.step === "idea" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            What do you want to build?
          </h2>
          <p className="text-zinc-400">
            Describe your app in plain English. Our AI will generate it for you.
          </p>
          <textarea
            value={state.idea}
            onChange={e => updateState({ idea: e.target.value })}
            placeholder="e.g., A todo app with dark mode, drag-and-drop, and due dates..."
            className="w-full h-32 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-primary"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                state.idea.trim() && handleIdeaSubmit(state.idea.trim())
              }
              disabled={!state.idea.trim()}
              className="px-6 py-2 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {state.step === "template" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Choose a template
              </h2>
              <p className="text-zinc-400">
                Pick a starting point based on your idea
              </p>
            </div>
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {registry.getAll().length === 0 ? (
              <div className="col-span-full text-center py-12 text-zinc-500">
                No templates available yet. The agent will generate one for you.
              </div>
            ) : (
              registry.getAll().map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="text-left rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                >
                  <div
                    className={cn(
                      "h-28 flex items-center justify-center text-4xl bg-gradient-to-br",
                      (template.tags && template.tags[0]) ||
                        "from-zinc-700 to-zinc-600",
                    )}
                  >
                    {template.name.charAt(0)}
                  </div>
                  <div className="p-3 bg-zinc-900">
                    <span className="text-xs font-semibold text-white leading-tight block mb-1">
                      {template.name}
                    </span>
                    <p className="text-[11px] text-zinc-500 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {state.step === "name" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Name your project
              </h2>
              <p className="text-zinc-400">
                Give it a name that describes what it does
              </p>
            </div>
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
          <input
            type="text"
            value={state.projectName}
            onChange={e => updateState({ projectName: e.target.value })}
            placeholder="my-awesome-app"
            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-primary"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                state.projectName.trim() &&
                handleNameSubmit(state.projectName.trim())
              }
              disabled={!state.projectName.trim() || state.isGenerating}
              className="px-6 py-2 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {state.isGenerating ? "Generating…" : "Generate Project"}
            </button>
          </div>
        </div>
      )}

      {state.step === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Preview your project
              </h2>
              <p className="text-zinc-400">Review what was generated</p>
            </div>
            <button
              type="button"
              onClick={goBack}
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
          {state.isGenerating ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-zinc-400">Generating project files…</p>
              </div>
            </div>
          ) : (
            <>
              <LivePreviewPanel
                initialCode={previewCode}
                projectName={state.projectName || "Preview"}
              />
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-bold text-zinc-500 mb-2">
                  Generated files
                </p>
                <div className="flex flex-wrap gap-2">
                  {state.generatedFiles.map(file => (
                    <span
                      key={file.path}
                      className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded"
                    >
                      {file.path}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={startOver}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded-xl"
                >
                  Start Over
                </button>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="px-4 py-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-zinc-700"
                >
                  Download ZIP
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ step: "deploy" })}
                  className="px-6 py-2 bg-white text-black font-medium rounded-xl hover:bg-zinc-100"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {state.step === "deploy" && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Save & Deploy</h2>
          <p className="text-zinc-400">
            Choose what to do with your generated project
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleSaveProject}
              disabled={state.isGenerating}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-zinc-600 transition-colors"
            >
              <p className="text-sm font-semibold text-white mb-1">
                Save to Workspace
              </p>
              <p className="text-xs text-zinc-400">
                Store in your MagicAppDev projects and edit later
              </p>
            </button>
            <button
              type="button"
              onClick={handleDownloadZip}
              className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-zinc-600 transition-colors"
            >
              <p className="text-sm font-semibold text-white mb-1">
                Download ZIP
              </p>
              <p className="text-xs text-zinc-400">
                Export files and run locally
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
