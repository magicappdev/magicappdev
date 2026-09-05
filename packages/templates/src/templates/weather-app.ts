/**
 * Weather App template - React 18 + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const weatherAppTemplate: Template = {
  id: "weather-app",
  name: "Weather App",
  slug: "weather-app",
  description:
    "Weather dashboard with current conditions, forecast, location search, and dynamic backgrounds.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["weather", "dashboard", "api", "react", "tailwind"],
  free: true,
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "weather-app",
    },
    {
      name: "appName",
      description: "App name",
      type: "string",
      default: "Weather App",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
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
  <body class="bg-slate-50 text-slate-900">
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
import { Search, MapPin, Wind, Droplets, Gauge } from 'lucide-react';

const FORECAST = [
  { day: 'Mon', temp: 72, condition: 'Sunny' },
  { day: 'Tue', temp: 68, condition: 'Cloudy' },
  { day: 'Wed', temp: 64, condition: 'Rain' },
  { day: 'Thu', temp: 70, condition: 'Sunny' },
  { day: 'Fri', temp: 75, condition: 'Sunny' },
];

export default function App() {
  const [city, setCity] = useState('San Francisco');
  const [query, setQuery] = useState('');

  const search = () => {
    if (query.trim()) setCity(query.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 text-white">
      <header className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-white/80" />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Search city..." className="bg-transparent outline-none placeholder-white/70 text-sm w-full" />
        </div>
        <button onClick={search} className="px-4 py-2 bg-white text-sky-700 rounded-xl text-sm font-semibold">Search</button>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-10 space-y-6">
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{city}</span>
          </div>
          <div className="text-5xl font-bold">72°</div>
          <p className="text-white/80 mt-1">Partly Cloudy</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-4">
            <Wind className="w-4 h-4 mb-2 text-white/80" />
            <p className="text-xs text-white/70">Wind</p>
            <p className="font-semibold">12 mph</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <Droplets className="w-4 h-4 mb-2 text-white/80" />
            <p className="text-xs text-white/70">Humidity</p>
            <p className="font-semibold">64%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <Gauge className="w-4 h-4 mb-2 text-white/80" />
            <p className="text-xs text-white/70">Pressure</p>
            <p className="font-semibold">1013 hPa</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">5-Day Forecast</h3>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {FORECAST.map(item => (
              <div key={item.day} className="bg-white/10 rounded-xl py-3">
                <p className="text-xs text-white/70">{item.day}</p>
                <p className="mt-2 font-semibold">{item.temp}°</p>
                <p className="text-[11px] text-white/80">{item.condition}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
`,
    },
  ],
};
