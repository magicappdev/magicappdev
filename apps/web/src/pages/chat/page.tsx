import { streamMessage, type AiMessage } from "@/lib/api";
import { Typography } from "@/components/ui/Typography";
import { Bot, Plus, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI development assistant. Describe the app you want to build, and I'll help you create it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AiMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Add empty assistant message to be filled by stream
      const assistantMessage: AiMessage = { role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMessage]);

      let fullContent = "";
      for await (const chunk of streamMessage(newMessages)) {
        fullContent += chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = { role: "assistant", content: fullContent };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check if your API is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)]">
      {/* Page Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="headline">AI Assistant</Typography>
          <Typography variant="body" className="text-sm">
            Start a new project or continue building
          </Typography>
        </div>
        <Button variant="tonal" size="sm">
          <Plus size={16} className="mr-2" /> New Project
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border border-outline/10 shadow-lg bg-surface/50 backdrop-blur-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4 max-w-3xl",
                message.role === "user" ? "ml-auto flex-row-reverse" : "",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "assistant"
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary/20 text-secondary",
                )}
              >
                {message.role === "assistant" ? (
                  <Bot size={18} />
                ) : (
                  <User size={18} />
                )}
              </div>

              <div
                className={cn(
                  "p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-surface-variant text-foreground rounded-bl-sm border border-outline/5",
                )}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-surface-variant p-4 rounded-2xl rounded-bl-sm border border-outline/5">
                <div className="flex space-x-1 h-5 items-center">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-variant/30 border-t border-outline/10">
          <form
            onSubmit={handleSubmit}
            className="flex gap-4 max-w-4xl mx-auto"
          >
            <div className="flex-1">
              <Input
                placeholder="Describe your app idea..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                className="bg-surface border-transparent focus:bg-surface focus:border-primary/50 h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 rounded-xl p-0 flex items-center justify-center shrink-0"
            >
              <Send size={20} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
