import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";
import { Github } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const { user, loginWithGitHub, loginWithDiscord } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsProcessing(true);

    try {
      const response = await api.login({ email, password });

      if (response.success) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        api.setToken(accessToken);
        window.location.href = "/";
      } else {
        setLoginError(response.error?.message || "Login failed");
      }
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : "An error occurred during login",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsProcessing(true);
    try {
      await loginWithGitHub();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "GitHub login failed");
      setIsProcessing(false);
    }
  };

  const handleDiscordLogin = async () => {
    setIsProcessing(true);
    try {
      await loginWithDiscord();
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : "Discord login failed",
      );
      setIsProcessing(false);
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
            Welcome to MagicAppDev
          </Typography>
          <Typography
            variant="body"
            className="text-lg text-foreground/60 max-w-md mx-auto"
          >
            The intelligent platform to build, deploy and scale your
            applications.
          </Typography>
        </div>
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-outline/10">
        <Typography variant="title" className="text-center">
          Sign in to your account
        </Typography>

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Signing in..." : "Sign In"}
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
          disabled={isProcessing}
        >
          <Github size={20} />
          GitHub
        </Button>

        <Button
          onClick={handleDiscordLogin}
          variant="outlined"
          className="w-full flex items-center justify-center gap-3 mt-4"
          disabled={isProcessing}
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
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </Typography>
        </div>
      </Card>
    </div>
  );
}
