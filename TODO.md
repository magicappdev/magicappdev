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
- **Admin System**
  - [x] Admin API endpoints (API keys, system logs, global config)
  - [x] Change password endpoint
  - [x] Mobile Admin screens (API keys, logs, config, users, change password)
- **Agent AI Integration**
  - [x] Connected minimal agent to Workers AI (`@cf/meta/llama-3.1-8b-instruct`)
  - [x] Chat persistence with Durable Object SQL storage
  - [x] Conversation history context in AI prompts
  - [x] Clear history functionality (UI + backend)
- **Web Chat Fix**
  - [x] Fixed WebSocket connection to deployed agent (wss:// protocol)
  - [x] Switched to native WebSocket for mobile compatibility

## 🤖 AI Workers

- [x] **MagicAgent**: Main App Builder
- [x] **IssueReviewer**: Auto-review issues (Implemented)
- [x] **FeatureSuggester**: Roadmap generation (Implemented)

---

## ✅ Recently Completed (Free-Tier & Vibe Coding Features)

- [x] **Client-Side ESM/Iframe Sandbox**: Zero-cost in-browser React component and file preview without expensive remote server sandboxes.
- [x] **Prompt-to-Template Auto-Mapper**: Automatic template selection based on natural language prompts in `@magicappdev/agent`.
- [x] **Local SQLite / D1 Backup & Export Utility**: Added export support for zero-cost free tier data persistence.
- [x] **Mobile CI/CD & E-Commerce Template**: Shipped e-commerce template and mobile APK workflow.

### CLI Chat Connection Fix (P1)

- [x] Replaced `AgentClient` with native `ws` WebSocket library
- [x] Added connection timeout handling (10s)
- [x] Added response timeout handling (60s)
- [x] Added `--debug` flag to chat command for troubleshooting
- [x] Fixed Windows compatibility issue with libuv async handles
- [x] Fixed agent streaming to use `getReader()` pattern
- [x] Added `chat_start` message type for model indication
- [x] Added proper handling of `state:update` messages from agents SDK

### Axiom Logging Integration (P1)

- [x] Created `@magicappdev/axiom-logpush` package
- [x] Updated worker to use environment variables for secrets (`AXIOM_TOKEN`, `AXIOM_DATASET`)
- [x] Fixed ESLint configuration isolation (root: true to prevent typescript-eslint inheritance)
- [x] Created wrangler.toml with proper secret bindings

### Template Generation Fixes (P1)

- [x] Fixed template selection bug (always using "blank")
- [x] Updated templates to use Expo SDK 53 / React Native 0.79
- [x] Added auto-install after project creation
- [x] Fixed Handlebars `{{{{raw}}}}` blocks for JSX escaping

### Security Vulnerabilities (P2)

- [x] Added dependency overrides for `esbuild>=0.25.0` and `jsondiffpatch>=0.6.0` (now via Bun overrides)
- [x] Updated vulnerable transitive dependencies

### CLI Enhancements (P3)

- [x] Added `-V, --version` flag (displays version)
- [x] Added `-d, --debug` flag (enables debug logging)
- [x] Added update notifier (checks npm registry for new versions)
- [x] Fixed `promptMultiSelect` for preferences (was using wrong prompts type)
- [x] Added Ctrl+C / SIGINT handling for graceful exit

### Mobile Version Management (P4)

- [x] Added `version:patch` script (bumps patch version)
- [x] Added `version:minor` script (bumps minor version)
- [x] Added `version:major` script (bumps major version)
- [x] Created `scripts/sync-version.js` to sync package.json → app.json
- [x] Auto-increments iOS buildNumber and Android versionCode

---

## 🔥 Priority 1: Critical Bug Fixes

### CLI Chat Connection Issue

**Status:** ✅ Fixed

- Replaced `AgentClient` with native `ws` WebSocket
- Added proper timeout and error handling

---

## 🔒 Priority 2: Security Vulnerabilities

**Status:** ✅ Fixed

- Added dependency overrides for vulnerable packages

---

## 🛠️ Priority 3: CLI Enhancements

### 3.1 Add Standard CLI Flags

- [x] Add `--version` / `-V` flag
- [x] Add `--debug` / `-d` flag for verbose logging
- [ ] Add `--help` improvements with examples

### 3.2 Update Available Notifier

- [x] Implement update notifier (checks npm registry)
- [x] Display message if newer version available
- [ ] Add `--no-update-check` flag to skip

### 3.3 Template Selection Bug

**Problem:** CLI always uses Expo Router template even when React Native is selected

**Tasks:**

- [x] Investigate template selection logic in init command
- [x] Fix template mapping to respect user selection
- [ ] Add tests for template selection
- [ ] Create separate GitHub repo for templates (`magicappdev/templates`)
- [ ] Implement GitHub template download mechanism

### 3.4 Tabs Template Helper Issue

**Error:** `✗ Missing helper: "headerShown:"`

**Tasks:**

- [x] Review Handlebars template helpers registration
- [x] Add missing `headerShown` helper
- [ ] Test all template options end-to-end

---

## 📱 Priority 4: Mobile App Version Management

**Status:** ✅ Implemented

### Available Scripts (apps/mobile)

```bash
bun run version:patch   # 0.0.3 → 0.0.4, buildNumber: 3 → 4
bun run version:minor   # 0.0.3 → 0.1.0, buildNumber: 3 → 4
bun run version:major   # 0.0.3 → 1.0.0, buildNumber: 3 → 4
```

**Completed:**

- [x] Created `scripts/sync-version.js` (syncs package.json → app.json)
- [x] Added version:patch, version:minor, version:major scripts
- [x] Auto-increments iOS buildNumber and Android versionCode
- [ ] Document version bump workflow
- [ ] Integrate with CI/CD release process

---

## 🔐 Priority 5: Discord OAuth Integration

### Web Authentication Enhancement

- [ ] Create Discord OAuth app in Discord Developer Portal
- [ ] Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to API env
- [ ] Implement `/auth/discord/callback` endpoint in API
- [ ] Add Discord OAuth button to web login/register pages
- [ ] Add Discord account linking in user settings
- [ ] Update database schema for Discord accounts

---

## 🎨 Priority 6: UI/UX Improvements

### Fix Dark Mode Issues

- [ ] Audit all screens for dark mode support
- [ ] Fix text contrast issues
- [ ] Ensure consistent theme switching

### Fix Project Tab/Creating/Editing

- [ ] Review project creation flow
- [ ] Fix project editing functionality
- [ ] Add proper form validation
- [ ] Improve error messaging

---

## 📋 Priority 7: Production Readiness

### End-to-End Testing (Playwright)

- [ ] Set up Playwright in `apps/web`
- [ ] Create test fixtures for authentication
- [ ] Write tests for:
  - [ ] Login/Register flows
  - [ ] Chat interface
  - [ ] Project management
  - [ ] Admin panel
- [ ] Add to CI/CD pipeline

### API Documentation

- [ ] Generate OpenAPI/Swagger spec from Hono routes
- [ ] Create interactive API documentation page
- [ ] Document authentication flows
- [ ] Add example requests/responses

---

## 🚀 Priority 8: Agent Enhancements

### Tool Use for Agent

- [ ] Define tool schema for file operations
- [ ] Implement file write/read tools
- [ ] Add project scaffold generation
- [ ] Implement code generation tools

### Human-in-the-Loop Flows

- [ ] Design confirmation UI for critical actions
- [ ] Implement approval workflow for:
  - [ ] File modifications
  - [ ] Dependency installations
  - [ ] Configuration changes
- [ ] Add rollback capabilities

---

## 📚 Priority 9: Documentation

### User Guides

- [ ] Getting Started guide
- [ ] Template creation tutorial
- [ ] CLI reference documentation
- [ ] Mobile app usage guide

### Developer Documentation

- [ ] Architecture overview
- [ ] Contributing guide
- [ ] API endpoint reference
- [ ] Database schema documentation

---

## 📊 Implementation Timeline

| Priority | Items               | Est. Effort | Status  |
| -------- | ------------------- | ----------- | ------- |
| P1       | CLI Chat Bug        | 4-8 hours   | ✅ Done |
| P2       | Security Fixes      | 2-4 hours   | ✅ Done |
| P3       | CLI Enhancements    | 8-12 hours  | ✅ Done |
| P4       | Mobile Version Mgmt | 1-2 hours   | ✅ Done |
| P5       | Discord OAuth       | 6-8 hours   | 📋      |
| P6       | UI/UX Fixes         | 4-6 hours   | 📋      |
| P7       | E2E Testing         | 12-16 hours | 📋      |
| P8       | Agent Enhancements  | 20-40 hours | 📋      |
| P9       | Documentation       | 8-12 hours  | 📋      |

**Legend:** ✅ Done | 🚧 In Progress | 📋 Backlog

---

## Quick Reference: Next Actions

1. **Immediate:** Test web chat code generation (chat → template → generate → view code)
2. **This Week:** Fix broken routes/buttons in web and mobile apps
3. **Next:** Add Discord OAuth integration
4. **Ongoing:** UI/UX fixes, E2E testing, Documentation

---

## ✅ Just Completed

### Agent Code Generation (Core Feature)

- [x] Added `generate_project` message handler to agent
- [x] Added `list_templates` message handler
- [x] Implemented in-memory code generation from templates
- [x] Agent now sends `generation_file` messages for each file
- [x] Agent sends `generation_complete` with dependencies

### Web Chat UI Enhancement

- [x] Added generated project display with file browser
- [x] Files are collapsible with syntax highlighting
- [x] Shows dependencies from template
- [x] Download button for generated code
- [x] Loading state during generation
