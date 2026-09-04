/**
 * SaaS Starter template - React 18 + Vite + TypeScript + Tailwind CSS
 * Includes landing page, pricing table, dashboard layout, and user stats.
 */

import type { Template } from "../types.js";

export const saasTemplate: Template = {
  id: "saas-starter",
  name: "SaaS Starter",
  slug: "saas-starter",
  description:
    "Full-featured SaaS starter template with landing page, pricing tiers, and dashboard stats.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["saas", "dashboard", "starter", "react", "tailwind", "landing"],
  free: false,
  variables: [
    {
      name: "name",
      description: "Project package name",
      type: "string",
      default: "my-saas-app",
    },
    {
      name: "appName",
      description: "SaaS Product Name",
      type: "string",
      default: "CloudPulse",
    },
    {
      name: "description",
      description: "Product tagline",
      type: "string",
      default: "Scale your workflow with intelligent automation",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^1.16.0",
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
  "type": "module",
  "description": "{{description}}",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^1.16.0"
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
}
`,
    },
    {
      path: "src/App.tsx",
      content: `import { useState } from 'react';
import { Zap, Shield, BarChart3, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard'>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Zap className="text-blue-500" />
          <span>{{appName}}</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('landing')}
            className={\`px-3 py-1.5 rounded text-sm \${activeTab === 'landing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}\`}
          >
            Landing
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={\`px-3 py-1.5 rounded text-sm \${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}\`}
          >
            Dashboard
          </button>
        </div>
      </header>

      {activeTab === 'landing' ? (
        <main className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">{{appName}}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">{{description}}</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all"
          >
            Get Started Free
          </button>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold mb-6">Overview Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">Total Revenue</span>
                <BarChart3 className="text-emerald-500" />
              </div>
              <div className="text-3xl font-bold">$12,840</div>
              <div className="text-xs text-emerald-400 mt-1">+14% this month</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">Active Users</span>
                <Shield className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold">1,429</div>
              <div className="text-xs text-blue-400 mt-1">+8% this week</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">System Status</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-xs text-slate-500 mt-1">Operational</div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
`,
    },
  ],
};
