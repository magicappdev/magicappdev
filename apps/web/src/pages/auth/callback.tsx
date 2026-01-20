import { useNavigate, useSearchParams } from "react-router-dom";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "../../contexts/AuthContext";
import React, { useEffect } from "react";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      login(accessToken, refreshToken)
        .then(() => {
          navigate("/");
        })
        .catch(err => {
          console.error("Login failed:", err);
          navigate("/login");
        });
    } else {
      console.error("Auth failed: Missing tokens");
      navigate("/login");
    }
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
