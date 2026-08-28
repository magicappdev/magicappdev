# Implementation Plan: FEAT-006 & FEAT-003

## Table of Contents

- [Feature 1: FEAT-006 — Visual Template Customizer (Admin UI)](#feature-1-feat-006--visual-template-customizer-admin-ui)
- [Feature 2: FEAT-003 — Live WebContainers / StackBlitz Integration](#feature-2-feat-003--live-webcontainers--stackblitz-integration)
- [Dependency Matrix](#dependency-matrix)
- [Estimated Timeline](#estimated-timeline)

---

## Feature 1: FEAT-006 — Visual Template Customizer (Admin UI)

### Overview

Add a "Templates" tab to the admin dashboard that lets admins browse all templates, fill in variable forms, and see a live Handlebars-compiled preview of every file. Includes a "Generate & Download" button that exports the result as a `.zip`.

### Architecture Decision: Client-Side Rendering

The template registry is a pure TypeScript module with no server dependencies. All Handlebars compilation, condition evaluation, and file rendering can happen entirely in the browser. **No new API endpoints are needed.**

The web app will import `@magicappdev/templates` directly (it's a workspace package), giving access to:

- `registry.getAll()` / `registry.get(id)` for template data
- `compileTemplate()` for Handlebars rendering
- `evaluateCondition()` for file conditionals
- `compileFilePath()` for path variable interpolation

### Step-by-Step Implementation

#### Step 1: Add workspace dependency

**File**: `apps/web/package.json`

Add `@magicappdev/templates` as a workspace dependency:

```json
{
  "dependencies": {
    "@magicappdev/templates": "workspace:*"
  }
}
```

Run `bun install` from repo root.

**Complexity**: Trivial  
**Dependencies**: None

---

#### Step 2: Create `TemplatePreview` utility module

**File**: `apps/web/src/lib/template-preview.ts` (new)

This module provides pure functions for client-side template rendering, extracted from the patterns in `packages/templates/src/generators/index.ts` and `packages/templates/src/utils/index.ts`.

```typescript
import {
  compileTemplate,
  compileFilePath,
  evaluateCondition,
} from "@magicappdev/templates";
import type { Template, TemplateVariable } from "@magicappdev/templates";

/** Rendered file output */
export interface RenderedFile {
  path: string;
  content: string;
  included: boolean; // false if condition excluded it
}

/**
 * Render all files from a template with given variable values.
 * Returns an array of rendered files (conditions evaluated, Handlebars compiled).
 */
export function renderTemplateFiles(
  template: Template,
  variables: Record<string, string | boolean | number>,
): RenderedFile[] {
  return template.files.map(file => {
    // Check condition
    const included = file.condition
      ? evaluateCondition(file.condition, variables)
      : true;

    if (!included) {
      return { path: file.path, content: "", included: false };
    }

    // Compile file path (replace {{name}} etc.)
    const path = compileFilePath(file.path, variables);

    // Compile content
    const content = compileTemplate(file.content, variables);

    return { path, content, included: true };
  });
}

/**
 * Build initial variable values from template definitions.
 * Uses each variable's `default` value.
 */
export function buildDefaultVariables(
  template: Template,
): Record<string, string | boolean | number> {
  const vars: Record<string, string | boolean | number> = {};
  for (const v of template.variables) {
    if (v.default !== undefined) {
      vars[v.name] = v.default;
    }
  }
  return vars;
}
```

**Complexity**: Low  
**Dependencies**: Step 1 (`@magicappdev/templates` must be importable)

---

#### Step 3: Create `TemplateVariableForm` component

**File**: `apps/web/src/components/admin/TemplateVariableForm.tsx` (new)

Auto-generated form from a template's `variables` array. Maps each `TemplateVariableType` to the appropriate input control:

| Type      | Control                                         |
| --------- | ----------------------------------------------- |
| `string`  | `<input type="text">`                           |
| `boolean` | Toggle switch (styled checkbox)                 |
| `number`  | `<input type="number">`                         |
| `select`  | `<select>` with options from `variable.options` |

Props:

```typescript
interface TemplateVariableFormProps {
  variables: TemplateVariable[];
  values: Record<string, string | boolean | number>;
  onChange: (name: string, value: string | boolean | number) => void;
}
```

Each input is controlled, updating the parent's state on every change for live preview.

**Complexity**: Medium  
**Dependencies**: Step 1  
**UI Patterns**: Follow existing form patterns from admin config section (lines 496-531 of `admin/page.tsx`)

---

#### Step 4: Create `TemplateFilePreview` component

**File**: `apps/web/src/components/admin/TemplateFilePreview.tsx` (new)

Displays the rendered files from `renderTemplateFiles()`. Features:

1. **File tab bar**: Horizontal tabs showing each included file's path (basename only)
2. **Content viewer**: Syntax-highlighted code display using the existing `highlight.js` dynamic import pattern from `workspace.tsx` (lines 118-137)
3. **File count badge**: Shows "N files" in the tab bar

Props:

```typescript
interface TemplateFilePreviewProps {
  files: RenderedFile[];
}
```

**Complexity**: Medium  
**Dependencies**: Step 2  
**UI Patterns**: Reuse highlight.js pattern from `workspace.tsx`, follow `Card` + `Typography` styling from admin page

---

#### Step 5: Create `TemplateList` component

**File**: `apps/web/src/components/admin/TemplateList.tsx` (new)

Grid/list of all templates showing metadata. Each card shows:

- Template name (from `template.name`)
- Description (from `template.description`)
- Category badge (app/component/screen/hook/api)
- Framework tags (from `template.frameworks`)
- File count (from `template.files.length`)
- Variable count (from `template.variables.length`)

Clicking a card calls `onSelect(template)`.

Props:

```typescript
interface TemplateListProps {
  templates: TemplateMetadata[];
  onSelect: (template: Template) => void;
}
```

**Complexity**: Medium  
**Dependencies**: Step 1  
**UI Patterns**: Follow `StatsCard` pattern from admin page, use `Card` component

---

#### Step 6: Create `TemplateCustomizer` orchestrator component

**File**: `apps/web/src/components/admin/TemplateCustomizer.tsx` (new)

The main split-view component that ties everything together:

```
┌─────────────────────────────────────────────────────┐
│ [← Back to List]  Template: React SPA               │
├────────────────────┬────────────────────────────────┤
│                    │                                │
│   Variable Form    │     File Preview (tabs)        │
│   (TemplateVar-    │     ┌──────────────────────┐   │
│    iableForm)      │     │ package.json          │   │
│                    │     │──────────────────────│   │
│  name: [________]  │     │ { "name": "my-app" } │   │
│  appName: [______] │     │                      │   │
│  description:      │     └──────────────────────┘   │
│    [___________]   │                                │
│                    │                                │
│  [Generate &       │                                │
│   Download .zip]   │                                │
│                    │                                │
├────────────────────┴────────────────────────────────┤
│ Dependencies: react ^18.3.1, react-dom ^18.3.1      │
│ DevDependencies: typescript ^5.6.3, vite ^6.0.3     │
└─────────────────────────────────────────────────────┘
```

State management:

- `variables: Record<string, string | boolean | number>` — current variable values
- `renderedFiles: RenderedFile[]` — recomputed on every variable change via `useMemo`

"Generate & Download" button:

1. Import `JSZip` (already in `apps/web` dependencies)
2. Create a new `JSZip` instance
3. For each included rendered file, call `zip.file(path, content)`
4. Also include dependency metadata as a comment or README
5. Generate blob via `zip.generateAsync({ type: "blob" })`
6. Trigger download via `<a>` element (same pattern as `workspace.tsx` export, lines 203-221)

Props:

```typescript
interface TemplateCustomizerProps {
  template: Template;
  onBack: () => void;
}
```

**Complexity**: High  
**Dependencies**: Steps 2, 3, 4  
**External**: JSZip (already installed)

---

#### Step 7: Add "Templates" tab to admin page

**File**: `apps/web/src/pages/admin/page.tsx` (modify)

Changes:

1. **Extend view state** (line 44):

   ```typescript
   const [view, setView] = useState<"users" | "logs" | "config" | "templates">(
     "users",
   );
   ```

2. **Add Templates button** to the header button group (after "Global Config" button, ~line 260):

   ```tsx
   <Button
     variant={view === "templates" ? "tonal" : "outlined"}
     size="sm"
     onClick={() => setView("templates")}
   >
     <LayoutTemplate size={16} className="mr-2" />
     Templates
   </Button>
   ```

3. **Add templates view section** (after the `config` block, ~line 579):

   ```tsx
   {
     view === "templates" && <TemplateCustomizerSection />;
   }
   ```

4. **Add `TemplateCustomizerSection` component** (either inline or in a new file). This component:
   - Imports `registry` from `@magicappdev/templates`
   - Calls `registry.getAll()` to get all templates
   - Manages `selectedTemplate: Template | null` state
   - Renders `TemplateList` when no template is selected
   - Renders `TemplateCustomizer` when a template is selected

5. **Import Lucide icon**: Add `LayoutTemplate` to the lucide-react imports.

**Complexity**: Medium  
**Dependencies**: Steps 5, 6

---

#### Step 8: Verify and polish

- Test with all 10 templates (blank, tabs, ionic, expo, react-spa, next-app, ecommerce, cf-workers-api, button-component, screen)
- Verify condition evaluation works (e.g., blank-app's `framework === 'expo'` condition)
- Verify Handlebars helpers work in preview (camelCase, pascalCase, kebabCase, raw blocks)
- Ensure download produces valid zip files
- Check responsive layout (split view on desktop, stacked on mobile)

**Complexity**: Medium  
**Dependencies**: All previous steps

---

### FEAT-006 File Summary

| File                                                     | Action                                | Complexity |
| -------------------------------------------------------- | ------------------------------------- | ---------- |
| `apps/web/package.json`                                  | Modify (add `@magicappdev/templates`) | Trivial    |
| `apps/web/src/lib/template-preview.ts`                   | Create                                | Low        |
| `apps/web/src/components/admin/TemplateVariableForm.tsx` | Create                                | Medium     |
| `apps/web/src/components/admin/TemplateFilePreview.tsx`  | Create                                | Medium     |
| `apps/web/src/components/admin/TemplateList.tsx`         | Create                                | Medium     |
| `apps/web/src/components/admin/TemplateCustomizer.tsx`   | Create                                | High       |
| `apps/web/src/pages/admin/page.tsx`                      | Modify (add Templates tab)            | Medium     |

---

## Feature 2: FEAT-003 — Live WebContainers / StackBlitz Integration

### Overview

Add an optional "Live Preview" mode to the project workspace that boots a real Vite + React dev server inside a WebContainer (browser-based Node.js runtime via StackBlitz). This gives instant, production-like preview without deploying.

### Architecture Decision: WebContainer API

StackBlitz provides `@stackblitz/sdk` which can:

1. Boot a WebContainer with a VM
2. Mount files into the VM filesystem
3. Run shell commands (`npm install`, `npm run dev`)
4. Stream terminal output
5. Embed the running app in an iframe via a tunnel URL

The workspace already has a `LivePreview` component using an iframe. The WebContainer preview will be an alternative mode, not a replacement.

### Step-by-Step Implementation

#### Step 1: Install `@stackblitz/sdk`

**File**: `apps/web/package.json`

```bash
cd apps/web && bun add @stackblitz/sdk
```

**Complexity**: Trivial  
**Dependencies**: None

---

#### Step 2: Create `webcontainer.ts` utility module

**File**: `apps/web/src/lib/webcontainer.ts` (new)

Encapsulates all WebContainer lifecycle management:

```typescript
import { WebContainer } from "@stackblitz/sdk";

let webcontainerInstance: WebContainer | null = null;

/**
 * Get or boot the WebContainer singleton.
 * WebContainers can only be booted once per page load.
 */
export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) return webcontainerInstance;
  webcontainerInstance = await WebContainer.boot();
  return webcontainerInstance;
}

/**
 * Check if WebContainers are supported in this browser.
 * Requirements: Chromium-based browser + cross-origin isolation headers.
 */
export function isWebContainerSupported(): boolean {
  // WebContainers require Chrome, Edge, or Brave (Chromium-based)
  const ua = navigator.userAgent;
  const isChromium = /Chrome|Edg|Brave/.test(ua) && !/Firefox|Safari/.test(ua);

  // Also need cross-origin isolation (COOP/COEP headers)
  const isIsolated =
    typeof globalThis.crossOriginIsolated !== "undefined"
      ? globalThis.crossOriginIsolated
      : true; // Assume true if API not available

  return isChromium && isIsolated;
}

/**
 * Convert ProjectFile[] to a files map for WebContainer.
 */
export interface ProjectFile {
  path: string;
  content: string;
}

export function filesToWebContainerFs(
  files: ProjectFile[],
): Record<string, string> {
  const fs: Record<string, string> = {};
  for (const file of files) {
    fs[file.path] = file.content;
  }
  return fs;
}
```

**Complexity**: Low  
**Dependencies**: Step 1

---

#### Step 3: Create `WebContainerPreview` component

**File**: `apps/web/src/components/workspace/WebContainerPreview.tsx` (new)

Core component that boots and manages the WebContainer lifecycle:

```typescript
interface WebContainerPreviewProps {
  files: Array<{ path: string; content: string }>;
}

type PreviewState =
  | { status: "idle" }
  | { status: "booting" }
  | { status: "installing"; output: string }
  | { status: "running"; url: string }
  | { status: "error"; message: string };
```

Lifecycle:

1. **Boot** (`useEffect` on mount):
   - Call `getWebContainer()`
   - Mount files via `webcontainer.mount(filesToWebContainerFs(files))`
   - Transition to `installing`

2. **Install dependencies**:
   - Spawn shell: `webcontainer.spawn("npm", ["install"])`
   - Stream output to `installing.output`
   - On exit code 0, transition to running setup
   - On non-zero exit, transition to `error`

3. **Start dev server**:
   - Spawn: `webcontainer.spawn("npm", ["run", "dev"])`
   - Listen for `webcontainer.on("server-ready", (port, url) => ...)`
   - Store the tunnel URL, transition to `running`

4. **Render iframe**:
   - When `status === "running"`, render `<iframe src={url} />`
   - Show loading spinner during boot/install
   - Show error message with retry on failure

5. **Cleanup** (`useEffect` cleanup):
   - Call `webcontainer.teardown()` on unmount

**Complexity**: High  
**Dependencies**: Step 2  
**Key Risks**: WebContainer boot can take 5-15 seconds; npm install adds more. Loading states are critical.

---

#### Step 4: Create `BrowserCompatibilityCheck` component

**File**: `apps/web/src/components/workspace/BrowserCompatibilityCheck.tsx` (new)

Simple component that checks `isWebContainerSupported()` and shows an appropriate message:

- **Supported**: Returns `null` (renders nothing)
- **Not supported (wrong browser)**: Shows warning with "Please use Chrome, Edge, or Brave"
- **Not isolated (missing headers)**: Shows warning with "Cross-origin isolation required — check COOP/COEP headers"

Props:

```typescript
interface BrowserCompatibilityCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Complexity**: Low  
**Dependencies**: Step 2

---

#### Step 5: Create `PreviewModeToggle` component

**File**: `apps/web/src/components/workspace/PreviewModeToggle.tsx` (new)

A segmented toggle control in the preview sidebar header:

```
┌──────────────────────────────┐
│ Preview  [Cloud | Live]      │
└──────────────────────────────┘
```

Props:

```typescript
interface PreviewModeToggleProps {
  mode: "cloud" | "live";
  onChange: (mode: "cloud" | "live") => void;
  liveDisabled?: boolean; // true if browser not supported
  liveDisabledReason?: string;
}
```

**Complexity**: Low  
**Dependencies**: Step 4

---

#### Step 6: Integrate into workspace page

**File**: `apps/web/src/pages/projects/workspace.tsx` (modify)

Changes to the Live Preview sidebar section (lines 427-443):

1. **Add state**:

   ```typescript
   const [previewMode, setPreviewMode] = useState<"cloud" | "live">("cloud");
   ```

2. **Replace sidebar header** with `PreviewModeToggle`:

   ```tsx
   <div className="p-3 border-b border-outline/10 flex items-center justify-between">
     <PreviewModeToggle
       mode={previewMode}
       onChange={setPreviewMode}
       liveDisabled={!isWebContainerSupported()}
       liveDisabledReason="WebContainers require Chrome, Edge, or Brave"
     />
     <Button variant="text" size="sm" className="h-6 w-6 p-0">
       <RefreshCw size={14} />
     </Button>
   </div>
   ```

3. **Conditional preview rendering**:

   ```tsx
   {
     previewMode === "cloud" ? (
       <LivePreview projectId={id || ""} files={projectFiles} />
     ) : (
       <BrowserCompatibilityCheck fallback={<CloudPreviewFallback />}>
         <WebContainerPreview
           files={projectFiles.map(f => ({
             path: f.path,
             content: f.content,
           }))}
         />
       </BrowserCompatibilityCheck>
     );
   }
   ```

4. **Add imports** for the new components.

**Complexity**: Medium  
**Dependencies**: Steps 3, 4, 5

---

#### Step 7: Configure cross-origin isolation headers

**File**: `apps/web/wrangler.toml` (modify)

WebContainers require `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers.

Add to wrangler.toml:

```toml
[headers]
  "Cross-Origin-Opener-Policy" = "same-origin"
  "Cross-Origin-Embedder-Policy" = "require-corp"
```

**⚠️ Important**: These headers affect the entire app. The COEP header can break:

- Third-party scripts (analytics, fonts, etc.)
- External images without CORS headers
- Any `fetch()` to origins that don't return CORS headers

**Mitigation**: Use `credentialless` instead of `require-corp` if possible:

```toml
"Cross-Origin-Embedder-Policy" = "credentialless"
```

Or implement per-route headers in the Vite/dev server config rather than全局.

**Complexity**: Medium  
**Dependencies**: None (can be done in parallel)  
**Risk**: High — needs thorough testing of all existing functionality

---

#### Step 8: Handle file change debouncing

**File**: `apps/web/src/components/workspace/WebContainerPreview.tsx` (modify)

When files change in the workspace, the WebContainer preview needs to update. Strategy:

1. **Debounce file changes** (1.5s) to avoid re-mounting on every keystroke
2. **Use `webcontainer.fs.writeFile()`** for individual file updates instead of full remount
3. **Restart dev server** only if `package.json` or `vite.config.*` changed
4. **HMR**: Vite's HMR should handle most file changes automatically once the dev server is running

```typescript
// In WebContainerPreview component
useEffect(() => {
  if (status !== "running" || !webcontainer) return;

  const timeout = setTimeout(async () => {
    for (const file of files) {
      await webcontainer.fs.writeFile(file.path, file.content);
    }
  }, 1500);

  return () => clearTimeout(timeout);
}, [files]);
```

**Complexity**: Medium  
**Dependencies**: Step 3

---

#### Step 9: Verify and polish

- Test WebContainer boot on Chrome, Edge, Brave, and Firefox (should fail gracefully on Firefox)
- Test with all template types (React SPA, Next.js, Expo, etc. — note: WebContainers work best with Vite-based setups)
- Test file change propagation and HMR
- Test cleanup on unmount (no memory leaks)
- Test COEP/COEP headers don't break existing functionality
- Add error boundary for WebContainer failures

**Complexity**: Medium  
**Dependencies**: All previous steps

---

### FEAT-003 File Summary

| File                                                              | Action                         | Complexity |
| ----------------------------------------------------------------- | ------------------------------ | ---------- |
| `apps/web/package.json`                                           | Modify (add `@stackblitz/sdk`) | Trivial    |
| `apps/web/src/lib/webcontainer.ts`                                | Create                         | Low        |
| `apps/web/src/components/workspace/WebContainerPreview.tsx`       | Create                         | High       |
| `apps/web/src/components/workspace/BrowserCompatibilityCheck.tsx` | Create                         | Low        |
| `apps/web/src/components/workspace/PreviewModeToggle.tsx`         | Create                         | Low        |
| `apps/web/src/pages/projects/workspace.tsx`                       | Modify (add mode toggle)       | Medium     |
| `apps/web/wrangler.toml`                                          | Modify (COOP/COEP headers)     | Medium     |

---

## Dependency Matrix

```
FEAT-006                              FEAT-003
─────────                             ─────────
Step 1 (package.json)                 Step 1 (package.json)
  ↓                                     ↓
Step 2 (template-preview.ts)          Step 2 (webcontainer.ts)
  ↓                                     ↓
Step 3 (TemplateVariableForm)         Step 3 (WebContainerPreview)
Step 4 (TemplateFilePreview)  ←──┐    Step 4 (BrowserCompatibilityCheck)
  ↓                               │    Step 5 (PreviewModeToggle)
Step 5 (TemplateList)             │      ↓
  ↓                               │    Step 6 (workspace.tsx integration)
Step 6 (TemplateCustomizer) ←─────┘    Step 7 (wrangler.toml headers)
  ↓                                     ↓
Step 7 (admin/page.tsx)               Step 8 (file change debouncing)
  ↓                                     ↓
Step 8 (verify)                       Step 9 (verify)
```

**The two features are fully independent** — they can be implemented in parallel by different developers or in sequence with no cross-dependencies.

---

## Estimated Timeline

| Step               | Feature                   | Complexity | Estimated Time |
| ------------------ | ------------------------- | ---------- | -------------- |
| FEAT-006 Step 1    | Package dep               | Trivial    | 5 min          |
| FEAT-006 Step 2    | template-preview.ts       | Low        | 30 min         |
| FEAT-006 Step 3    | TemplateVariableForm      | Medium     | 1.5 hr         |
| FEAT-006 Step 4    | TemplateFilePreview       | Medium     | 1.5 hr         |
| FEAT-006 Step 5    | TemplateList              | Medium     | 1 hr           |
| FEAT-006 Step 6    | TemplateCustomizer        | High       | 2.5 hr         |
| FEAT-006 Step 7    | admin/page.tsx            | Medium     | 1 hr           |
| FEAT-006 Step 8    | Verify & polish           | Medium     | 1.5 hr         |
| **FEAT-006 Total** |                           |            | **~9.5 hr**    |
| FEAT-003 Step 1    | Package dep               | Trivial    | 5 min          |
| FEAT-003 Step 2    | webcontainer.ts           | Low        | 30 min         |
| FEAT-003 Step 3    | WebContainerPreview       | High       | 3 hr           |
| FEAT-003 Step 4    | BrowserCompatibilityCheck | Low        | 30 min         |
| FEAT-003 Step 5    | PreviewModeToggle         | Low        | 30 min         |
| FEAT-003 Step 6    | workspace.tsx integration | Medium     | 1.5 hr         |
| FEAT-003 Step 7    | wrangler.toml headers     | Medium     | 1 hr           |
| FEAT-003 Step 8    | File change debouncing    | Medium     | 1 hr           |
| FEAT-003 Step 9    | Verify & polish           | Medium     | 2 hr           |
| **FEAT-003 Total** |                           |            | **~10 hr**     |

**Combined estimate**: ~20 hours of development time (2-3 days for a single developer, or ~1.5 days in parallel).

---

## Risks & Mitigations

### FEAT-006

| Risk                                     | Impact            | Mitigation                                                |
| ---------------------------------------- | ----------------- | --------------------------------------------------------- |
| Handlebars compilation errors in browser | Preview broken    | Wrap `compileTemplate` in try/catch, show error per-file  |
| Large templates cause slow rendering     | UX sluggish       | Debounce variable changes (300ms), memoize rendered files |
| JSZip bundle size increase               | Already installed | No impact — JSZip is already a dependency                 |

### FEAT-003

| Risk                                              | Impact                | Mitigation                                                             |
| ------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| WebContainer boot failures                        | Live preview unusable | Graceful fallback to Cloud Preview with clear messaging                |
| COEP headers break third-party scripts            | Entire app broken     | Test thoroughly; use `credentialless` mode; consider per-route headers |
| WebContainers unsupported on Firefox/Safari       | ~40% of users         | Clear browser compatibility message; default to Cloud Preview          |
| npm install takes too long                        | Poor UX               | Show real-time terminal output; consider caching strategies            |
| Vite HMR doesn't work through WebContainer tunnel | No hot reload         | Accept as limitation; manual reload button sufficient for MVP          |
