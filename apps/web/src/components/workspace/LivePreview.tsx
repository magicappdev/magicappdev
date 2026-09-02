/**
 * LivePreview Component
 *
 * Provides real-time preview of project with iframe and hot reload.
 * Uses srcdoc + postMessage relay as lightweight fallback.
 */

import { Loader2, RefreshCw, AlertCircle, Code2 } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";

interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

interface LivePreviewProps {
  projectId: string;
  files: ProjectFile[];
}

export function LivePreview({ files }: LivePreviewProps) {
  const [previewStatus, setPreviewStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{
      type: "log" | "error" | "warn";
      message: string;
      timestamp: number;
    }>
  >([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFilesHashRef = useRef<string>("");

  const previewHtml = useMemo(() => {
    return buildPreviewHtml(files);
  }, [files]);

  // Auto-reload on file changes via postMessage
  useEffect(() => {
    if (previewStatus !== "ready") return;

    const newHash = hashFiles(files);
    if (newHash === lastFilesHashRef.current) return;

    lastFilesHashRef.current = newHash;

    if (reloadTimeoutRef.current) {
      clearTimeout(reloadTimeoutRef.current);
    }

    reloadTimeoutRef.current = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      try {
        iframe.contentWindow.postMessage(
          { type: "MAGICAPPDEV_UPDATE_HTML", html: previewHtml },
          "*",
        );
      } catch {
        handleReload();
      }
    }, 800);

    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, [files, previewStatus, previewHtml]);

  // Polling fallback for hot-reload
  useEffect(() => {
    if (previewStatus !== "ready") return;

    pollIntervalRef.current = setInterval(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;

      try {
        iframe.contentWindow.postMessage({ type: "MAGICAPPDEV_PING" }, "*");
      } catch {
        // ignore cross-origin errors
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [previewStatus]);

  const handleReload = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setPreviewStatus("loading");
    lastFilesHashRef.current = "";
    iframe.srcdoc = previewHtml;
  };

  // Inject console interceptor into iframe
  const injectConsoleInterceptor = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        { type: "MAGICAPPDEV_CONSOLE_INIT" },
        "*",
      );
    } catch (err) {
      console.debug("Could not inject console interceptor:", err);
    }
  };

  // Listen for console messages and error relays from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "MAGICAPPDEV_CONSOLE") {
        setConsoleLogs(prev => [
          ...prev,
          {
            type: event.data.level,
            message: event.data.message,
            timestamp: Date.now(),
          },
        ]);
      } else if (event.data.type === "MAGICAPPDEV_PREVIEW_ERROR") {
        window.dispatchEvent(
          new CustomEvent("MAGICAPPDEV_IFRAME_ERROR", {
            detail: {
              errorMessage: event.data.errorMessage || "Unknown error",
              filePath: event.data.filePath || "unknown",
              errorType: event.data.errorType || "runtime",
              stackTrace: event.data.stackTrace || "",
            },
          }),
        );
      } else if (event.data.type === "MAGICAPPDEV_PONG") {
        // Polling response received
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Preview Content */}
      <div className="flex-1 relative bg-background">
        <iframe
          ref={iframeRef}
          srcDoc={previewHtml}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => {
            setPreviewStatus("ready");
            lastFilesHashRef.current = hashFiles(files);
            injectConsoleInterceptor();
          }}
          onError={() => setPreviewStatus("error")}
        />

        {/* Loading Overlay */}
        {previewStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <Typography variant="body" className="text-sm">
                Loading preview...
              </Typography>
            </div>
          </div>
        )}

        {/* Error State */}
        {previewStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
              <Typography variant="body" className="text-sm text-error">
                Preview failed to load
              </Typography>
              <Button size="sm" className="mt-2" onClick={handleReload}>
                <RefreshCw size={14} className="mr-1" /> Retry
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Console Panel */}
      {showConsole && (
        <div className="h-48 border-t border-outline/10 bg-surface-variant flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-outline/10">
            <Typography
              variant="label"
              className="text-xs uppercase tracking-wider"
            >
              Console ({consoleLogs.length})
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="text"
                size="sm"
                className="text-xs"
                onClick={() => setConsoleLogs([])}
              >
                Clear
              </Button>
              <Button
                variant="text"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowConsole(false)}
              >
                ×
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
            {consoleLogs.length === 0 ? (
              <div className="text-foreground/30 text-center py-4">
                No console output
              </div>
            ) : (
              consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.type === "error"
                      ? "text-error"
                      : log.type === "warn"
                        ? "text-yellow-500"
                        : "text-foreground"
                  }`}
                >
                  <span className="opacity-50">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Console Toggle Bar */}
      <div className="border-t border-outline/10 bg-surface p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" onClick={handleReload}>
            <RefreshCw size={14} className="mr-1" /> Reload
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => setShowConsole(!showConsole)}
          >
            <Code2 size={14} className="mr-1" /> Console
          </Button>
        </div>

        <div className="flex items-center gap-1 text-xs text-foreground/40">
          <div
            className={`w-2 h-2 rounded-full ${
              previewStatus === "ready"
                ? "bg-green-500"
                : previewStatus === "loading"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
            }`}
          />
          {previewStatus === "ready" ? "Ready" : previewStatus}
        </div>
      </div>
    </div>
  );
}

function buildPreviewHtml(files: ProjectFile[]): string {
  const indexFile = files.find(
    f => f.path.endsWith("index.html") || f.path === "index.html",
  );

  if (indexFile) {
    return indexFile.content;
  }

  const cssFiles = files.filter(f => f.path.endsWith(".css"));
  const scssFiles = files.filter(
    f => f.path.endsWith(".scss") || f.path.endsWith(".sass"),
  );
  const reactFiles = files.filter(
    f =>
      f.path.endsWith(".tsx") ||
      f.path.endsWith(".jsx") ||
      f.path.endsWith(".ts") ||
      f.path.endsWith(".js"),
  );

  const cssContent = cssFiles
    .map(f => `/* ${f.path} */\n${f.content}`)
    .join("\n\n");

  const scssContent = scssFiles
    .map(f => `/* ${f.path} */\n${f.content}`)
    .join("\n\n");

  if (reactFiles.length > 0) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/sass.js@1.0.2/dist/sass.sync.js"></script>
  ${cssContent ? `<style>${cssContent}</style>` : ""}
  ${
    scssContent
      ? `<script>
      // Compile SCSS to CSS client-side
      (function() {
        try {
          var compiled = Sass.compileString(\`${scssContent.replace(/`/g, "\\`")}\`);
          var styleEl = document.createElement('style');
          styleEl.textContent = compiled.css.toString();
          document.head.appendChild(styleEl);
        } catch (e) {
          window.parent.postMessage({
            type: 'MAGICAPPDEV_PREVIEW_ERROR',
            errorMessage: 'SCSS compile error: ' + e.message,
            filePath: 'styles',
            errorType: 'build',
            stackTrace: ''
          }, '*');
        }
      })();
    </script>`
      : ""
  }
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'MAGICAPPDEV_PREVIEW_ERROR',
        errorMessage: String(message),
        filePath: source || 'unknown',
        errorType: 'runtime',
        stackTrace: error ? error.stack || '' : ''
      }, '*');
    };
    window.addEventListener('unhandledrejection', function(event) {
      var reason = event.reason;
      window.parent.postMessage({
        type: 'MAGICAPPDEV_PREVIEW_ERROR',
        errorMessage: reason instanceof Error ? reason.message : String(reason),
        filePath: 'promise',
        errorType: 'runtime',
        stackTrace: reason instanceof Error ? reason.stack || '' : ''
      }, '*');
    });
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'MAGICAPPDEV_CONSOLE_INIT') {
        var original = { log: console.log, error: console.error, warn: console.warn };
        console.log = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'log', message: Array.from(arguments).join(' ') }, '*'); original.log.apply(console, arguments); };
        console.error = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'error', message: Array.from(arguments).join(' ') }, '*'); original.error.apply(console, arguments); };
        console.warn = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'warn', message: Array.from(arguments).join(' ') }, '*'); original.warn.apply(console, arguments); };
      }
      if (event.data && event.data.type === 'MAGICAPPDEV_UPDATE_HTML') {
        document.open();
        document.write(event.data.html);
        document.close();
      }
      if (event.data && event.data.type === 'MAGICAPPDEV_PING') {
        window.parent.postMessage({ type: 'MAGICAPPDEV_PONG' }, '*');
      }
    });
  </script>
  <div id="root"></div>
  <script type="text/babel" data-plugins="proposal-decorators" data-presets="react">
    ${reactFiles.map(f => `// ${f.path}\n${f.content}`).join("\n\n")}
  </script>
