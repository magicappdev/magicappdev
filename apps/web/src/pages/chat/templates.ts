export type TemplateCategory =
  | "all"
  | "app"
  | "landing"
  | "component"
  | "dashboard";

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

export const QUICK_SUGGESTIONS = [
  {
    label: "Contact Form",
    prompt:
      "Create a beautiful contact form with name, email, message fields, validation, and a success state",
  },
  {
    label: "Image Editor",
    prompt:
      "Build an in-browser image editor with crop, brightness, contrast, saturation, and blur controls",
  },
  {
    label: "Mini Game",
    prompt:
      "Create a fun Snake game with smooth movement, score tracking, increasing difficulty, and a game over screen",
  },
  {
    label: "Finance Calculator",
    prompt:
      "Build a compound interest calculator with loan payment, savings goal, and investment projection tools",
  },
  {
    label: "Weather App",
    prompt:
      "Create a weather dashboard with current conditions, 5-day forecast cards, and animated weather icons",
  },
  {
    label: "Todo List",
    prompt:
      "Build a todo app with priorities, due dates, tags, filtering, and local storage persistence",
  },
];

export const TEMPLATES: Template[] = [
  // Apps & Games
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
  // Landing Pages
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
  // Components
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
  },
  // Dashboards
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
