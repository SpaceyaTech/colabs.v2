# AI agent setup

Colabs ships AI agent configuration for the four IDEs most commonly used by contributors. All agent rules have a **single source of truth** — `.agents/AGENTS.md` — that is automatically propagated to each IDE's adapter file via a sync script. You never edit the adapter files directly.

---

## How it works

```
.agents/AGENTS.md          ← the only file you ever edit
       │
       │  npm run sync-agents
       │
       ├── CLAUDE.md                          (Claude Code)
       ├── .github/copilot-instructions.md    (GitHub Copilot)
       ├── .windsurfrules                     (Windsurf)
       ├── .cursor/rules/colabs.mdc           (Cursor — all files)
       ├── .cursor/rules/hooks.mdc            (Cursor — src/hooks)
       ├── .cursor/rules/components.mdc       (Cursor — src/components, src/pages)
       └── .cursor/rules/database.mdc         (Cursor — supabase/)
```

Each adapter contains only its IDE-required format header (YAML frontmatter for Cursor, plain markdown for others) followed by the relevant sections extracted from `.agents/AGENTS.md`. No rule is ever written in more than one place.

A CI check (`agents-sync-check.yml`) runs on every PR that touches `.agents/AGENTS.md` or any adapter file. If the adapters are out of sync, the build fails with clear instructions to run `npm run sync-agents`.

---

## Setup by IDE

### Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) reads `CLAUDE.md` from the repo root automatically.

```bash
npm install -g @anthropic-ai/claude-code
cd colabs.v2
claude
```

No configuration needed. `CLAUDE.md` is picked up automatically and contains the full content of `.agents/AGENTS.md`.

---

### Cursor

[Cursor](https://cursor.sh/) reads `.mdc` files from `.cursor/rules/`. The rules are split across four scoped files so each one only activates for the relevant file types.

| File             | Activates when editing                                          |
| ---------------- | --------------------------------------------------------------- |
| `colabs.mdc`     | Every file (project identity, mental models, security, commits) |
| `hooks.mdc`      | `src/hooks/**`                                                  |
| `components.mdc` | `src/components/**`, `src/pages/**`                             |
| `database.mdc`   | `supabase/migrations/**`, `supabase/functions/**`               |

Open the project folder in Cursor — the rules are picked up automatically, no configuration required.

---

### GitHub Copilot

[GitHub Copilot](https://github.com/features/copilot) reads `.github/copilot-instructions.md` automatically. Affects inline completions, `@workspace` chat, and PR review suggestions.

Install the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) for VS Code or the [plugin](https://plugins.jetbrains.com/plugin/17718-github-copilot) for JetBrains. Requires a Copilot subscription.

```
@workspace How do I add a new React Query hook for the proposals table?
@workspace What RLS pattern should I use for a user-owned table?
```

---

### Windsurf

[Windsurf](https://codeium.com/windsurf) reads `.windsurfrules` from the repo root automatically as global context for the Cascade agent. Open the project folder — no configuration required.

---

## Updating rules

**Edit only `.agents/AGENTS.md`.**

```bash
# 1. Edit the source
$EDITOR .agents/AGENTS.md

# 2. Regenerate adapter files
npm run sync-agents

# 3. Commit everything together
git add .agents/AGENTS.md CLAUDE.md .cursor/ .github/copilot-instructions.md .windsurfrules
git commit -m "docs(agents): <describe what changed>"
```

If you forget to run `sync-agents`, the CI `agents-sync-check` job will catch it and show which files differ.

---

## Adding support for a new IDE

1. Add an entry to the `ADAPTERS` array in `scripts/sync-agents.js`
2. Run `npm run sync-agents`
3. Commit the updated script, the new adapter file, and this file
4. Open a PR — future agent changes will automatically include the new IDE

---

## File map

| File                                      | Purpose                            | Edit directly?                   |
| ----------------------------------------- | ---------------------------------- | -------------------------------- |
| `.agents/AGENTS.md`                       | Single source of truth — all rules | ✅ Yes                           |
| `scripts/sync-agents.js`                  | Propagates AGENTS.md to adapters   | ✅ Yes (to add/remove adapters)  |
| `CLAUDE.md`                               | Claude Code adapter                | ❌ Generated                     |
| `.github/copilot-instructions.md`         | Copilot adapter                    | ❌ Generated                     |
| `.windsurfrules`                          | Windsurf adapter                   | ❌ Generated                     |
| `.cursor/rules/colabs.mdc`                | Cursor global adapter              | ❌ Generated                     |
| `.cursor/rules/hooks.mdc`                 | Cursor hooks adapter               | ❌ Generated                     |
| `.cursor/rules/components.mdc`            | Cursor components adapter          | ❌ Generated                     |
| `.cursor/rules/database.mdc`              | Cursor database adapter            | ❌ Generated                     |
| `.github/workflows/agents-sync-check.yml` | CI enforcement                     | ✅ Yes (to change trigger paths) |
