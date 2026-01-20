import { BrowserRouter, Route, Routes } from "react-router-dom";
import SettingsPage from "./pages/settings/page";
import ProjectsPage from "./pages/projects/page";
import ChatPage from "./pages/chat/page";
import ReactDOM from "react-dom/client";
import HomePage from "./pages/page";
import Layout from "./Layout";
import "./pages/globals.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
