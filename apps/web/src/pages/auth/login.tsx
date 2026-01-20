import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Github, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Navigate } from "react-router-dom";
import React from "react";

export default function LoginPage() {
  const { user, loginWithGitHub, isLoading } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles size={40} />
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

        <Button
          onClick={loginWithGitHub}
          size="lg"
          className="w-full h-14 rounded-xl flex items-center justify-center gap-3 text-lg"
          disabled={isLoading}
        >
          <Github size={24} />
          Continue with GitHub
        </Button>

        <Typography
          variant="label"
          className="text-center block text-foreground/40 normal-case"
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </Card>
    </div>
  );
}
