# MagicAppDev Roadmap & TODO

## ✅ Completed

- **Authentication**
  - [x] Manual Registration (Email/Password)
  - [x] Manual Login
  - [x] GitHub OAuth Integration
  - [x] Account Linking (Auto-link by email)
- **Backend API**
  - [x] Cloudflare Workers API (`@magicappdev/api`)
  - [x] D1 Database Schema (`users`, `accounts`, `sessions`)
- **AI Agent**
  - [x] `MagicAgent` implementation using Cloudflare Agents SDK
  - [x] Cloudflare AI Model Router (Chat, Complex, Fast, Code models)
  - [x] Template Suggestion Logic
- **Web Frontend**
  - [x] Authentication Pages (Login, Register)
  - [x] Interactive Chat Interface (`ChatPage`) with WebSockets
  - [x] Theme & UI Components (Material 3 / Tailwind)
- **Mobile App**
  - [x] Connect `apps/mobile` to API & Agent
  - [x] Implement Chat UI in React Native
- **CLI**
  - [x] Update CLI to use new Auth & Agent endpoints (Added `chat` command)

## 🚧 In Progress

- **Admin System**
  - [x] Admin API endpoints (API keys, system logs, global config)
  - [x] Change password endpoint
  - [ ] Mobile Admin screens (API keys, logs, config)

## ✅ Recently Completed

- **Admin System Backend**
  - [x] System Logs table schema
  - [x] Admin API Keys table schema
  - [x] Admin API endpoints (GET/POST/DELETE /admin/api-keys)
  - [x] System Logs endpoints (GET/POST /admin/logs, GET /logs/stats)
  - [x] Global Config endpoints (GET/PUT /admin/config)
  - [x] Change password endpoint (POST /auth/change-password)
  - [x] All lint and TypeScript errors fixed

- **Agent AI Integration**
  - [x] Connected minimal agent to Workers AI (`@cf/meta/llama-3.1-8b-instruct`)
  - [x] Chat persistence with Durable Object SQL storage
  - [x] Conversation history context in AI prompts
  - [x] Clear history functionality (UI + backend)
- **Web Chat Fix**
  - [x] Fixed WebSocket connection to deployed agent (wss:// protocol)
  - [x] Switched to native WebSocket for mobile compatibility

## 📋 Backlog

- **Production Readiness**
  - [x] CI/CD Pipelines (GitHub Actions) for Auto-Deploy
  - [x] Database Migrations in CI
  - [ ] End-to-End Testing (Playwright)
- **Agent Enhancements**
  - [ ] "Tool Use" for Agent (allow it to write files to the project)
  - [ ] Human-in-the-Loop flows for critical actions
- **Documentation**
  - [ ] API Documentation (OpenAPI/Swagger)
  - [ ] User Guides for Template Creation

## 🤖 AI Workers

- [x] **MagicAgent**: Main App Builder
- [x] **IssueReviewer**: Auto-review issues (Implemented)
- [x] **FeatureSuggester**: Roadmap generation (Implemented)

## Security

jsondiffpatch is vulnerable to Cross-site Scripting (XSS) via HtmlFormatter::nodeBegin Moderate

## 7 opened 12 hours ago • Detected in jsondiffpatch (npm) • pnpm-lock.yaml

@conventional-changelog/git-client has Argument Injection vulnerability Moderate

## 8 opened 12 hours ago • Detected in @conventional-changelog/git-client (npm) • pnpm-lock.yaml

esbuild enables any website to send any requests to the development server and read the response Moderate

## 6 opened 12 hours ago • Detected in esbuild (npm) • pnpm-lock.yaml

Vercel’s AI SDK's filetype whitelists can be bypassed when uploading files Low

## 9 opened 12 hours ago • Detected in ai (npm) • pnpm-lock.yaml

## 1

Vercel’s AI SDK's filetype whitelists can be bypassed when uploading files Low Direct

## Fix Dark Mode in App + Fix Project Tab/creating editing projects

## Admin System Logs , Global config , change password, create api keys

## Cli

- [ ] need to fix chat in the cli
      '''
      PS D:\repos\magicappdev> magicappdev auth whoami
      ✓ Logged in as: involvex
      PS D:\repos\magicappdev> magicappdev chat

  ╔╦╗╔═╗╔═╗╦╔═╗ ╔═╗╔═╗╔═╗╔╦╗╔═╗╦ ╦
  ║║║╠═╣║ ╦║║ ╠═╣╠═╝╠═╝ ║║║╣ ╚╗╔╝
  ╩ ╩╩ ╩╚═╝╩╚═╝ ╩ ╩╩ ╩ ═╩╝╚═╝ ╚╝

╭─────────────────────────────────────────╮
│ Magic AI Assistant │
╰─────────────────────────────────────────╯

ℹ Connecting to agent...
✖ Disconnected from agent
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76
'''

- [ ] add --debug / -v / --version flags
- [ ] add update available notifier
- [ ] cli always uses expo router template even react-native is selected or others
- [ ] Tabs template has that issue:
      ✗ Missing helper: "headerShown:"

- [ ] add DISCORD_OAUTH to Web page (login/signup or linking)
