#!/usr/bin/env node
// scripts/sync-agents.js
//
// Single source of truth sync for AI agent adapter files.
//
// Usage:
//   npm run sync-agents
//
// Reads docs/AGENTS.md and writes each adapter file with:
//   - The adapter's format-specific header (frontmatter, comments, etc.)
//   - The relevant sections extracted from AGENTS.md
//
// When to run:
//   - After editing docs/AGENTS.md
//   - The CI pr.yml workflow runs this and fails the build if adapters are out of sync
//
// Adding a new adapter:
//   - Add an entry to the ADAPTERS array below
//   - Run: npm run sync-agents
//   - Commit docs/AGENTS.md and all generated adapter files together

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { createHash } from 'crypto';

// ── Source file ─────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE_PATH = resolve(ROOT, '.agents/AGENTS.md');

if (!existsSync(SOURCE_PATH)) {
  console.error('❌  .agents/AGENTS.md not found. Run from the repo root.');
  process.exit(1);
}

const source = readFileSync(SOURCE_PATH, 'utf8');

// ── Section parser ───────────────────────────────────────────────────────────

/**
 * Extract one or more h2 sections from a markdown string.
 * If titles is undefined, return the full document minus the Table of Contents.
 */
function getSections(md, titles) {
  if (!titles) return removeToc(md);
  return titles
    .map(title => extractSection(md, title))
    .filter(Boolean)
    .join('\n\n---\n\n');
}

function extractSection(md, title) {
  const h2 = `## ${title}`;
  let start = md.indexOf(`\n${h2}\n`);
  if (start === -1 && md.startsWith(h2)) {
    start = 0;
  } else if (start !== -1) {
    start += 1; // skip leading newline
  }

  if (start === -1) {
    console.error(`\n❌  Section not found in AGENTS.md: "${title}"`);
    console.error('    Fix: check for typos in the section title in the ADAPTERS array.\n');
    process.exit(1);
  }

  const nextH2 = md.indexOf('\n## ', start + 1);
  const raw = nextH2 === -1 ? md.slice(start) : md.slice(start, nextH2);
  return raw.trim();
}

function removeToc(md) {
  const tocStart = md.indexOf('\n## Table of Contents');
  const afterToc = md.indexOf('\n## ', tocStart + 1);
  if (tocStart === -1 || afterToc === -1) return md;
  return md.slice(0, tocStart).trimEnd() + '\n\n' + md.slice(afterToc).trimStart();
}

// ── Adapter definitions ──────────────────────────────────────────────────────
//
// Each adapter has:
//   path     — output path relative to repo root
//   header   — content written before the extracted AGENTS.md sections
//   sections — h2 titles to include (omit for all sections)
//   footer   — content written after (optional)

