import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Text,
  TextField,
  Avatar,
  Separator,
} from "@radix-ui/themes";
import { Send, Bot, User, ArrowLeft, Plus } from "lucide-react";
import { sendMessage, type AiMessage } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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
          content:
            "Sorry, I encountered an error. Please check if your API is running.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      direction="column"
      style={{ height: "100vh", background: "var(--gray-2)" }}
    >
      {/* High Contrast Header */}
      <Box
        px="4"
        py="3"
        style={{
          background: "white",
          borderBottom: "1px solid var(--gray-5)",
          zIndex: 10,
        }}
      >
        <Container size="4">
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <IconButton variant="ghost" asChild color="gray" highContrast>
                <Link to="/">
                  <ArrowLeft size="20" />
                </Link>
              </IconButton>
              <Heading
                size="4"
                weight="bold"
                style={{ letterSpacing: "-0.01em" }}
              >
                MagicAppDev
              </Heading>
            </Flex>
            <Flex gap="3">
              <Button variant="soft" color="gray" size="2">
                <Plus size="16" /> New Project
              </Button>
              <Button variant="solid" color="indigo" size="2" highContrast>
                Sign In
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Chat Area */}
      <Box flexGrow="1" py="4" style={{ overflow: "hidden" }}>
        <Container size="3" style={{ height: "100%" }}>
          <Card
            size="2"
            variant="surface"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-4)",
              border: "1px solid var(--gray-5)",
              padding: 0,
            }}
          >
            <ScrollArea scrollbars="vertical" style={{ flexGrow: 1 }}>
              <Box p="5">
                <Flex direction="column" gap="5">
                  {messages.map((message, index) => (
                    <Flex
                      key={index}
                      gap="3"
                      justify={message.role === "user" ? "end" : "start"}
                    >
                      {message.role === "assistant" && (
                        <Avatar
                          size="2"
                          fallback={<Bot size="16" />}
                          color="indigo"
                          variant="soft"
                        />
                      )}
                      <Box
                        px="4"
                        py="3"
                        style={{
                          maxWidth: "85%",
                          borderRadius: "var(--radius-4)",
                          background:
                            message.role === "user"
                              ? "var(--indigo-9)"
                              : "white",
                          color:
                            message.role === "user"
                              ? "white"
                              : "var(--gray-12)",
                          border:
                            message.role === "user"
                              ? "none"
                              : "1px solid var(--gray-4)",
                          boxShadow: "var(--shadow-2)",
                        }}
                      >
                        <Text
                          size="2"
                          style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                        >
                          {message.content}
                        </Text>
                      </Box>
                      {message.role === "user" && (
                        <Avatar
                          size="2"
                          fallback={<User size="16" />}
                          color="gray"
                          variant="solid"
                          highContrast
                        />
                      )}
                    </Flex>
                  ))}
                  {isLoading && (
                    <Flex gap="3" align="center">
                      <Avatar
                        size="2"
                        fallback={<Bot size="16" />}
                        color="indigo"
                        variant="soft"
                      />
                      <Box
                        px="4"
                        py="2"
                        style={{
                          background: "white",
                          borderRadius: "var(--radius-4)",
                          border: "1px solid var(--gray-4)",
                        }}
                      >
                        <Text size="2" color="gray" className="animate-pulse">
                          AI is typing...
                        </Text>
                      </Box>
                    </Flex>
                  )}
                  <div ref={scrollRef} />
                </Flex>
              </Box>
            </ScrollArea>

            <Separator size="4" />

            {/* Input Footer Area */}
            <Box p="4" style={{ background: "var(--gray-1)" }}>
              <form onSubmit={handleSubmit}>
                <Flex gap="3">
                  <TextField.Root
                    size="3"
                    placeholder="Describe your app idea..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{ flexGrow: 1, background: "white" }}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="3"
                    variant="solid"
                    color="indigo"
                    highContrast
                    disabled={isLoading || !input.trim()}
                  >
                    <Send size="16" /> Send
                  </Button>
                </Flex>
              </form>
            </Box>
          </Card>
        </Container>
      </Box>
    </Flex>
  );
}
