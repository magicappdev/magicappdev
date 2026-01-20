import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Text,
  Badge,
  Grid,
} from "@radix-ui/themes";
import { ArrowRight, Bot, Smartphone, Rocket, Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Box style={{ background: "var(--gray-2)" }}>
      {/* Hero Section with subtle gradient */}
      <Section
        size="4"
        style={{
          background: "linear-gradient(to bottom, white, var(--gray-2))",
          borderBottom: "1px solid var(--gray-4)",
        }}
      >
        <Container size="3">
          <Flex direction="column" align="center" gap="5">
            <Badge
              size="2"
              variant="surface"
              color="indigo"
              style={{ padding: "0 12px" }}
            >
              v0.1.0 Alpha Release
            </Badge>
            <Box style={{ textAlign: "center" }}>
              <Heading
                size="9"
                weight="bold"
                mb="3"
                style={{ letterSpacing: "-0.02em" }}
              >
                Build apps like{" "}
                <Text color="indigo" highContrast>
                  magic
                </Text>
              </Heading>
              <Text
                size="5"
                color="gray"
                weight="medium"
                style={{ maxWidth: 640, display: "inline-block" }}
              >
                The all-in-one platform for fullstack app development. Generate
                web and mobile apps instantly with AI-powered tools.
              </Text>
            </Box>
            <Flex gap="4" mt="2">
              <Button
                size="4"
                variant="solid"
                highContrast
                asChild
                style={{ cursor: "pointer" }}
              >
                <Link to="/chat">
                  Start Building <ArrowRight size="18" />
                </Link>
              </Button>
              <Button
                size="4"
                variant="outline"
                color="gray"
                asChild
                style={{ cursor: "pointer" }}
              >
                <Link to="https://github.com/magicappdev/magicappdev">
                  View on GitHub
                </Link>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Section>

      {/* Features Grid */}
      <Section py="9">
        <Container size="4">
          <Grid columns={{ initial: "1", md: "3" }} gap="6">
            <FeatureCard
              title="AI Generation"
              description="Turn natural language into production-ready code for components, screens, and full apps."
              icon={<Bot size="32" />}
            />
            <FeatureCard
              title="Universal Apps"
              description="Target Web, iOS, and Android from a single monorepo using Next.js and Expo."
              icon={<Smartphone size="32" />}
            />
            <FeatureCard
              title="Cloud Native"
              description="Deploy instantly to Cloudflare Workers and Pages with built-in database support."
              icon={<Rocket size="32" />}
            />
          </Grid>
        </Container>
      </Section>

      {/* Code Preview - High Contrast Dark Mode Box */}
      <Section
        p="8"
        style={{ background: "white", borderTop: "1px solid var(--gray-4)" }}
      >
        <Container size="2">
          <Card
            size="3"
            variant="classic"
            style={{
              padding: 0,
              overflow: "hidden",
              boxShadow: "var(--shadow-5)",
            }}
          >
            <Box p="4" style={{ background: "var(--gray-12)" }}>
              <Flex gap="2" mb="4">
                <Box
                  width="10px"
                  height="10px"
                  style={{ borderRadius: "50%", background: "#ff5f56" }}
                />
                <Box
                  width="10px"
                  height="10px"
                  style={{ borderRadius: "50%", background: "#ffbd2e" }}
                />
                <Box
                  width="10px"
                  height="10px"
                  style={{ borderRadius: "50%", background: "#27c93f" }}
                />
              </Flex>
              <Flex gap="2" align="center" mb="3">
                <Terminal size="16" color="var(--gray-8)" />
                <Text
                  size="2"
                  style={{ color: "white", fontFamily: "var(--font-mono)" }}
                >
                  npx create-magicappdev-app my-app
                </Text>
              </Flex>
              <Box ml="6" style={{ fontFamily: "var(--font-mono)" }}>
                <Text size="2" color="gray" as="div" mb="1">
                  ✨ Creating new MagicAppDev project...
                </Text>
                <Text size="2" color="gray" as="div" mb="1">
                  📦 Installing dependencies...
                </Text>
                <Text size="2" color="gray" as="div" mb="1">
                  🚀 Initializing git repository...
                </Text>
                <Text size="2" color="indigo" weight="bold" as="div">
                  ✓ Project created successfully!
                </Text>
              </Box>
            </Box>
          </Card>
        </Container>
      </Section>

      <footer
        style={{
          padding: "var(--space-8) 0",
          borderTop: "1px solid var(--gray-4)",
        }}
      >
        <Container size="3">
          <Text align="center" size="2" color="gray" as="p">
            © 2024 MagicAppDev. Built with Radix Themes and Cloudflare.
          </Text>
        </Container>
      </footer>
    </Box>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      size="3"
      variant="surface"
      style={{
        border: "1px solid var(--gray-4)",
        boxShadow: "var(--shadow-2)",
      }}
    >
      <Flex direction="column" gap="3">
        <Box style={{ color: "var(--indigo-9)" }}>{icon}</Box>
        <Heading as="h3" size="4" weight="bold">
          {title}
        </Heading>
        <Text size="2" color="gray" style={{ lineHeight: "1.6" }}>
          {description}
        </Text>
      </Flex>
    </Card>
  );
}
