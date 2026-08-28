import { useEffect, useSyncExternalStore } from "react";
const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8788";
const AGENT_HOST = AGENT_URL.replace(/^https?:\/\//, "");
const WS_PROTOCOL = AGENT_URL.includes("workers.dev") ? "wss:" : "ws:";
const WS_URL = `${WS_PROTOCOL}//${AGENT_HOST}/agents/magic-agent/default`;

interface AgentMessage {
  type: string;
  data: Record<string, unknown>;
}

export interface PreviewErrorPayload {
  errorMessage: string;
  filePath: string;
  errorType: string;
  stackTrace?: string;
}

type MessageListener = (msg: AgentMessage) => void;
type ErrorListener = (payload: PreviewErrorPayload) => void;

let socket: WebSocket | null = null;
const stateSubscribers = new Set<(state: { connected: boolean }) => void>();
const messageSubscribers = new Set<MessageListener>();
const errorSubscribers = new Set<ErrorListener>();
const errorFingerprints = new Set<string>();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 3000;

function emitState() {
  const connected = socket?.readyState === WebSocket.OPEN;
  stateSubscribers.forEach(sub => {
    sub({ connected });
  });
}

function emitMessage(type: string, data: Record<string, unknown>) {
  messageSubscribers.forEach(sub => {
    sub({ type, data });
  });
}

function emitError(payload: PreviewErrorPayload) {
  const fp = `${payload.errorMessage}|${payload.filePath}|${payload.errorType}`;
  if (errorFingerprints.has(fp)) return;
  errorFingerprints.add(fp);
  if (errorFingerprints.size > 64) {
    const first = errorFingerprints.values().next().value;
    if (first) errorFingerprints.delete(first);
  }
  errorSubscribers.forEach(sub => {
    sub(payload);
  });
}

function connect(): void {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.addEventListener("open", () => {
    reconnectAttempts = 0;
    emitState();
  });

  socket.addEventListener("close", () => {
    socket = null;
    emitState();
    if (
      messageSubscribers.size + errorSubscribers.size > 0 &&
      reconnectAttempts < MAX_RECONNECT_ATTEMPTS
    ) {
      reconnectAttempts += 1;
      setTimeout(connect, RECONNECT_DELAY_MS);
    }
  });

  socket.addEventListener("error", () => {
    emitState();
  });

  socket.addEventListener("message", event => {
    try {
      const data = JSON.parse(event.data as string);
      if (data.type === "preview_error_ack" && data.payload) {
        emitError({
          errorMessage: (data.payload.errorMessage as string) || "",
          filePath: (data.payload.filePath as string) || "unknown",
          errorType: (data.payload.errorType as string) || "runtime",
          stackTrace: (data.payload.stackTrace as string) || "",
        });
      }
      emitMessage(data.type || "unknown", data);
    } catch {
      // ignore unparseable frames
    }
  });

  emitState();
}

function getSnapshot(): { connected: boolean } {
  return { connected: socket?.readyState === WebSocket.OPEN };
}

function getServerSnapshot(): { connected: boolean } {
  return { connected: false };
}

function subscribeState(onChange: () => void): () => void {
  stateSubscribers.add(onChange);
  connect();
  return () => {
    stateSubscribers.delete(onChange);
  };
}

export function useAgentConnection(): {
  connected: boolean;
  send: (payload: unknown) => boolean;
} {
  const state = useSyncExternalStore(
    subscribeState,
    getSnapshot,
    getServerSnapshot,
  );
  const send = (payload: unknown): boolean => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  };
  return { connected: state.connected, send };
}

export function useAgentMessages(
  onMessage: (type: string, data: Record<string, unknown>) => void,
): void {
  useEffect(() => {
    const sub: MessageListener = ({ type, data }) => onMessage(type, data);
    messageSubscribers.add(sub);
    connect();
    return () => {
      messageSubscribers.delete(sub);
    };
  }, [onMessage]);
}

export function usePreviewErrorListener(
  onError: (payload: PreviewErrorPayload) => void,
): void {
  useEffect(() => {
    const sub: ErrorListener = onError;
    errorSubscribers.add(sub);
    connect();
    return () => {
      errorSubscribers.delete(sub);
    };
  }, [onError]);
}

export function dispatchPreviewError(payload: PreviewErrorPayload): boolean {
  const fp = `${payload.errorMessage}|${payload.filePath}|${payload.errorType}`;
  if (errorFingerprints.has(fp)) return false;
  errorFingerprints.add(fp);
  if (errorFingerprints.size > 64) {
    const first = errorFingerprints.values().next().value;
    if (first) errorFingerprints.delete(first);
  }
  if (socket?.readyState !== WebSocket.OPEN) return false;
  socket.send(
    JSON.stringify({
      type: "preview_error",
      params: {
        errorMessage: payload.errorMessage,
        filePath: payload.filePath,
        errorType: payload.errorType,
        stackTrace: payload.stackTrace || "",
      },
    }),
  );
  return true;
}
