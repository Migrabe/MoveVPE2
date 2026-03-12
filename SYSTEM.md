# SYSTEM.md

MoveVPE2 local system guidance.

This file is agent-neutral on purpose.
It exists to keep different coding agents aligned instead of splitting them.

## Precedence

- `CODEX.md` is the primary source of truth.
- `GEMINI.md` is Gemini-specific only.
- `AGENTS.md`, `CLAUDE.md`, and `.cursorrules` are thin overlays.
- `MEMORY.md` contains facts and preferences, not workflow authority.

If there is any conflict, follow `CODEX.md`.

## Operating model

- Use the real project structure: `server/`, `public/`, `scripts/`, `docs/`.
- Do not assume React, a `src/` tree, or hidden review scripts.
- Use the tools available in your environment, but do not write tool-specific
  instructions into project truth files.
- Use only commands that exist in `package.json` or `docs/testing.md`.
- Keep explanations transparent and technically concrete.
- Use plain Markdown and avoid emoji-heavy formatting.

## Planning

- For nontrivial work, keep a brief plan in the conversation or tool state.
- Do not require a file such as `implementation_plan.md` unless the user
  explicitly asks for one.

## Safety

- Do not modify `.agent/`, `.agents/`, `.claude/`, or `.continue/` unless asked.
- Treat `server.js`, `render.yaml`, `server/prompt_engine.js`,
  `server/version_routing.js`, and `public/js/client_logic_full.js` as
  high-impact files.
