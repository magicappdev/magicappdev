/**
 * Context-aware chat prompt presets for MagicAppDev.
 *
 * Generates suggestion chips based on:
 * - Time of day
 * - Chat state (fresh chat vs ongoing conversation)
 * - Previous suggestions (for reroll)
 */

export interface PromptPreset {
  label: string;
  prompt: string;
  category: "app" | "landing" | "component" | "dashboard" | "general";
}

const STARTER_PROMPTS: PromptPreset[] = [
  {
    label: "Todo App",
    prompt:
      "Create a beautiful todo app with task creation, priority levels (high/medium/low), completion toggling, due dates, and filtering by status. Dark theme with smooth animations.",
    category: "app",
  },
  {
    label: "Snake Game",
    prompt:
      "Build a classic Snake game using canvas. Include smooth movement, score tracking, high score persistence, increasing difficulty, and a polished game over screen. Dark neon theme.",
    category: "app",
  },
  {
    label: "SaaS Landing",
    prompt:
      "Create a modern SaaS landing page with animated hero, features grid with icons, social proof carousel, three-tier pricing table, FAQ, and footer. Dark theme with purple/indigo accent.",
    category: "landing",
  },
  {
    label: "Contact Form",
    prompt:
      "Create an accessible contact form with name, email, subject, and message fields. Include client-side validation, loading states, and success/error feedback with smooth animations.",
    category: "component",
  },
  {
    label: "Analytics Dashboard",
    prompt:
      "Build an analytics dashboard with KPI cards showing growth, area chart for revenue, bar chart for user acquisition, pie chart for traffic sources, and a recent activity feed. Dark theme.",
    category: "dashboard",
  },
  {
    label: "Portfolio",
    prompt:
      "Build a developer portfolio page with hero, animated skills grid, project cards with GitHub/live links, timeline, and a contact form. Minimal dark design.",
    category: "landing",
  },
  {
    label: "Quiz App",
    prompt:
      "Create an interactive quiz app with multiple-choice questions, countdown timer, score tracking, answer feedback, and a results summary with share button.",
    category: "app",
  },
  {
    label: "Data Table",
    prompt:
      "Build a data table component with column sorting, global search filtering, pagination, row selection, and CSV export. Clean design with sticky headers.",
    category: "component",
  },
  {
    label: "Weather App",
    prompt:
      "Create a weather dashboard with current conditions, 5-day forecast cards, and animated weather icons. Clean, modern design with location-based updates.",
    category: "app",
  },
  {
    label: "Calculator",
    prompt:
      "Build a beautiful calculator app with standard and scientific modes, calculation history panel, keyboard input support, and a dark glass-morphism design.",
    category: "app",
  },
  {
    label: "Admin Panel",
    prompt:
      "Create an admin panel with dark sidebar navigation, user management table with search and role editing, system stats cards, and an activity log. Enterprise design.",
    category: "dashboard",
  },
  {
    label: "Image Gallery",
    prompt:
      "Create an image gallery with masonry layout, lightbox with zoom and keyboard navigation, and lazy loading. Smooth open/close animations.",
    category: "component",
  },
];

const FOLLOW_UP_PROMPTS: PromptPreset[] = [
  {
    label: "Add Authentication",
    prompt:
      "Add user authentication with email/password login, registration, and protected routes.",
    category: "general",
  },
  {
    label: "Add Dark Mode",
    prompt:
      "Add dark mode toggle with system preference detection and persistent theme selection.",
    category: "general",
  },
  {
    label: "Add API Integration",
    prompt:
      "Connect this app to a REST API with proper error handling, loading states, and caching.",
    category: "general",
  },
  {
    label: "Add Tests",
    prompt:
      "Add unit tests and integration tests for the main components and user flows.",
    category: "general",
  },
  {
    label: "Improve Accessibility",
    prompt:
      "Review and improve accessibility with proper ARIA labels, keyboard navigation, and screen reader support.",
    category: "general",
  },
  {
    label: "Add Animations",
    prompt:
      "Add smooth animations and transitions throughout the app for a more polished user experience.",
    category: "general",
  },
  {
    label: "Mobile Responsive",
    prompt:
      "Make the layout fully responsive for mobile, tablet, and desktop viewports.",
    category: "general",
  },
  {
    label: "Add Notifications",
    prompt:
      "Add push notifications and in-app notification center with real-time updates.",
    category: "general",
  },
];

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 16807 + 0) % 2147483647;
    const j = currentSeed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function filterByCategory(
  presets: PromptPreset[],
  preferredCategory: PromptPreset["category"] | null,
): PromptPreset[] {
  if (!preferredCategory) return presets;
  const prioritized = presets.filter(p => p.category === preferredCategory);
  const rest = presets.filter(p => p.category !== preferredCategory);
  return [...prioritized, ...rest];
}

export function getPromptPresets(
  options: {
    messageCount?: number;
    preferredCategory?: PromptPreset["category"] | null;
    seed?: number;
    count?: number;
  } = {},
): PromptPreset[] {
  const {
    messageCount = 0,
    preferredCategory = null,
    seed = Date.now(),
    count = 4,
  } = options;

  const pool = messageCount === 0 ? STARTER_PROMPTS : FOLLOW_UP_PROMPTS;
  const timeOfDay = getTimeOfDay();

  let filtered = pool;

  // Bias starter suggestions toward buildable app/landing ideas in the morning
  // and keep the same bias in the evening/night to reduce decision fatigue.
  if (timeOfDay === "morning") {
    filtered = filterByCategory(pool, preferredCategory ?? "app");
  } else if (timeOfDay === "evening" || timeOfDay === "night") {
    filtered = filterByCategory(pool, preferredCategory ?? "app");
  }

  const shuffled = shuffleArray(filtered, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getPromptPresetsAsStrings(
  options: {
    messageCount?: number;
    preferredCategory?: PromptPreset["category"] | null;
    seed?: number;
    count?: number;
  } = {},
): string[] {
  return getPromptPresets(options).map(p => p.prompt);
}

export { STARTER_PROMPTS, FOLLOW_UP_PROMPTS };
