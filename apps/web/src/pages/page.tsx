import {
  ArrowRight,
  Bot,
  Rocket,
  Smartphone,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-variant/30 border border-outline/10 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl border border-outline/5 mb-4 group-hover:scale-105 transition-transform duration-500">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            v0.1.0 Alpha Release
          </span>

          <Typography variant="display" className="text-foreground">
            Build apps like{" "}
            <span className="text-primary bg-clip-text bg-linear-to-r from-primary to-tertiary">
              magic
            </span>
          </Typography>

          <Typography variant="body" className="max-w-2xl text-lg md:text-xl">
            The all-in-one platform for fullstack app development. Generate web
            and mobile apps instantly with AI-powered tools.
          </Typography>

          <div className="flex flex-wrap gap-4 pt-4 justify-center">
            <Link to="/chat">
              <Button size="lg" className="rounded-full px-8">
                Start Building <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <a href="#downloads">
              <Button
                size="lg"
                variant="outlined"
                className="rounded-full px-8"
              >
                Download Apps
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="AI Generation"
            description="Turn natural language into production-ready code for components, screens, and full apps."
            icon={<Bot size={32} />}
          />
          <FeatureCard
            title="Universal Apps"
            description="Target Web, iOS, and Android from a single monorepo using Next.js and Expo."
            icon={<Smartphone size={32} />}
          />
          <FeatureCard
            title="Cloud Native"
            description="Deploy instantly to Cloudflare Workers and Pages with built-in database support."
            icon={<Rocket size={32} />}
          />
        </div>
      </section>

      {/* Download Section */}
      <section id="downloads" className="space-y-8">
        <div className="text-center space-y-2">
          <Typography variant="headline">Get the Magic</Typography>
          <Typography variant="body" className="text-foreground/60">
            Build and manage your projects from anywhere.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CLI Download */}
          <Card className="p-8 flex flex-col items-center text-center space-y-6 hover:border-primary/30 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Terminal size={40} />
            </div>
            <div className="space-y-2">
              <Typography variant="title">Magic CLI</Typography>
              <Typography variant="body" className="text-sm text-foreground/60">
                Powerful command-line tools for local development and
                generation.
              </Typography>
            </div>
            <div className="w-full bg-black/20 p-3 rounded-lg font-mono text-xs flex items-center justify-between group">
              <span className="text-primary">
                npm install -g @magicappdev/cli
              </span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    "npm install -g @magicappdev/cli",
                  )
                }
                className="text-foreground/40 hover:text-primary transition-colors"
              >
                Copy
              </button>
            </div>
          </Card>

          {/* Mobile Download */}
          <Card className="p-8 flex flex-col items-center text-center space-y-6 hover:border-primary/30 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Smartphone size={40} />
            </div>
            <div className="space-y-2">
              <Typography variant="title">Mobile App</Typography>
              <Typography variant="body" className="text-sm text-foreground/60">
                Available now via Expo Go or by building from source.
              </Typography>
            </div>
          </Card>
        </div>
      </section>

      {/* Code Preview */}
      <section className="rounded-3xl bg-surface border border-outline/10 overflow-hidden shadow-2xl relative">
        <div className="bg-surface-variant/50 p-4 flex items-center gap-2 border-b border-outline/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-error/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-foreground/50 bg-black/20 px-3 py-1 rounded">
              <Terminal size={12} />
              npx create-magicappdev-app my-app
            </div>
          </div>
        </div>
        <div className="p-6 md:p-8 font-mono text-sm space-y-2 bg-[#0d0d0d] text-gray-300">
          <div>
            <span className="text-primary">✨</span> Creating new MagicAppDev
            project...
          </div>
          <div>
            <span className="text-purple-400">📦</span> Installing
            dependencies...
          </div>
          <div>
            <span className="text-blue-400">🚀</span> Initializing git
            repository...
          </div>
          <div className="text-green-400 font-bold pt-2">
            ✓ Project created successfully!
          </div>
        </div>
      </section>

      <footer className="pt-12 pb-6 border-t border-outline/10 text-center">
        <Typography variant="label" className="text-foreground/40 normal-case">
          © 2024 MagicAppDev. Built with React and Tailwind CSS.
        </Typography>
      </footer>
    </div>
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
    <Card className="p-6 flex flex-col gap-4 hover:border-primary/50 text-left group">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-foreground/70 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
}
