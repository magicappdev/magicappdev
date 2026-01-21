import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  Code2,
  LayoutTemplate,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AgentClient } from "agents/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:8788"; // Default Agent Port

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestedTemplate, setSuggestedTemplate] = useState<string | null>(
    null,
  );

  const clientRef = useRef<AgentClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Agent Client
    const client = new AgentClient({
      host: new URL(AGENT_URL).host,
      agent: "magic-agent", // Matches class_name in wrangler.toml (case insensitive mostly, but check SDK)
      name: "default", // Or user.id if we want user-specific agents
    });

    client.addEventListener("open", () => {
      console.log("Connected to Agent");
      setIsConnected(true);
    });

    client.addEventListener("close", () => {
      console.log("Disconnected from Agent");
      setIsConnected(false);
    });

    client.addEventListener("message", event => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "chat_chunk") {
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
          // handle error display
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    });

    clientRef.current = client;

    return () => {
      client.close();
    };
  }, [user]);

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

    // Send to Agent
    clientRef.current?.send(
      JSON.stringify({
        type: "chat",
        content: userMsg.content,
        modelType: "chat", // Default
      }),
    );
  };

  const applyTemplate = (templateId: string) => {
    // Logic to apply template (e.g., redirect to builder or send command)
    console.log("Applying template:", templateId);
    // For now, just send a message
    const msg = `Use the ${templateId} template.`;
    setInput(msg);
    // handleSubmit would need to be called or triggered
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background/50">
      {/* Header */}
      <div className="border-b border-outline/10 p-4 flex justify-between items-center bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary w-5 h-5" />
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
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-foreground/40 space-y-4">
            <Bot size={48} />
            <Typography>Start building your app by describing it.</Typography>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
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
              <div className="prose prose-sm dark:prose-invert">
                {/* For now just text, later ReactMarkdown */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {suggestedTemplate && (
          <div className="max-w-3xl mx-auto pl-12">
            <Card className="p-4 bg-primary/5 border-primary/20 flex items-center justify-between">
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
                onClick={() => applyTemplate(suggestedTemplate)}
              >
                Use Template
              </Button>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-outline/10 bg-surface/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
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
