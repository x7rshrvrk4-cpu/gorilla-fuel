#!/usr/bin/env node
/*
 * Native PreToolUse guard for gorilla-fuel. Runs on Bash tool calls only.
 * No Python — invoked as `node .claude/hooks/pretooluse-guard.mjs` from
 * .claude/settings.json. Reads the hook JSON on stdin, inspects the Bash
 * command, and:
 *   • exit 2 (+ stderr message)  → BLOCK the tool call
 *   • exit 0 (+ stderr message)  → WARN but allow
 *   • exit 0 (silent)            → allow
 *
 * Regexes are the exact, pre-verified patterns — do not redesign here.
 */

const MSG_PRODUCT_NAME =
  "product_name is read by the scorer — writing it silently moves scores. Write display_name_en instead. If this is genuinely intended, override explicitly.";
const MSG_SCOPED_COMMIT =
  "This repo requires explicit file paths on every commit — the working tree holds unrelated scratch and modified files. Stage specific paths instead of -A/.";

// HOOK 1 (block): DB write-intent AND a product_name write-key
const H1_WRITE_INTENT = /(-X\s*(PATCH|POST))|(--request\s+(PATCH|POST))|(method\s*[:=]\s*["']?(PATCH|POST))|(--write)/i;
const H1_PRODUCT_KEY = /product_name["']?\s*:(?!:)/i;
// HOOK 2a (block): broad git staging
const H2A_BROAD_ADD = /git\s+add\s+(-A|--all|\.(\s|$)|-u\s*$)/i;
// HOOK 2b (warn): git add touching .gitignore / public/sw.js
const H2B_GIT_ADD = /git\s+add\b/i;
const H2B_SCRATCH = /\.gitignore|public\/sw\.js/i;

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    const data = JSON.parse(raw || "{}");
    // Only Bash carries tool_input.command; anything else → cmd "" → no match.
    cmd = (data && data.tool_input && data.tool_input.command) || "";
  } catch {
    // Malformed input: fail open (never block on a parse error).
    process.exit(0);
  }

  // ── BLOCK rules (block wins over warn) ──────────────────────────────────
  if (H1_WRITE_INTENT.test(cmd) && H1_PRODUCT_KEY.test(cmd)) {
    process.stderr.write(`[block-product-name-write] ${MSG_PRODUCT_NAME}\n`);
    process.exit(2);
  }
  if (H2A_BROAD_ADD.test(cmd)) {
    process.stderr.write(`[block-broad-git-add] ${MSG_SCOPED_COMMIT}\n`);
    process.exit(2);
  }

  // ── WARN rule (non-blocking) ────────────────────────────────────────────
  if (H2B_GIT_ADD.test(cmd) && H2B_SCRATCH.test(cmd)) {
    process.stderr.write(`[warn-git-add-scratch] ${MSG_SCOPED_COMMIT}\n`);
    process.exit(0);
  }

  process.exit(0);
});
