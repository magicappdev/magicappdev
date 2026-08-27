# Task State: Monorepo Refactoring & Pipeline Integration

- [x] Phase 1: Clean up redundant instruction files (`CLAUDE.md`, `GEMINI.md`, etc.) and ensure `.agents/skills` structure.
- [x] Phase 2: Add verification marker commands (`verify:mark` and `verify`) to root `package.json`.
- [x] Phase 3: Create root `opencode.json` with strict tool rules and agent permissions.
- [x] Phase 4: Create Pipeline Gate plugin under `.opencode/plugin/pipeline-gate.ts` to block deployments without recent verification.
- [x] Phase 5: Initialize persistent task state and run local verification marker test.