const ADAPTERS = [
  // ── Claude Code ────────────────────────────────────────────────────────────
  {
    path: 'CLAUDE.md',
    header: `# Colabs — Claude Code

> **Auto-generated.** Source of truth: \`.agents/AGENTS.md\`
> To update, edit \`.agents/AGENTS.md\` then run \`npm run sync-agents\`.

`,
    sections: undefined, // full document
  },

  // ── GitHub Copilot ─────────────────────────────────────────────────────────
  {
    path: '.github/copilot-instructions.md',
    header: `# Colabs — GitHub Copilot workspace instructions

> **Auto-generated.** Source of truth: \`.agents/AGENTS.md\`
> To update, edit \`.agents/AGENTS.md\` then run \`npm run sync-agents\`.

`,
    sections: [
      'Project identity',
      'Mental models',
      'Code rules',
      'Data fetching patterns',
      'Edge function patterns',
      'Security rules',
      'What not to do',
      'Branching',
      'Commit format',
    ],
  },

  // ── Windsurf ───────────────────────────────────────────────────────────────
  {
    path: '.windsurfrules',
    header: `# Colabs — Windsurf
# Auto-generated — source: .agents/AGENTS.md — update: npm run sync-agents

`,
    sections: [
      'Project identity',
      'Mental models',
      'Code rules',
      'Data fetching patterns',
      'Security rules',
      'What not to do',
      'Branching',
      'Commit format',
    ],
  },

  // ── Cursor — global ────────────────────────────────────────────────────────
  {
    path: '.cursor/rules/colabs.mdc',
    header: `---
description: Colabs project rules — applied to all files
globs: ["**/*"]
alwaysApply: true
---

<!-- Auto-generated. Source: .agents/AGENTS.md | Update: npm run sync-agents -->

`,
    sections: [
      'Project identity',
      'Repository layout',
      'Mental models',
      'Security rules',
      'What not to do',
      'Branching',
      'Commit format',
    ],
  },

  // ── Cursor — hooks ─────────────────────────────────────────────────────────
  {
    path: '.cursor/rules/hooks.mdc',
    header: `---
description: Data fetching and hook rules — src/hooks
globs: ["src/hooks/**/*.ts", "src/hooks/**/*.tsx"]
alwaysApply: false
---

<!-- Auto-generated. Source: .agents/AGENTS.md | Update: npm run sync-agents -->

`,
    sections: ['Data fetching patterns', 'Security rules'],
  },

  // ── Cursor — components ────────────────────────────────────────────────────
  {
    path: '.cursor/rules/components.mdc',
    header: `---
description: Component and page rules — src/components, src/pages
globs: ["src/components/**/*.tsx", "src/pages/**/*.tsx"]
alwaysApply: false
---

<!-- Auto-generated. Source: .agents/AGENTS.md | Update: npm run sync-agents -->

`,
    sections: ['Code rules', 'Security rules'],
  },

  // ── Cursor — database + edge functions ─────────────────────────────────────
  {
    path: '.cursor/rules/database.mdc',
    header: `---
description: Migration and edge function rules — supabase/
globs: ["supabase/migrations/**/*.sql", "supabase/functions/**/*.ts"]
alwaysApply: false
---

<!-- Auto-generated. Source: .agents/AGENTS.md | Update: npm run sync-agents -->

`,
    sections: ['Database and migration rules', 'Edge function patterns', 'Security rules'],
  },

  // ── Always-on Context Hub ──────────────────────────────────────────────────
  {
    path: '.agents/rules/context.md',
    header: `---
trigger: always_on
---

# Colabs — Global Agent Context

> **Auto-generated.** Source of truth: \`.agents/AGENTS.md\`
> This is a high-level summary. For deep-dives, use the links in the **Specialist Agents** section.

`,
    sections: [
      'Project identity',
      'Repository layout',
      'Specialist Agents',
      'Mental models',
      'Security rules',
      'What not to do',
      'Commands',
      'Branching',
      'Commit format',
    ],
  },
];

// ── Writer ───────────────────────────────────────────────────────────────────

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 8);
}

let changed = 0;
let unchanged = 0;

for (const adapter of ADAPTERS) {
  const outputPath = resolve(ROOT, adapter.path);
  const body = getSections(source, adapter.sections);
  const content = (adapter.header ?? '') + body + (adapter.footer ?? '') + '\n';

  // Only write if content has changed — avoids unnecessary git diffs.
  // Read with try/catch instead of existsSync + readFileSync to avoid a
  // TOCTOU (time-of-check/time-of-use) race between the existence check and the read.
  let existing = null;
  try {
    existing = readFileSync(outputPath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // File does not exist yet — will be created below
  }

  if (existing === content) {
    console.log(`  ─  ${adapter.path} (unchanged)`);
    unchanged++;
    continue;
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, 'utf8');
  console.log(`  ✓  ${adapter.path} [${hashContent(content)}]`);
  changed++;
}

console.log(`\n${changed} file(s) updated, ${unchanged} unchanged.`);

if (changed > 0) {
  console.log('\nCommit all generated files alongside .agents/AGENTS.md:');
  console.log(
    '  git add .agents/AGENTS.md .agents/rules/context.md CLAUDE.md .cursor/ .github/copilot-instructions.md .windsurfrules'
  );
  console.log("  git commit -m 'docs(agents): update AI agent instructions'");
}

// ── Note on .agents/ files ────────────────────────────────────────────────────
// .agents/frontend.md, .agents/backend.md, .agents/optimization.md are
// hand-authored specialist files. They are NOT generated from .agents/AGENTS.md.
// They contain deep domain-specific knowledge that would make AGENTS.md too long.
// They are tracked in the agents-sync-check.yml CI path filter so PRs touching
// them still go through review — but they do not need to be regenerated.
