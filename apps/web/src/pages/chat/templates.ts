export type TemplateCategory =
  "all" | "app" | "landing" | "component" | "dashboard";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: Exclude<TemplateCategory, "all">;
  prompt: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  free: boolean;
  author: string;
  likes: number;
  preview?: string;
}

export const TEMPLATE_CATEGORIES: Array<{
  id: TemplateCategory;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "app", label: "Apps & Games" },
  { id: "landing", label: "Landing Pages" },
  { id: "component", label: "Components" },
  { id: "dashboard", label: "Dashboards" },
];

import { getPromptPresetsAsStrings } from "@magicappdev/shared/utils";

export const QUICK_SUGGESTIONS = getPromptPresetsAsStrings({ count: 6 });

const UI_TEMPLATE_META: Record<
  string,
  {
    name: string;
    description: string;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    likes: number;
    preview?: string;
    prompt: string;
    category: Exclude<TemplateCategory, "all">;
  }
> = {
  "react-spa": {
    name: "React Starter",
    description: "Single-page app with React 18, Vite, and Tailwind",
    emoji: "⚛️",
    gradientFrom: "from-blue-600",
    gradientTo: "to-cyan-500",
    likes: 2340,
    preview: "React + Vite + TypeScript + Tailwind",
    category: "app",
    prompt:
      "Create a React 18 single-page app with Vite, TypeScript, and Tailwind CSS. Include routing, state management, and a polished dashboard layout.",
  },
  "vue-spa": {
    name: "Vue Starter",
    description: "Single-page app with Vue 3, Router, and Pinia",
    emoji: "💚",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-green-400",
    likes: 1870,
    preview: "Vue 3 + Vite + TypeScript + Tailwind",
    category: "app",
    prompt:
      "Create a Vue 3 + Vite + TypeScript single-page app with Vue Router, Pinia state management, Tailwind CSS styling, and a polished dashboard layout.",
  },
  "express-api": {
    name: "Express API",
    description: "REST API with TypeScript, Zod validation, and logging",
    emoji: "⚡",
    gradientFrom: "from-gray-700",
    gradientTo: "to-gray-500",
    likes: 1340,
    preview: "Express + TypeScript + Zod validation",
    category: "app",
    prompt:
      "Create an Express + TypeScript REST API with Zod validation, CORS, structured logging, and health checks. Include user and project routes as a starting point.",
  },
  "astro-site": {
    name: "Astro Site",
    description: "Static site with Tailwind and multiple pages",
    emoji: "🚀",
    gradientFrom: "from-purple-700",
    gradientTo: "to-indigo-400",
    likes: 980,
    preview: "Astro + Tailwind + TypeScript",
    category: "landing",
    prompt:
      "Create an Astro static site with Tailwind CSS, TypeScript, and multiple pages including Home and About. Optimize for Vercel serverless deployment.",
  },
  "chat-app": {
    name: "Chat App",
    description: "Real-time chat UI with sidebar and dark theme",
    emoji: "💬",
    gradientFrom: "from-sky-600",
    gradientTo: "to-blue-400",
    likes: 1560,
    preview: "Real-time chat UI with sidebar",
    category: "app",
    prompt:
      "Create a real-time chat application UI with user sidebar, message history, input area, and smooth animations. Use a modern dark theme and clean layout.",
  },
  blog: {
    name: "Blog",
    description: "Astro blog with content collections, tags, and RSS",
    emoji: "✍️",
    gradientFrom: "from-orange-600",
    gradientTo: "to-amber-400",
    likes: 1120,
    preview: "Astro blog with content collections",
    category: "landing",
    prompt:
      "Create an Astro-based blog with content collections, markdown posts, tags, and an RSS feed. Include Home and About pages with Tailwind styling.",
  },
  "dashboard-analytics": {
    name: "Analytics Dashboard",
    description: "KPI cards, revenue charts, and data visualization",
    emoji: "📊",
    gradientFrom: "from-indigo-600",
    gradientTo: "to-blue-400",
    likes: 2100,
    preview: "KPI cards, charts, data viz",
    category: "dashboard",
    prompt:
      "Create an analytics dashboard with KPI cards, area chart for revenue, bar chart for user acquisition, and dark theme.",
  },
  "landing-page": {
    name: "Landing Page",
    description: "Marketing page with hero, pricing, FAQ, and footer",
    emoji: "🚀",
    gradientFrom: "from-pink-600",
    gradientTo: "to-rose-400",
    likes: 1890,
    preview: "Hero, features, pricing, CTA",
    category: "landing",
    prompt:
      "Create a modern marketing landing page with animated hero, features grid, testimonials carousel, pricing table, FAQ, and footer.",
  },
  "task-manager": {
    name: "Task Manager",
    description: "Tasks with priorities, due dates, and filtering",
    emoji: "✅",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-green-400",
    likes: 1450,
    preview: "Tasks, priorities, due dates",
    category: "app",
    prompt:
      "Create a task manager app with task creation, priority levels, completion toggling, due dates, filtering, and clean dark UI.",
  },
  "weather-app": {
    name: "Weather App",
    description: "City search, current conditions, and 5-day forecast",
    emoji: "🌤️",
    gradientFrom: "from-sky-600",
    gradientTo: "to-blue-400",
    likes: 1230,
    preview: "Forecast, search, dynamic UI",
    category: "app",
    prompt:
      "Create a weather app with city search, current conditions, 5-day forecast, and dynamic gradient backgrounds.",
  },
  "card-component": {
    name: "Card",
    description: "Versatile card with header, body, and footer slots",
    emoji: "🃏",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-blue-400",
    likes: 780,
    preview: "Header, body, footer slots",
    category: "component",
    prompt:
      "Create a versatile card component with header, body, and footer slots. Include padding variants and hover effects.",
  },
  "input-component": {
    name: "Input",
    description: "Form input with label, hint, and error states",
    emoji: "🔤",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-teal-400",
    likes: 650,
    preview: "Label, hint, error, success states",
    category: "component",
    prompt:
      "Create a form input component with label, hint, error state, and variants. Include icon slot support.",
  },
  "modal-component": {
    name: "Modal",
    description: "Accessible dialog with overlay and size variants",
    emoji: "🪟",
    gradientFrom: "from-violet-500",
    gradientTo: "to-purple-400",
    likes: 890,
    preview: "Overlay, focus trap, size variants",
    category: "component",
    prompt:
      "Create an accessible modal dialog with overlay, close button, title, description, and size variants.",
  },
  "navbar-component": {
    name: "Navbar",
    description: "Responsive navbar with links, CTA, and mobile menu",
    emoji: "🧭",
    gradientFrom: "from-slate-600",
    gradientTo: "to-slate-400",
    likes: 920,
    preview: "Responsive links, CTA, mobile menu",
    category: "component",
    prompt:
      "Create a responsive navbar with brand logo, navigation links, CTA button, and mobile menu toggle.",
  },
  "badge-component": {
    name: "Badge",
    description: "Compact badge with color variants and status dot",
    emoji: "🏷️",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-400",
    likes: 540,
    preview: "Color variants, sizes, status dot",
    category: "component",
    prompt:
      "Create a compact badge component with color variants, sizes, and optional leading status dot.",
  },
};

