import { Cloud, ExternalLink, X } from "lucide-react";
import { Dialog, Button } from "@cloudflare/kumo";

interface GeneratedProject {
  projectName: string;
  templateSlug: string;
  files: Array<{ path: string; content: string }>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

interface DeployModalProps {
  project: GeneratedProject;
  onClose: () => void;
}

export function DeployModal({ project, onClose }: DeployModalProps) {
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
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
