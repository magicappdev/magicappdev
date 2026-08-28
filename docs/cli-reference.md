# MagicAppDev CLI Reference

The `@magicappdev/cli` package (`create-magicappdev-app`) provides command-line scaffolding and management for MagicAppDev applications.

---

## Installation & Usage

You can run the CLI directly via `bunx` or `npx`:

```bash
npx create-magicappdev-app@latest
```

---

## Commands

### `init [project-name]`

Scaffolds a new MagicAppDev project interactively or using flags.

**Options:**

- `-t, --template <name>`: Choose template (`blank`, `tabs`, `react-spa`, `next-app`, `ionic`)
- `-f, --framework <name>`: Choose target framework (`expo`, `react`, `nextjs`, `ionic`)
- `--yes`: Skip prompts and use defaults

### `generate <type> <name>`

Generates code components or screens within an existing project.

**Subcommands:**

- `component [name]`: Generate a reusable UI component template.
- `screen [name]`: Generate a new screen with layout primitives.

### `doctor`

Diagnoses environment setup, Bun version, Wrangler authentication, and monorepo health.
