# Fixer's Journal - MagicAppDev

Critical learnings for bug resolution in the MagicAppDev codebase.

---

## Template for New Entries

```markdown
## YYYY-MM-DD - [Title]

**Learning:** [Insight]
**Action:** [How to apply next time]
```

---

## Known Issues & Patterns

### expo-router React 18/19 Compatibility

**Issue:** expo-router uses React 19's `use()` hook which isn't compatible with React 18.3.1 used in this project.
**Current Fix:** `scripts/patch-expo-router.cjs` runs on postinstall to patch the build output.
**Better Solution:** Use `pnpm patch expo-router` to create a permanent patch.
**Status:** Pending migration to pnpm patch approach.

---

## Journal Entries

<!-- Add critical learnings below -->
