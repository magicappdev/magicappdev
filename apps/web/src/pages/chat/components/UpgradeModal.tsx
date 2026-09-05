import { Dialog, Button } from "@cloudflare/kumo";
import type { Template } from "../templates.js";
import { Star, X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upgradeTemplate: Template | null;
}

export function UpgradeModal({
  open,
  onOpenChange,
  upgradeTemplate,
}: UpgradeModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog size="lg" className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Dialog.Title className="text-lg font-bold text-white">
            Upgrade to Pro
          </Dialog.Title>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Dialog.Description className="text-sm text-zinc-400 mb-6">
          <span className="text-white font-semibold">
            {upgradeTemplate?.name}
          </span>{" "}
          is a PRO template. Upgrade to unlock all premium templates, priority
          support, and unlimited projects.
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
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              window.alert("Pro upgrades will be available soon. Stay tuned!");
              onOpenChange(false);
            }}
          >
            Upgrade now
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
