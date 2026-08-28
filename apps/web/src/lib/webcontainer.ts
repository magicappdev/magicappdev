/**
 * WebContainer integration via StackBlitz SDK.
 * Embeds a Vite+React project in an iframe and manages files via VM API.
 */

import type { VM } from "@stackblitz/sdk";

let currentVM: VM | null = null;

/** Get the current VM instance */
export function getCurrentVM(): VM | null {
  return currentVM;
}

/** Set the current VM instance */
export function setCurrentVM(vm: VM | null): void {
  currentVM = vm;
}

/** Convert flat file map to StackBlitz ProjectFiles format */
export function toProjectFiles(
  files: Array<{ path: string; content: string }>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const f of files) {
    result[f.path] = f.content;
  }
  return result;
}

/** Check if WebContainers are supported in this browser */
export function isWebContainerSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.crossOriginIsolated) return false;
  const ua = navigator.userAgent;
  return (
    ua.includes("Chrome") || ua.includes("Chromium") || ua.includes("Edge")
  );
}
