# Feature Suggestions & Improvement Report

This document outlines high-priority features, repository improvements, and design enhancements for the `MagicAppDev` platform.

---

## 1. High-Priority Feature Suggestions

| ID           | Category                           | Description                                                                                                                | Impact | Effort |
| :----------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| **FEAT-005** | **Client-Side ESM Sandbox**        | Zero-cost in-browser React component and HTML preview using ES modules and Babel standalone without paid remote sandboxes. | High   | Medium |
| **FEAT-006** | **Prompt-to-Template Auto-Mapper** | Natural language intent mapping to templates inside `@magicappdev/agent` for instantaneous no-code scaffolding.            | High   | Low    |
| **FEAT-007** | **Local SQLite Export**            | Built-in database and project export tool for free-tier Cloudflare Workers & D1 users.                                     | Medium | Low    |

---

## 2. Repository & Architecture Improvements

| ID           | Category                       | Description                                                                                                                                                                                    | Impact | Effort |
| :----------- | :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| **REPO-001** | **Build System Consolidation** | Harmonize the hybrid Nx + Turborepo setup by ensuring all packages have consistent `project.json` definitions, fully registering `apps/mobile`, and aligning package scripts.                  | High   | Medium |
| **REPO-002** | **Mobile CI/CD Workflows**     | Create dedicated GitHub Actions workflows under `apps/mobile/.github/workflows/` for automated testing, Android APK builds (leveraging the existing docker scripts), and iOS app distribution. | High   | Medium |
| **REPO-003** | **Docker-Compose Quickstart**  | Provide a root `docker-compose.yml` file to spin up local development dependencies, local mock databases, and services for developers looking for quick local setup.                           | Medium | Low    |
| **REPO-004** | **Unified Error Handling**     | Standardize error response handling across all Hono API endpoints and frontend API client interactions to strictly follow the shared discriminated union `ApiResponse<T>`.                     | Medium | Low    |

---

## 3. Design & UI/UX Improvements (`apps/*`)

| ID         | Category                              | Description                                                                                                                                                                                        | Impact | Effort |
| :--------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----- | :----- |
| **UI-001** | **Mobile Responsive Polish**          | Audit and refine `apps/web` pages (specifically chat, workspace, and settings submenus) to ensure seamless fluid resizing, touch-friendly tap targets, and consistent spacing on mobile viewports. | High   | Medium |
| **UI-002** | **Dark Mode Refinement**              | Ensure all components across `apps/web` and `apps/mobile` fully respect the light/dark/auto theme settings without jarring contrast shifts, using Tailwind's robust dark mode utilities.           | Medium | Low    |
| **UI-003** | **Interactive Onboarding Wizard**     | Add an interactive project setup wizard for first-time users explaining how to prompt the AI agent and scaffold their first application ("vibe-coding" guidance).                                  | High   | Medium |
| **UI-004** | **Accessibility (a11y) Improvements** | Add proper ARIA labels, focus rings, keyboard navigation support, and screen reader announcements for complex modals and interactive chat streams.                                                 | Medium | Medium |

---

Suggested next steps:

- Review the prioritized suggestions with the core team to schedule upcoming sprints.
- Implement **REPO-001** (Build System Consolidation) to clean up monorepo build inconsistencies.
- Start drafting the implementation plan for **FEAT-001** (Real-time Live UI Preview).