const WEB_ONLY_TEMPLATES: Template[] = [
  {
    id: "todo-app",
    name: "Todo App",
    description: "Task manager with priorities, filtering, and persistence",
    category: "app",
    prompt:
      "Create a beautiful todo app with task creation, priority levels (high/medium/low), completion toggling, due dates, and filtering by status. Dark theme with smooth animations.",
    emoji: "✅",
    gradientFrom: "from-blue-600",
    gradientTo: "to-cyan-500",
    free: true,
    author: "MagicApp",
    likes: 1240,
  },
  {
    id: "snake-game",
    name: "Snake Game",
    description: "Classic arcade game with smooth controls and high score",
    category: "app",
    prompt:
      "Build a classic Snake game using canvas. Include smooth movement, score tracking, high score persistence, increasing difficulty, and a polished game over screen. Dark neon theme.",
    emoji: "🐍",
    gradientFrom: "from-green-600",
    gradientTo: "to-emerald-400",
    free: true,
    author: "MagicApp",
    likes: 890,
  },
  {
    id: "quiz-app",
    name: "Quiz App",
    description: "Interactive trivia with timer, scoring, and results",
    category: "app",
    prompt:
      "Create an interactive quiz app with multiple-choice questions, countdown timer, score tracking, answer feedback, and a results summary with share button.",
    emoji: "❓",
    gradientFrom: "from-purple-600",
    gradientTo: "to-pink-500",
    free: true,
    author: "MagicApp",
    likes: 654,
  },
  {
    id: "calculator",
    name: "Calculator",
    description: "Full-featured calculator with history and keyboard support",
    category: "app",
    prompt:
      "Build a beautiful calculator app with standard and scientific modes, calculation history panel, keyboard input support, and a dark glass-morphism design.",
    emoji: "🔢",
    gradientFrom: "from-slate-600",
    gradientTo: "to-slate-400",
    free: true,
    author: "MagicApp",
    likes: 432,
  },
  {
    id: "saas-landing",
    name: "SaaS Landing",
    description: "Hero, features, pricing table, and CTA",
    category: "landing",
    prompt:
      "Create a modern SaaS landing page with animated hero, features grid with icons, social proof carousel, three-tier pricing table, FAQ, and footer. Dark theme with purple/indigo accent.",
    emoji: "🚀",
    gradientFrom: "from-violet-600",
    gradientTo: "to-indigo-400",
    free: true,
    author: "MagicApp",
    likes: 2100,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Developer portfolio with projects and contact form",
    category: "landing",
    prompt:
      "Build a developer portfolio page with hero, animated skills grid, project cards with GitHub/live links, timeline, and a contact form. Minimal dark design.",
    emoji: "💼",
    gradientFrom: "from-orange-500",
    gradientTo: "to-rose-400",
    free: true,
    author: "MagicApp",
    likes: 1560,
  },
  {
    id: "product-showcase",
    name: "Product Showcase",
    description: "Product landing with features and testimonials",
    category: "landing",
    prompt:
      "Create a product showcase landing page with animated hero, feature highlights, customer testimonials carousel, and a sticky purchase CTA. Clean modern design.",
    emoji: "📦",
    gradientFrom: "from-teal-600",
    gradientTo: "to-cyan-400",
    free: true,
    author: "MagicApp",
    likes: 987,
  },
  {
    id: "contact-form",
    name: "Contact Form",
    description: "Accessible form with validation and submission states",
    category: "component",
    prompt:
      "Create an accessible contact form with name, email, subject, and message fields. Include client-side validation, loading states, and success/error feedback with smooth animations.",
    emoji: "📬",
    gradientFrom: "from-blue-500",
    gradientTo: "to-sky-300",
    free: true,
    author: "MagicApp",
    likes: 789,
    preview: "Form fields with validation states",
  },
  {
    id: "data-table",
    name: "Data Table",
    description: "Sortable, filterable table with pagination",
    category: "component",
    prompt:
      "Build a data table component with column sorting, global search filtering, pagination, row selection, and CSV export. Clean design with sticky headers.",
    emoji: "📊",
    gradientFrom: "from-slate-500",
    gradientTo: "to-slate-300",
    free: true,
    author: "MagicApp",
    likes: 543,
    preview: "Sortable columns, search, pagination",
  },
  {
    id: "image-gallery",
    name: "Image Gallery",
    description: "Masonry grid with lightbox and lazy loading",
    category: "component",
    prompt:
      "Create an image gallery with masonry layout, lightbox with zoom and keyboard navigation, and lazy loading. Smooth open/close animations.",
    emoji: "🖼️",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-300",
    free: true,
    author: "MagicApp",
    likes: 678,
    preview: "Masonry grid with lightbox zoom",
  },
  {
    id: "analytics-dashboard",
    name: "Analytics Dashboard",
    description: "KPI cards, charts, and data visualization",
    category: "dashboard",
    prompt:
      "Build an analytics dashboard with KPI cards showing growth, area chart for revenue, bar chart for user acquisition, pie chart for traffic sources, and a recent activity feed. Dark theme.",
    emoji: "📈",
    gradientFrom: "from-green-600",
    gradientTo: "to-teal-400",
    free: false,
    author: "MagicApp",
    likes: 1890,
  },
  {
    id: "admin-panel",
    name: "Admin Panel",
    description: "User management with search, roles, and stats",
    category: "dashboard",
    prompt:
      "Create an admin panel with dark sidebar navigation, user management table with search and role editing, system stats cards, and an activity log. Enterprise design.",
    emoji: "⚙️",
    gradientFrom: "from-indigo-600",
    gradientTo: "to-purple-400",
    free: false,
    author: "MagicApp",
    likes: 1234,
  },
];

function toWebTemplate(
  id: string,
  meta: (typeof UI_TEMPLATE_META)[string],
): Template {
  return {
    id,
    name: meta.name,
    description: meta.description,
    category: meta.category,
    prompt: meta.prompt,
    emoji: meta.emoji,
    gradientFrom: meta.gradientFrom,
    gradientTo: meta.gradientTo,
    free: true,
    author: "MagicApp",
    likes: meta.likes,
    preview: meta.preview,
  };
}

export const TEMPLATES: Template[] = [
  ...WEB_ONLY_TEMPLATES,
  ...Object.entries(UI_TEMPLATE_META).map(([id, meta]) =>
    toWebTemplate(id, meta),
  ),
];
