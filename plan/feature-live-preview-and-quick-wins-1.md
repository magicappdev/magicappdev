---
goal: Implementation Plan for Quick Wins, Repository Improvements, and FEAT-001 (Real-time Live UI Preview)
version: 1.0
date_created: 2026-03-30
owner: Core Engineering Team
status: "Planned"
tags: ["feature", "architecture", "refactor", "ui"]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan outlines the actionable phases for executing quick wins, repository/build improvements, and developing FEAT-001 (Real-time Live UI Preview) within the MagicAppDev platform.

## 1. Requirements & Constraints

- **REQ-001**: FEAT-001 must provide a sandboxed live preview iframe inside `apps/web` rendering generated template components in real-time.
- **REPO-001**: Repository improvements must align Nx project graphs and Turborepo filters without breaking existing workspace tasks.
- **CON-001**: All code must conform to Prettier settings (`printWidth: 80`, double quotes, semicolons required) and TypeScript strict mode.
- **GUD-001**: Use explicit `.js` extensions for local relative imports in ESM packages.

## 2. Implementation Steps

### Implementation Phase 1: Quick Wins & Repository Cleanup (REPO-001, REPO-004)

- GOAL-001: Resolve workspace build warnings, unify package scripts, and standardize API error handling.

| Task     | Description                                                                   | Completed | Date |
| -------- | ----------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Audit package.json scripts and ensure Turborepo tasks filter correctly.       |           |      |
| TASK-002 | Standardize error handling in `packages/api` to return discriminated unions.  |           |      |
| TASK-003 | Fix missing module imports and implicit any types across mobile/web packages. |           |      |

### Implementation Phase 2: FEAT-001 (Real-time Live UI Preview Panel)

- GOAL-002: Implement the live preview component and integrate it into the web workspace view.

| Task     | Description                                                                                    | Completed | Date |
| -------- | ---------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-004 | Create `apps/web/src/components/LivePreviewPanel.tsx` with sandbox iframe support.             |           |      |
| TASK-005 | Connect the preview panel state to active project template code generation in `workspace.tsx`. |           |      |
| TASK-006 | Add fallback view states for compilation and rendering errors.                                 |           |      |

## 3. Alternatives

- **ALT-001**: Using external SaaS preview services (rejected due to offline and Cloudflare Worker free-tier compatibility constraints).

## 4. Dependencies

- **DEP-001**: `@magicappdev/templates` package for code generation schemas.
- **DEP-002**: Tailwind CSS and React state management context in `apps/web`.

## 5. Files

- **FILE-001**: `apps/web/src/pages/projects/workspace.tsx`
- **FILE-002**: `apps/web/src/pages/projects/preview.tsx`
- **FILE-003**: `packages/api/src/routes/projects.ts`

## 6. Testing

- **TEST-001**: Unit tests for preview error handling and state synchronization.
- **TEST-002**: Playwright E2E test verifying project code generation and live preview render.

## 7. Risks & Assumptions

- **RISK-001**: Arbitrary code execution security risks in live preview iframes (mitigated via sandboxed iframe attributes).
- **ASSUMPTION-001**: Generated templates are compatible with client-side preview bundling.

## 8. Related Specifications / Further Reading

- [Plan.md](./Plan.md)
- [suggestions.md](./suggestions.md)
