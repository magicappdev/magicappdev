import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProjectDetailPage from "./pages/projects/detail";
import TicketDetailPage from "./pages/tickets/detail";
import { AuthProvider } from "./contexts/AuthContext";
import AuthCallbackPage from "./pages/auth/callback";
import SettingsPage from "./pages/settings/page";
import ProjectsPage from "./pages/projects/page";
import RegisterPage from "./pages/auth/register";
import TicketsPage from "./pages/tickets/page";
import ContactPage from "./pages/contact/page";
import LoginPage from "./pages/auth/login";
import AdminPage from "./pages/admin/page";
import AboutPage from "./pages/about/page";
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
