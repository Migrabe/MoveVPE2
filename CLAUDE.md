# CLAUDE.md

MoveVPE2 Claude overlay.

This file is intentionally short.
Project truth lives in:

- `CODEX.md`
- `AGENTS.md`
- `GEMINI.md` for Gemini-specific facts
- the code itself

If this file conflicts with `CODEX.md`, `CODEX.md` wins.

## Role

Act as a production-minded coding assistant for MoveVPE2.
Optimize for correctness, small diffs, and fast verification.

## Project reality

- Backend: Node.js + Express
- Frontend: Vanilla HTML/CSS/JS
- Core prompt logic: `server/prompt_engine.js` plus `public/js/client_logic_full.js`
- Version routing: `server/version_routing.js`
- Server entrypoint: `server.js`
- There is no React app, no `src/` tree, and no hidden review shell scripts

## Working rules

- Communicate with the user in Russian unless they ask otherwise.
- Keep code, identifiers, and commit messages in English.
- Read `AGENTS.md` first, then `CODEX.md`, then the files you will touch.
- Do not invent project structure that does not exist.
- Do not reference `task.md`, `walkthrough.md`, or other phantom docs unless they are created on purpose.
- Do not claim a model integration is live unless the code path exists in this repo.

## Commands that are real in this repo

- Start local server: `npm run dev`
- NBP JSON checks: `npm run test:nbp-json`
- Smoke on current port: `npm run test:e2e:smoke`
- Windows-safe smoke: `npm run test:e2e:smoke:fresh`
- Full Playwright on dedicated port: `npm run test:e2e:fresh`

## Required verification

Run the smallest correct check for the change:

- Prompt logic, model capabilities, JSON payloads:
  `npm run test:nbp-json`
- Mobile shell, routing, UI regressions:
  `npm run test:e2e:smoke:fresh`
- Broader end-to-end verification:
  `npm run test:e2e:fresh`

If you change any of these files, run at least `test:nbp-json` and the smoke suite:

- `server.js`
- `server/prompt_engine.js`
- `server/request_state.js`
- `server/version_routing.js`
- `public/js/client_logic_full.js`
- `public/config/engine-capabilities.json`
- `public/mobile/index.html`
- `public/mobile/mobile.css`
- `public/mobile/js/mobile-shell.js`

## Documentation policy

- Update `CODEX.md` when project architecture, commands, deployment, or source-of-truth rules change.
- Update a focused doc such as `GEMINI.md` only when that subsystem changes.
- Avoid duplicate architecture writeups across multiple files.
- Do not create alternate agent-specific truths that drift from `CODEX.md`.

## Production-sensitive actions

- Treat `render.yaml`, `server.js`, routing, and live deployment linkage as production-sensitive.
- Do not change Render linkage, repo source, or deployment settings unless the user asks.
- When changing live behavior, verify both local behavior and the deployed site when possible.