</body>
</html>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  ${cssContent ? `<style>${cssContent}</style>` : ""}
  ${
    scssContent
      ? `<script>
      (function() {
        try {
          var compiled = Sass.compileString(\`${scssContent.replace(/`/g, "\\`")}\`);
          var styleEl = document.createElement('style');
          styleEl.textContent = compiled.css.toString();
          document.head.appendChild(styleEl);
        } catch (e) {
          window.parent.postMessage({
            type: 'MAGICAPPDEV_PREVIEW_ERROR',
            errorMessage: 'SCSS compile error: ' + e.message,
            filePath: 'styles',
            errorType: 'build',
            stackTrace: ''
          }, '*');
        }
      })();
    </script>`
      : ""
  }
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { margin: 0 0 1rem; font-size: 2rem; }
    p { margin: 0; opacity: 0.9; }
    .badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba(255,255,255,0.2);
      border-radius: 9999px;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'MAGICAPPDEV_PREVIEW_ERROR',
        errorMessage: String(message),
        filePath: source || 'unknown',
        errorType: 'runtime',
        stackTrace: error ? error.stack || '' : ''
      }, '*');
    };
    window.addEventListener('unhandledrejection', function(event) {
      var reason = event.reason;
      window.parent.postMessage({
        type: 'MAGICAPPDEV_PREVIEW_ERROR',
        errorMessage: reason instanceof Error ? reason.message : String(reason),
        filePath: 'promise',
        errorType: 'runtime',
        stackTrace: reason instanceof Error ? reason.stack || '' : ''
      }, '*');
    });
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'MAGICAPPDEV_CONSOLE_INIT') {
        var original = { log: console.log, error: console.error, warn: console.warn };
        console.log = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'log', message: Array.from(arguments).join(' ') }, '*'); original.log.apply(console, arguments); };
        console.error = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'error', message: Array.from(arguments).join(' ') }, '*'); original.error.apply(console, arguments); };
        console.warn = function() { window.parent.postMessage({ type: 'MAGICAPPDEV_CONSOLE', level: 'warn', message: Array.from(arguments).join(' ') }, '*'); original.warn.apply(console, arguments); };
      }
      if (event.data && event.data.type === 'MAGICAPPDEV_UPDATE_HTML') {
        document.open();
        document.write(event.data.html);
        document.close();
      }
      if (event.data && event.data.type === 'MAGICAPPDEV_PING') {
        window.parent.postMessage({ type: 'MAGICAPPDEV_PONG' }, '*');
      }
    });
  </script>
  <div class="container">
    <h1>🚀 MagicAppDev</h1>
    <p>Your app is ready to build!</p>
    <div class="badge">${files.length} files in workspace</div>
  </div>
</body>
</html>`;
}

function hashFiles(files: ProjectFile[]): string {
  return files
    .map(f => `${f.path}:${f.content.length}:${f.updatedAt}`)
    .join("|");
}
