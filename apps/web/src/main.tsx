import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./pages/chat/page";
import { Theme } from "@radix-ui/themes";
import ReactDOM from "react-dom/client";
import HomePage from "./pages/page";
import "./pages/globals.css";
import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme
      appearance="light"
      accentColor="indigo"
      grayColor="slate"
      panelBackground="translucent"
      radius="large"
      scaling="100%"
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  </React.StrictMode>,
);
