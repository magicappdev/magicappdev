import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Smartphone, Rocket, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          v0.1.0 Alpha Release
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Build apps like <span className="text-primary">magic</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The all-in-one platform for fullstack app development. Generate web
          and mobile apps instantly with AI-powered tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat">
            <Button size="lg" className="w-full sm:w-auto">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://github.com/magicappdev/magicappdev">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View on GitHub
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI Generation"
            description="Turn natural language into production-ready code for components, screens, and full apps."
            icon={<Bot className="h-8 w-8 text-primary" />}
          />
          <FeatureCard
            title="Universal Apps"
            description="Target Web, iOS, and Android from a single monorepo using Next.js and Expo."
            icon={<Smartphone className="h-8 w-8 text-primary" />}
          />
          <FeatureCard
            title="Cloud Native"
            description="Deploy instantly to Cloudflare Workers and Pages with built-in database support."
            icon={<Rocket className="h-8 w-8 text-primary" />}
          />
        </div>
      </section>

      {/* CLI Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm max-w-3xl mx-auto overflow-hidden">
          <div className="border-b bg-muted/50 p-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Terminal
            </div>
          </div>
          <div className="p-8 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">$</span>
              <span className="text-foreground">
                npx create-magicappdev-app my-app
              </span>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p>✨ Creating new MagicAppDev project...</p>
              <p>📦 Installing dependencies...</p>
              <p>🚀 Initializing git repository...</p>
              <p className="text-primary font-bold">
                ✓ Project created successfully!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 MagicAppDev. Built with Next.js, Expo, and Cloudflare.</p>
        </div>
      </footer>
    </main>
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
    <Card className="hover:bg-accent/50 transition-colors cursor-default">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
