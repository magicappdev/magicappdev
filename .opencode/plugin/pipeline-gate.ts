import { readFileSync, statSync } from "node:fs";

const MARKER = ".pipeline/last-verify.json";
const MAX_AGE_MS = 30 * 60 * 1000; // 30 Minuten

function checkVerifyMarker(): { ok: boolean; reason?: string } {
  try {
    const stat = statSync(MARKER);
    if (Date.now() - stat.mtimeMs > MAX_AGE_MS) {
      return {
        ok: false,
        reason:
          "Verification Marker ist älter als 30 Minuten. Bitte 'bun run verify' ausführen.",
      };
    }
    const data = JSON.parse(readFileSync(MARKER, "utf-8"));
    if (!data.passed)
      return { ok: false, reason: "Letzter Verification-Lauf war fehlerhaft." };
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason:
        "Kein Verification Marker (.pipeline/last-verify.json) vorhanden. Führe 'bun run verify' aus.",
    };
  }
}

export const PipelineGate = async () => {
  return {
    "tool.execute.before": async (input: any, output: any) => {
      if (input.tool !== "bash") return;
      const cmd = String(output?.args?.command ?? "");
      if (!/deploy/.test(cmd)) return;

      const check = checkVerifyMarker();
      if (!check.ok) {
        throw new Error(`[PipelineGate] Deploy abgebrochen: ${check.reason}`);
      }
    },
  };
};
