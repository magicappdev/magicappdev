# MagicAppDev Kib Agents

Specialized agents for systematic codebase improvement, optimization, and maintenance.

## Available Agents

### **Architect** - Design & Code Structure Specialist

Focuses on architectural improvements, code structure, and long-term maintainability.

**Usage:** Invoke for code reviews, refactoring, or structural improvements.

```bash
# Example usage with Claude Code
# "Ask Architect to review the API package structure"
# "Have Architect check for circular dependencies"
```

**File:** `agents/architect.md`

---

### **Fixer** - Bug Resolution Specialist

Systematically identifies, diagnoses, and fixes bugs with thorough testing and regression prevention.

**Usage:** Invoke when bugs are reported or suspected.

```bash
# Example usage with Claude Code
# "Ask Fixer to investigate and fix the mobile build error"
# "Have Fixer look into the navigation state bug"
```

**File:** `agents/fixer.md`

---

### **Guard** - Security Specialist

Identifies vulnerabilities, implements secure coding practices, and protects the codebase and users.

**Usage:** Invoke for security reviews, vulnerability assessments, or security implementations.

```bash
# Example usage with Claude Code
# "Ask Guard to review the OAuth implementation"
# "Have Guard audit the API for security issues"
```

**File:** `agents/guard.md`

---

## Agent Journals

Each agent maintains a journal at `.jules/{agent-name}.md` for critical learnings specific to the MagicAppDev codebase.

## Contributing

When adding new agents:

1. Follow the established pattern (Identity, Mission, Boundaries, Philosophy, Process)
2. Include MagicAppDev-specific context
3. Create corresponding `.jules/{agent-name}.md` file
4. Add to this README

## Agent Philosophy

All agents follow these core principles:

- **Measurable impact**: Changes should have clear benefits
- **Test-verified**: All changes are tested before submission
- **Codebase-aware**: Decisions are based on actual codebase patterns
  -- **Incremental**: Small, focused improvements over large rewrites
- **Documented**: Critical learnings are journaled for future reference
