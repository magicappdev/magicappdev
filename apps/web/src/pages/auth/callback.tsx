import { useNavigate, useSearchParams } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import React, { useEffect } from "react";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:8787";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const sessionId = searchParams.get("sessionId");

    // Backwards compat: tokens directly in the URL (legacy mobile deep links)
    if (accessToken && refreshToken) {
      login(accessToken, refreshToken)
        .then(() => navigate("/"))
        .catch(() => navigate("/login"));
      return;
    }

    // New flow: poll /auth/check-session with sessionId
    if (sessionId) {
      let attempts = 0;
      const maxAttempts = 30; // 30 * 500ms = 15s max wait

      const poll = async () => {
        try {
          const resp = await fetch(
            `${API_URL}/auth/check-session?sessionId=${sessionId}`,
          );
          const data = (await resp.json()) as {
            success: boolean;
            pending?: boolean;
            data?: { accessToken: string; refreshToken: string };
          };

          if (data.success && data.data) {
            await login(data.data.accessToken, data.data.refreshToken);
            navigate("/");
            return;
          }

          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 500);
          } else {
            navigate("/login");
          }
        } catch {
          navigate("/login");
        }
      };

      poll();
      return;
    }

    // No tokens and no sessionId
    navigate("/login");
  }, [searchParams, navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <Typography variant="title">Authenticating...</Typography>
      <Typography variant="body" className="text-foreground/60">
        Please wait while we log you in.
      </Typography>
    </div>
  );
}
