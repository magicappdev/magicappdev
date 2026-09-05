/**
 * Landing Page template - React 18 + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const landingPageTemplate: Template = {
  id: "landing-page",
  name: "Landing Page",
  slug: "landing-page",
  description:
    "Marketing landing page with hero, features, testimonials, pricing, and CTA sections. Optimized for conversions.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["landing", "marketing", "conversion", "react", "tailwind"],
  free: true,
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "landing-page",
    },
    {
      name: "appName",
      description: "Product name",
      type: "string",
      default: "My Product",
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
  <body class="bg-white text-slate-900">
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

html { scroll-behavior: smooth; }
`,
    },
    {
      path: "src/App.tsx",
      content: `import { ArrowRight, CheckCircle2, Star } from 'lucide-react';

const FEATURES = [
  { title: 'Lightning Fast', description: 'Optimized for speed and performance from day one.' },
  { title: 'Secure by Default', description: 'Enterprise-grade security built into every layer.' },
  { title: 'Easy Integration', description: 'Connect with the tools your team already uses.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'CTO', text: 'Shipped our product in record time.' },
  { name: 'David R.', role: 'PM', text: 'The fastest onboarding we have ever had.' },
  { name: 'Amina L.', role: 'Founder', text: 'Worth every penny. Our users love it.' },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-lg">{{appName}}</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#testimonials" className="hover:text-slate-900">Testimonials</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <button className="ml-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">Get Started</button>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Build better products faster</h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">A modern platform to launch, measure, and grow your product without the usual engineering overhead.</p>
        <div className="flex items-center justify-center gap-3">
          <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium">Start free trial</button>
          <button className="px-5 py-2.5 border border-slate-200 rounded-xl font-medium">See how it works</button>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(feature => (
            <div key={feature.title} className="border rounded-2xl p-6">
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials" className="bg-slate-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Loved by teams</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white border rounded-2xl p-6">
                <div className="flex gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-700 mb-4">"{t.text}"</p>
                <p className="text-xs font-semibold">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Simple pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {['Starter', 'Pro', 'Business'].map((plan, idx) => (
            <div key={plan} className={"border rounded-2xl p-6 " + (idx === 1 ? 'border-slate-900 shadow-lg' : '')}>
              <h3 className="font-semibold text-lg">{plan}</h3>
              <p className="text-3xl font-bold my-3">\${[19, 49, 99][idx]}</p>
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                {['Core features', 'Analytics', 'Support'].slice(0, idx + 2).map(item => (
                  <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{item}</li>
                ))}
              </ul>
              <button className={"w-full py-2 rounded-xl text-sm font-medium " + (idx === 1 ? 'bg-slate-900 text-white' : 'border')}>Choose {plan}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-600 mb-6">Launch your next project today.</p>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium inline-flex items-center gap-2">
            Start building <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-xs text-slate-500 text-center">© {new Date().getFullYear()} {{appName}}. All rights reserved.</div>
      </footer>
    </div>
  );
}
`,
    },
  ],
};
