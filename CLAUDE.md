<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Turborepo

- When running tasks (for example build, lint, test, e2e, etc.), prefer running the task through `turbo` (i.e. `turbo build`, `turbo typecheck`, `turbo lint`) instead of using the underlying tooling directly
- Use `turbo run` with `--filter` to target specific packages

<!-- nx configuration end-->

## Mobile Repo Boundary

- Treat `apps/mobile` as an independent repo/workflow surface when working on the mobile app.
- For mobile-only tasks, resolve relative paths from `apps/mobile`, not from the monorepo root.
- Mobile workflow files live at `apps/mobile/.github/workflows/` in this repository and should be interpreted as `.github/workflows/` for the mobile repo.
- Do not assume root `.github/workflows/`, root env files, or root-only commands are the correct surface for mobile changes.
