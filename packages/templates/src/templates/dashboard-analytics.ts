/**
 * Dashboard Analytics template - React 18 + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const dashboardAnalyticsTemplate: Template = {
  id: "dashboard-analytics",
  name: "Analytics Dashboard",
  slug: "dashboard-analytics",
  description:
    "Analytics dashboard with KPI cards, charts, data tables, and dark theme. Great for SaaS and internal tools.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["dashboard", "analytics", "charts", "kpi", "react", "tailwind"],
  free: false,
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "analytics-dashboard",
    },
    {
      name: "appName",
      description: "Dashboard name",
      type: "string",
      default: "Analytics Dashboard",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    recharts: "^2.13.3",
    "lucide-react": "^0.469.0",
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
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.13.3",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^6.0.3"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}`,
    },
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      path: "index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{appName}}</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "src/main.tsx",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: "src/App.tsx",
      content: `import { useState } from 'react';
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { day: 'Mon', revenue: 4000, users: 240 },
  { day: 'Tue', revenue: 3000, users: 139 },
  { day: 'Wed', revenue: 2000, users: 980 },
  { day: 'Thu', revenue: 2780, users: 390 },
  { day: 'Fri', revenue: 1890, users: 480 },
  { day: 'Sat', revenue: 2390, users: 380 },
  { day: 'Sun', revenue: 3490, users: 430 },
];

const STATS = [
  { label: 'Revenue', value: '$24,500', change: '+12%', icon: DollarSign },
  { label: 'Active Users', value: '1,230', change: '+5%', icon: Users },
  { label: 'Conversion', value: '3.2%', change: '-0.4%', icon: TrendingUp },
  { label: 'Health', value: '98%', change: '+1%', icon: Activity },
];

export default function App() {
  const [range, setRange] = useState('7d');

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 hidden md:flex flex-col">
        <h1 className="text-lg font-bold mb-6">{{appName}}</h1>
        <nav className="space-y-1 text-sm">
          {['Overview', 'Reports', 'Customers', 'Settings'].map(item => (
            <button key={item} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300">
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overview</h2>
          <select value={range} onChange={e => setRange(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#revenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4">New Users</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
              <Bar dataKey="users" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
`,
    },
  ],
};
