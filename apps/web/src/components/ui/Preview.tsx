/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Monitor,
  RefreshCw,
  Maximize2,
  Minimize2,
  Smartphone,
  Tablet,
  MonitorPlay,
  AlertTriangle,
  Loader2,
  Terminal,
  XCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface PreviewFile {
  path: string;
  content: string;
}

export interface PreviewProps {
  files: PreviewFile[];
  activeFile?: string;
  onFileSelect?: (path: string) => void;
  className?: string;
}

export type DeviceType = "desktop" | "tablet" | "mobile";

export type PreviewMode = "split" | "fullscreen" | "hidden";

export default function Preview({
  files,
  activeFile,
  onFileSelect,
  className,
}: PreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [mode, setMode] = useState<PreviewMode>("split");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<
    Array<{ type: "log" | "error" | "warn"; message: string }>
  >([]);
  const [showConsole, setShowConsole] = useState(false);
  const [autoReload, setAutoReload] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reloadIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedFile = activeFile
    ? files.find(f => f.path === activeFile)
    : files[0];

  const deviceDimensions = {
    desktop: { width: "100%", height: "100%" },
    tablet: { width: "768px", height: "1024px" },
    mobile: { width: "375px", height: "667px" },
  };

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDevice(newDevice);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleModeChange = useCallback((newMode: PreviewMode) => {
    setMode(newMode);
    if (newMode === "fullscreen") {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (path: string) => {
      onFileSelect?.(path);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    },
    [onFileSelect],
  );

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError("Failed to load preview. Please check the code.");
  }, []);

  const generatePreviewHTML = useCallback((file: PreviewFile): string => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - ${file.path}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      padding: 20px;
      background: #ffffff;
      color: #000000;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Simple React-like rendering for preview
    // In production, this would use a proper bundler
    const root = document.getElementById('root');
    if (root) {
      try {
        // For now, just display the content as HTML
        root.innerHTML = ${JSON.stringify(file.content)};
      } catch (e) {
        root.innerHTML = '<div style="color: red; padding: 20px;">Error rendering preview: ' + e.message + '</div>';
      }
    }
  </script>
</body>
</html>`;
    return html;
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (mode === "hidden") {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-surface border border-outline/10 rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-outline/10 bg-surface/50">
        <div className="flex items-center gap-2">
          <Typography variant="label" className="text-foreground/70">
            Preview
          </Typography>

          {/* Device Toggle */}
          <div className="flex overflow-hidden border rounded-md bg-surface border-outline/10">
            <Button
              size="sm"
              variant={device === "desktop" ? "filled" : "text"}
              onClick={() => handleDeviceChange("desktop")}
              className="border-r rounded-none border-outline/10"
            >
              <Monitor size={16} />
            </Button>
            <Button
              size="sm"
              variant={device === "tablet" ? "filled" : "text"}
              onClick={() => handleDeviceChange("tablet")}
              className="border-r rounded-none border-outline/10"
            >
              <Tablet size={16} />
            </Button>
            <Button
              size="sm"
              variant={device === "mobile" ? "filled" : "text"}
              onClick={() => handleDeviceChange("mobile")}
              className="rounded-none"
            >
              <Smartphone size={16} />
            </Button>
          </div>

          {/* File Selector */}
          {files.length > 1 && (
            <select
              value={selectedFile?.path || ""}
              onChange={e => handleFileSelect(e.target.value)}
              className="px-2 py-1 text-sm border rounded-md border-outline/10 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Select file to preview"
            >
              {files.map(file => (
                <option key={file.path} value={file.path}>
                  {file.path}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex overflow-hidden border rounded-md bg-surface border-outline/10">
            <Button
              size="sm"
              variant={mode === "split" ? "filled" : "text"}
              onClick={() => handleModeChange("split")}
              className="border-r rounded-none border-outline/10"
              title="Split view"
            >
              <MonitorPlay size={16} />
            </Button>
            <Button
              size="sm"
              variant={mode === "fullscreen" ? "filled" : "text"}
              onClick={handleFullscreenToggle}
              className="rounded-none"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
            <Button
              size="sm"
              variant="text"
              onClick={() => handleModeChange("hidden")}
              className="border-l rounded-none border-outline/10"
              title="Hide preview"
            >
              <MonitorPlay size={16} />
            </Button>
          </div>

          {/* Refresh */}
          <Button
            size="sm"
            variant="outlined"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh preview"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className={cn(
          "flex-1 relative bg-background/50",
          isFullscreen ? "h-[calc(100vh-3.5rem)]" : "min-h-[400px]",
        )}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <Typography variant="body" className="text-foreground/60">
                Loading preview...
              </Typography>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center max-w-md gap-3 p-6 border rounded-lg bg-surface border-error/200">
              <AlertTriangle size={32} className="text-error" />
              <Typography variant="label" className="text-center text-error">
                Preview Error
              </Typography>
              <Typography
                variant="body"
                className="text-center text-foreground/70"
              >
                {error}
              </Typography>
              <Button size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        {selectedFile && !error && (
          <div
            className={cn(
              "flex items-center justify-center p-4 h-full",
              device === "desktop" ? "w-full" : "",
            )}
          >
            <iframe
              ref={iframeRef}
              srcDoc={generatePreviewHTML(selectedFile)}
              title={`Preview - ${selectedFile.path}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              className="bg-white border rounded-lg shadow-lg border-outline/10"
              style={{
                width: deviceDimensions[device].width,
                height: deviceDimensions[device].height,
                maxWidth: "100%",
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        )}

        {/* No File Selected */}
        {!selectedFile && !error && (
          <div className="flex flex-col items-center justify-center h-full text-foreground/40">
            <Monitor size={48} className="mb-3 opacity-50" />
            <Typography variant="body">No file selected for preview</Typography>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-3 py-2 text-xs border-t border-outline/10 bg-surface/50 text-foreground/50">
        <span>{selectedFile && `${selectedFile.path} • ${device}`}</span>
        <span>Preview Mode • Sandbox Enabled</span>
      </div>
    </div>
  );
}
