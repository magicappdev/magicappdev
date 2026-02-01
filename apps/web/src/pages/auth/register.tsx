import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";
import { Github } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const { user, loginWithGitHub, loginWithDiscord, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.register({ email, password, name });

      if (response.success) {
        alert("Registration successful! Please login.");
        window.location.href = "/login";
      } else {
        alert(response.error?.message || "Registration failed");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      await loginWithDiscord();
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-outline/5">
          <img src="/logo.png" className="w-12 h-12" alt="MagicApp Logo" />
        </div>
        <div>
          <Typography variant="display" className="text-4xl md:text-5xl">
            Join MagicAppDev
          </Typography>
          <Typography
            variant="body"
            className="text-lg text-foreground/60 max-w-md mx-auto"
          >
            Start building your dream applications today.
          </Typography>
        </div>
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-outline/10">
        <Typography variant="title" className="text-center">
          Create your account
        </Typography>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-outline/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-2 text-foreground/40">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGitHubLogin}
          variant="outlined"
          className="w-full flex items-center justify-center gap-3"
          disabled={isLoading}
        >
          <Github size={20} />
          GitHub
        </Button>

        <Button
          onClick={handleDiscordLogin}
          variant="outlined"
          className="w-full flex items-center justify-center gap-3 mt-4"
          disabled={isLoading}
        >
          <div className="w-5 h-5 bg-[#5865F2] rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          Discord
        </Button>

        <div className="text-center text-sm">
          <Typography
            variant="label"
            className="text-foreground/60 normal-case"
          >
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
}
