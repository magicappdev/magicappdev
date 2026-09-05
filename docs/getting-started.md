# Getting Started with MagicAppDev

Welcome to **MagicAppDev** — the AI-powered, fullstack application building platform inspired by Expo and deployed entirely on Cloudflare Workers.

---

## 🚀 Quick Start

### 1. Prerequisites

- **Bun** (required v1.3.0 or higher)
- **Node.js** (v18+)
- **Wrangler CLI** (`bun add -g wrangler`)

### 2. Clone and Install

```bash
git clone https://github.com/magicappdev/magicappdev.git
cd magicappdev
bun install
```

### 3. Run Development Servers

To start all workspaces locally using Turborepo and Bun:

```bash
bun run build
```

To run individual packages (e.g., API or Web):

```bash
# Start Backend API (Hono on Cloudflare Workers)
cd packages/api && bun run dev

# Start Web Frontend (Vite + React)
cd apps/web && bun run dev
```

### 4. Seed Local Database

MagicAppDev uses Cloudflare D1 for persistence. To populate your local database with demo data:

```bash
cd packages/database
bun run seed
```

To wipe all data and reseed from scratch:

```bash
cd packages/database
bun run seed --reset
```

This creates demo users, projects, chat sessions, AI keys, tickets, project files, and system logs for local development and E2E testing.

---

## 🏗️ Architecture Overview

- **`packages/api`**: Hono backend running on Cloudflare Workers, handling authentication, sessions, and AI routing.
- **`packages/database`**: Drizzle ORM schemas and migrations targeting Cloudflare D1.
- **`packages/agent`**: Stateful Cloudflare Agents SDK integration for autonomous coding loops.
- **`packages/templates`**: Handlebars-based code generation templates.
- **`packages/cli`**: `create-magicappdev-app` CLI tool published on npm.
- **`apps/web`**: Next.js/Vite web application dashboard and AI chat interface.
- **`apps/mobile`**: Ionic + Capacitor cross-platform mobile application.
