/**
 * Chat application template - React + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const chatAppTemplate: Template = {
  id: "chat-app",
  name: "Chat App",
  slug: "chat-app",
  description:
    "Real-time chat application with React, Vite, TypeScript, and WebSocket support. Includes user list and message history.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["starter", "chat", "realtime", "websocket", "react", "tailwind"],
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-chat-app",
    },
    {
      name: "appName",
      description: "Chat app name",
      type: "string",
      default: "My Chat App",
    },
    {
      name: "description",
      description: "Short description of the app",
      type: "string",
      default: "A real-time chat application",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.6.3",
    vite: "^6.0.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.1.0",
  "private": true,
  "description": "{{description}}",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^6.0.3",
    "tailwindcss": "^3.4.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}`,
    },
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
})`,
    },
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{appName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
    {
      path: "src/main.tsx",
      content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
    },
    {
      path: "src/App.tsx",
      content: `import { useState } from 'react'

interface Message {
  id: string
  user: string
  text: string
  time: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'System', text: 'Welcome to {{appName}}!', time: new Date().toLocaleTimeString() },
  ])
  const [input, setInput] = useState('')

  const send = () => {
    if (!input.trim()) return
    const message: Message = {
      id: crypto.randomUUID(),
      user: 'You',
      text: input.trim(),
      time: new Date().toLocaleTimeString(),
    }
    setMessages(prev => [...prev, message])
    setInput('')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="font-bold text-lg mb-4">Users</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Alice
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Bob
          </li>
        </ul>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 py-3 font-semibold">
          {{appName}}
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{msg.user}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <p className="text-gray-800">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border-t p-4 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={send}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  )
}`,
    },
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}`,
    },
  ],
};
