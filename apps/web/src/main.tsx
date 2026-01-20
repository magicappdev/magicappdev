import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthCallbackPage from "./pages/auth/callback";
import SettingsPage from "./pages/settings/page";
import ProjectsPage from "./pages/projects/page";
import RegisterPage from "./pages/auth/register";
import LoginPage from "./pages/auth/login";
import ChatPage from "./pages/chat/page";
import ReactDOM from "react-dom/client";
import HomePage from "./pages/page";
import Layout from "./Layout";
import "./pages/globals.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
