import { BrowserRouter, Route, Routes } from "react-router-dom";
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
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
