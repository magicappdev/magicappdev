import { useNavigate, useSearchParams } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import React, { useEffect } from "react";
import { api } from "../../lib/api";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      api.setToken(accessToken);

      // Redirect to dashboard or home
      navigate("/");
      // Refresh page to trigger AuthProvider reload (simple way)
      window.location.reload();
    } else {
      console.error("Auth failed: Missing tokens");
      navigate("/");
    }
  }, [searchParams, navigate]);

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
