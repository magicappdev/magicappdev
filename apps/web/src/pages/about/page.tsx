import { Sparkles, Code2, Rocket, Users, Shield, Zap } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Link } from "react-router-dom";
import React from "react";

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <Typography variant="display" className="text-primary">
          Our Mission
        </Typography>
        <Typography variant="body" className="text-xl leading-relaxed">
          We believe building software should feel like magic. MagicAppDev is
          designed to bridge the gap between imagination and implementation,
          empowering everyone to create world-class applications instantly.
        </Typography>
        <div className="pt-4">
          <Link to="/chat">
            <Button size="lg" className="rounded-full px-10">
              Start Building Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Story Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Typography variant="headline">Why MagicAppDev?</Typography>
          <Typography variant="body" className="text-foreground/70">
            Developing fullstack applications today is unnecessarily complex.
            From managing monorepos and database schemas to configuring CI/CD
            and cross-platform mobile apps, developers spend more time on
            infrastructure than on innovation.
          </Typography>
          <Typography variant="body" className="text-foreground/70">
            MagicAppDev solves this by using state-of-the-art AI to handle the
            heavy lifting. Describe your idea, and our agent scaffolds the
            entire stack—API, Database, Web, and Mobile—following industry best
            practices.
          </Typography>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Zap className="text-yellow-500" />}
            label="Speed"
            value="10x Faster"
          />
          <StatCard
            icon={<Users className="text-blue-500" />}
            label="Users"
            value="Join 1k+"
          />
          <StatCard
            icon={<Code2 className="text-green-500" />}
            label="Code"
            value="Zero Boilerplate"
          />
          <StatCard
            icon={<Rocket className="text-purple-500" />}
            label="Deploy"
            value="Instant"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-12">
        <div className="text-center">
          <Typography variant="headline">Our Core Values</Typography>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon={<Sparkles size={32} />}
            title="AI-First"
            description="We leverage the latest LLMs to ensure your code is modern, efficient, and secure."
          />
          <ValueCard
            icon={<Shield size={32} />}
            title="Open & Transparent"
            description="No black boxes. You own your code, your data, and your infrastructure."
          />
          <ValueCard
            icon={<Rocket size={32} />}
            title="Future-Proof"
            description="Built on Cloudflare Workers and React Native for extreme scalability and performance."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 rounded-3xl p-12 text-center border border-primary/10">
        <Typography variant="headline" className="mb-4">
          Ready to build something great?
        </Typography>
        <Typography variant="body" className="mb-8 opacity-70">
          Join the thousands of developers building with MagicAppDev.
        </Typography>
        <Link to="/register">
          <Button
            variant="outlined"
            size="lg"
            className="rounded-full px-10 border-primary text-primary hover:bg-primary/10"
          >
            Create Free Account
          </Button>
        </Link>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-6 text-center space-y-2 flex flex-col items-center justify-center border-outline/5 bg-surface/30">
      {icon}
      <Typography
        variant="label"
        className="text-xs uppercase opacity-50 font-bold"
      >
        {label}
      </Typography>
      <Typography variant="title" className="text-lg">
        {value}
      </Typography>
    </Card>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <Typography variant="title">{title}</Typography>
      <Typography
        variant="body"
        className="text-sm text-foreground/60 leading-relaxed"
      >
        {description}
      </Typography>
    </div>
  );
}
