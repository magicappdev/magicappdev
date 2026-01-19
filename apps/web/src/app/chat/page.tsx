"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sendMessage, type AiMessage } from "@/lib/api";

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
      const response = await sendMessage(newMessages);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-xl font-bold text-primary">
              MagicAppDev
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              New Project
            </Button>
            <Button size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl h-[calc(100vh-64px)]">
        <Card className="flex-1 flex flex-col overflow-hidden mb-4 border-muted">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 bg-secondary">
                      <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-card border-t">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your app idea..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

