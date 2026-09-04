import type { Ionicons } from "@expo/vector-icons";

export interface MobileTemplate {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tags: string[];
  free?: boolean;
}

export const MOBILE_TEMPLATES: MobileTemplate[] = [
  {
    id: "social-media",
    name: "Social Media",
    description: "Feed, profiles, posts, likes, and comments",
    icon: "people-outline",
    color: "#8B5CF6",
    tags: ["social", "feed", "profile"],
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Product catalog, cart, checkout, orders",
    icon: "cart-outline",
    color: "#10B981",
    tags: ["shop", "cart", "products"],
    free: false,
  },
  {
    id: "fitness",
    name: "Fitness Tracker",
    description: "Workouts, progress charts, goals, streaks",
    icon: "fitness-outline",
    color: "#F59E0B",
    tags: ["health", "gym", "tracking"],
  },
  {
    id: "recipes",
    name: "Recipe & Food",
    description: "Browse recipes, meal plans, grocery lists",
    icon: "restaurant-outline",
    color: "#EF4444",
    tags: ["food", "cooking", "recipes"],
  },
  {
    id: "tasks",
    name: "Task Manager",
    description: "Todo lists, categories, reminders",
    icon: "checkbox-outline",
    color: "#3B82F6",
    tags: ["productivity", "tasks", "todo"],
  },
  {
    id: "chat",
    name: "Chat App",
    description: "Direct messages, group chats, media sharing",
    icon: "chatbubbles-outline",
    color: "#06B6D4",
    tags: ["messaging", "chat", "dm"],
    free: false,
  },
  {
    id: "news",
    name: "News & Blog",
    description: "Article feed, categories, bookmarks",
    icon: "newspaper-outline",
    color: "#6366F1",
    tags: ["news", "blog", "articles"],
  },
  {
    id: "events",
    name: "Event & Booking",
    description: "Event listings, RSVP, scheduling",
    icon: "calendar-outline",
    color: "#EC4899",
    tags: ["events", "booking", "calendar"],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Gallery, project showcase, contact form",
    icon: "briefcase-outline",
    color: "#14B8A6",
    tags: ["portfolio", "personal", "showcase"],
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with no pre-built screens",
    icon: "create-outline",
    color: "#64748B",
    tags: ["blank", "custom", "minimal"],
  },
];

export function getTemplateById(id: string): MobileTemplate | undefined {
  return MOBILE_TEMPLATES.find(t => t.id === id);
}
