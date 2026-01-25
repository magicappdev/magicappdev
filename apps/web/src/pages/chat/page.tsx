import {
  Bot,
  ChevronDown,
  ChevronRight,
  Code2,
  Download,
  FileCode,
  FolderOpen,
  LayoutTemplate,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Typography } from "@/components/ui/Typography";
// import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratedProject {
  projectName: string;
  templateSlug: string;
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Use deployed agent or local dev server
const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8788";
const AGENT_HOST = AGENT_URL.replace(/^https?:\/\//, "");
// Use wss for deployed (workers.dev), ws for localhost
const WS_PROTOCOL = AGENT_URL.includes("workers.dev") ? "wss:" : "ws:";

export default function ChatPage() {
  // const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestedTemplate, setSuggestedTemplate] = useState<string | null>(
    null,
  );
  const [generatedProject, setGeneratedProject] =
    useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const pendingFilesRef = useRef<GeneratedFile[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Use native WebSocket for compatibility with minimal agent
    const wsUrl = `${WS_PROTOCOL}//${AGENT_HOST}/agents/magic-agent/default`;
    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to Agent");
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log("Disconnected from Agent");
      setIsConnected(false);
    };

    ws.onerror = error => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "history") {
          // Load chat history from server
          const historyMessages: Message[] = data.messages.map(
            (m: {
              id: string;
              role: string;
              content: string;
              timestamp: number;
            }) => ({
              id: m.id,
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
              timestamp: m.timestamp,
            }),
          );
          setMessages(historyMessages);
        } else if (data.type === "history_cleared") {
          setMessages([]);
        } else if (data.type === "chat_chunk") {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant" && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + data.content },
              ];
            } else {
              return [
                ...prev,
                {
                  id: "streaming",
                  role: "assistant",
                  content: data.content,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        } else if (data.type === "chat_done") {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.id === "streaming") {
              return [
                ...prev.slice(0, -1),
                { ...last, id: crypto.randomUUID() },
              ];
            }
            return prev;
          });
          setIsLoading(false);
          if (data.suggestedTemplate) {
            setSuggestedTemplate(data.suggestedTemplate);
          }
        } else if (data.type === "error") {
          setIsLoading(false);
          setIsGenerating(false);
          console.error("Agent error:", data.message);
        } else if (data.type === "generation_start") {
          setIsGenerating(true);
          pendingFilesRef.current = [];
          setGeneratedProject(null);
        } else if (data.type === "generation_file") {
          pendingFilesRef.current = [
            ...pendingFilesRef.current,
            { path: data.path, content: data.content },
          ];
        } else if (data.type === "generation_complete") {
          const files = pendingFilesRef.current;
          setGeneratedProject({
            projectName: data.projectName,
            templateSlug: data.templateSlug,
            files,
            dependencies: data.dependencies || {},
            devDependencies: data.devDependencies || {},
          });
          // Expand first file by default
          if (files.length > 0) {
            setExpandedFiles(new Set([files[0].path]));
          }
          setIsGenerating(false);
        } else if (data.type === "generation_error") {
          setIsGenerating(false);
          console.error("Generation error:", data.error);
          // Add error message to chat
          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "system",
              content: `Generation failed: ${data.error}`,
              timestamp: Date.now(),
            },
          ]);
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setSuggestedTemplate(null);

    // Send to Agent via WebSocket
    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        content: userMsg.content,
      }),
    );
  };

  const generateProject = useCallback(
    (templateSlug: string, projectName: string = "my-app") => {
      if (!wsRef.current || !isConnected) return;

      wsRef.current.send(
        JSON.stringify({
          type: "generate_project",
          templateSlug,
          projectName,
          variables: {},
        }),
      );
    },
    [isConnected],
  );

  const toggleFileExpanded = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const downloadProject = () => {
    if (!generatedProject) return;

    // Create a simple text representation for now
    // In a real implementation, this would create a zip file
    const projectContent = generatedProject.files
      .map(f => `=== ${f.path} ===\n${f.content}`)
      .join("\n\n");

    const blob = new Blob([projectContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedProject.projectName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    wsRef.current?.send(JSON.stringify({ type: "clear_history" }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline/10 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Typography variant="title" className="text-lg">
            Magic Assistant
          </Typography>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500",
            )}
          />
          <span className="text-foreground/60">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          {messages.length > 0 && (
            <Button
              variant="text"
              size="sm"
              onClick={clearHistory}
              className="ml-2 text-foreground/40 hover:text-error"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-foreground/40">
            <Bot size={48} />
            <Typography>Start building your app by describing it.</Typography>
            <div className="grid w-full max-w-md grid-cols-2 gap-2">
              <Button
                variant="outlined"
                className="justify-start text-xs"
                onClick={() => setInput("Create a ToDo app")}
              >
                <LayoutTemplate className="w-3 h-3 mr-2" /> ToDo App
              </Button>
              <Button
                variant="outlined"
                className="justify-start text-xs"
                onClick={() => setInput("Build a landing page")}
              >
                <Code2 className="w-3 h-3 mr-2" /> Landing Page
              </Button>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-3xl mx-auto",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-outline/10",
              )}
            >
              {msg.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={cn(
                "rounded-2xl p-4 max-w-[80%]",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-outline/10 shadow-sm",
              )}
            >
              <div className="prose-sm prose dark:prose-invert">
                {/* For now just text, later ReactMarkdown */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {suggestedTemplate && !generatedProject && (
          <div className="max-w-3xl pl-12 mx-auto">
            <Card className="flex items-center justify-between p-4 bg-primary/5 border-primary/20">
              <div>
                <Typography variant="label" className="text-primary">
                  Suggested Template
                </Typography>
                <Typography variant="body" className="font-medium">
                  {suggestedTemplate}
                </Typography>
              </div>
              <Button
                size="sm"
                onClick={() => generateProject(suggestedTemplate)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4 mr-2" />
                    Generate Project
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}

        {/* Generated Project Display */}
        {generatedProject && (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-primary/20">
              <div className="flex items-center justify-between p-4 border-b bg-primary/5 border-primary/10">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <Typography variant="title" className="text-lg">
                    {generatedProject.projectName}
                  </Typography>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                    {generatedProject.templateSlug}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    onClick={downloadProject}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => setGeneratedProject(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-outline/10 max-h-[60vh] overflow-y-auto">
                {generatedProject.files.map(file => (
                  <div key={file.path}>
                    <button
                      onClick={() => toggleFileExpanded(file.path)}
                      className="flex items-center w-full gap-2 p-3 text-left hover:bg-surface/50"
                    >
                      {expandedFiles.has(file.path) ? (
                        <ChevronDown className="w-4 h-4 text-foreground/60" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-foreground/60" />
                      )}
                      <FileCode className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm">{file.path}</span>
                    </button>
                    {expandedFiles.has(file.path) && (
                      <pre className="p-4 overflow-x-auto text-sm bg-black/50">
                        <code className="text-green-400">{file.content}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              {Object.keys(generatedProject.dependencies).length > 0 && (
                <div className="p-4 border-t border-outline/10 bg-surface/30">
                  <Typography variant="label" className="mb-2">
                    Dependencies
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(generatedProject.dependencies).map(
                      ([name, version]) => (
                        <span
                          key={name}
                          className="px-2 py-1 font-mono text-xs rounded bg-surface"
                        >
                          {name}@{version}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-outline/10 bg-surface/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex max-w-3xl gap-2 mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your app..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || !isConnected}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
