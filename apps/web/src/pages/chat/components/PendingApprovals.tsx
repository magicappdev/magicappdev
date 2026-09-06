import { Check, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils.js";

/** Mirrors the agent's PendingApproval WS payload (see packages/agent). */
export interface PendingApproval {
  id: string;
  tool: string;
  parameters: Record<string, unknown>;
  description: string;
  timestamp: number;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  respondingIds: Set<string>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function ageLabel(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function PendingApprovals({
  approvals,
  respondingIds,
  onApprove,
  onReject,
}: PendingApprovalsProps) {
  if (approvals.length === 0) return null;

  return (
    <section className="mb-3 space-y-2" aria-label="Pending approvals">
      {approvals.map(approval => {
        const responding = respondingIds.has(approval.id);
        const description =
          approval.description.length > 300
            ? `${approval.description.slice(0, 300)}…`
            : approval.description;
        return (
          <div
            key={approval.id}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm font-semibold text-amber-200">
                {approval.tool}
              </span>
              <span className="text-[11px] text-amber-200/60 ml-auto shrink-0">
                needs approval · {ageLabel(approval.timestamp)}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3 break-words">
              {description}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApprove(approval.id)}
                disabled={responding}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  responding
                    ? "bg-green-700/40 text-green-200/60 cursor-wait"
                    : "bg-green-600 text-white hover:bg-green-500",
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </span>
              </button>
              <button
                type="button"
                onClick={() => onReject(approval.id)}
                disabled={responding}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                  responding
                    ? "border-red-800 text-red-300/60 cursor-wait"
                    : "border-red-500/50 text-red-300 hover:bg-red-500/20",
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  Reject
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
