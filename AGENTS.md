# AGENTS.md

MoveVPE2 workspace bootstrap for any coding agent.

## Precedence

Use this order when reading project instructions:

1. `CODEX.md`
2. focused subsystem docs such as `GEMINI.md`
3. agent overlays such as `CLAUDE.md`, `SYSTEM.md`, `.cursorrules`
4. `MEMORY.md`
5. code and tests

If two files conflict, `CODEX.md` wins for architecture, commands, testing, and deployment rules.

## Project summary

MoveVPE2 is a prompt-construction web app for image-generation workflows.
It runs on Node.js and Express with a Vanilla JS frontend.

## Real project map

- `/server`: backend logic and routing helpers
- `/public`: frontend assets and shared config
- `/scripts`: project test runners and utility scripts
- `/docs`: focused project docs
- `.agents`, `.agent`, `.claude`, `.continue`: agent-private state directories

There is no `src/` app tree and no required `/brain` directory in this repo.

## Standard rules

- Start local development with `npm run dev`.
- Default local port is `3000`.
- Check `server/version_routing.js` before changing routing or entrypoints.
- Check `server/prompt_engine.js` and `public/js/client_logic_full.js` before changing prompt logic.
- Use only commands that actually exist in `package.json` or `docs/testing.md`.
- Do not invent mandatory docs such as `task.md` or `walkthrough.md`.
- Do not modify agent-private directories unless the user explicitly asks.

## Minimum verification

- Prompt logic or model-capability changes:
  `npm run test:nbp-json`
- Mobile, routing, or UI shell changes:
  `npm run test:e2e:smoke:fresh`
- Broad behavior changes:
  `npm run test:e2e:fresh`

## Communication

- Communicate with the user in Russian unless asked otherwise.
- Keep code, identifiers, and commit messages in English.
- Prefer plain Markdown and avoid emoji-heavy formatting in docs.
