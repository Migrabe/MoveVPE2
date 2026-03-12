# CODEX.md

MoveVPE2 source of truth.

Last updated: 2026-03-12

## Instruction precedence

This file is the primary source of truth for all agent ecosystems used in this
repo.

Use this order when instructions overlap:

1. `CODEX.md`
2. focused subsystem docs such as `GEMINI.md`
3. agent overlays such as `AGENTS.md`, `CLAUDE.md`, `SYSTEM.md`, `.cursorrules`
4. `MEMORY.md`
5. code and tests

Agent overlays must not redefine architecture, commands, deployment flow, or
model integration state. They may only add agent-specific behavior.

## Project snapshot

- Name: VPE Prompt Builder v4
- Repository: `https://github.com/Migrabe/MoveVPE2`
- Default branch: `main`
- Live site: `https://vpe-master-wide.onrender.com`
- Render service: `vpe-master-wide`
- Runtime: Node.js ESM
- Server: Express
- Frontend: Vanilla HTML, CSS, and JavaScript
- Build step: none

## What this project is

MoveVPE2 is a prompt-construction web app for image-generation workflows.
It builds prompts and JSON payloads, applies model capability rules, supports
desktop and mobile entrypoints, and exposes a small HTTP API.

This repo is not a React app and does not use a `src/` tree.

## Real directory map

```text
/
|- server.js
|- render.yaml
|- package.json
|- AGENTS.md
|- CODEX.md
|- CLAUDE.md
|- GEMINI.md
|- docs/
|  `- testing.md
|- e2e/
|  `- smoke.spec.js
|- examples/
|  `- reference_nbp.json
|- public/
|  |- index.html
|  |- css/
|  |- js/
|  |- config/
|  `- mobile/
|- scripts/
|  |- run-playwright.js
|  `- verify-nbp-json.js
`- server/
   |- prompt_engine.js
   |- request_state.js
   `- version_routing.js
```

## Core runtime flow

1. `server.js` starts Express, security middleware, static serving, and API routes.
2. `server/version_routing.js` decides desktop vs mobile routing and redirect logic.
3. `public/js/client_logic_full.js` holds the main client-side state model,
   prompt builders, conflict pruning, and JSON builders.
4. `server/prompt_engine.js` loads the browser prompt logic into a VM sandbox so
   the server and browser use the same generation rules.
5. `server/request_state.js` normalizes inbound API state and uploaded references.
6. `POST /api/prompt` returns generated prompt text, JSON payload, and warnings.

## Important files

### Server

- `server.js`
  Express entrypoint, CSP, rate limiting, static cache headers, API routes,
  `/health`, `/ready`, and build headers.
- `server/prompt_engine.js`
  Server-side execution bridge for the shared prompt builder logic.
- `server/request_state.js`
  Request normalization for JSON and multipart submissions.
- `server/version_routing.js`
  Mobile detection and desktop/mobile redirect policy.

### Frontend

- `public/index.html`
  Desktop entrypoint.
- `public/mobile/index.html`
  Mobile entrypoint.
- `public/js/client_logic_full.js`
  Main app logic and state machine.
- `public/js/action-buttons.js`
  Shared UI button behavior.
- `public/js/section-visibility.js`
  Section expand-collapse behavior.
- `public/mobile/js/mobile-shell.js`
  Mobile shell behavior and panel controls.
- `public/mobile/mobile.css`
  Mobile styling.

### Config

- `public/config/engine-capabilities.json`
  Model capability registry.
- `public/config/taxonomy-rules.json`
  Taxonomy rules consumed by prompt logic.
- `public/config/ui-buttons.json`
  UI button definitions exposed by `/api/ui/buttons`.

### Tests

- `scripts/verify-nbp-json.js`
  Contract tests for prompt and JSON serialization.
- `e2e/smoke.spec.js`
  Playwright smoke coverage for routes, API, desktop, and mobile.
- `docs/testing.md`
  Canonical testing commands.

## Model system

The current model registry lives in `public/config/engine-capabilities.json`.

Supported model keys today:

- `nano-banana-pro`
- `gemini-imagen`
- `midjourney`
- `stable-diffusion`
- `flux`
- `dall-e-3`
- `ideogram`
- `chatgpt-image`

Important distinctions:

- `nano-banana-pro` uses `payload_mode: "nbp"`.
- `gemini-imagen` uses `payload_mode: "standard"`.
- `midjourney` forces `promptFormat: "midjourney"`.
- `gemini-imagen` shares some wrapper behavior with NBP-style prompt shaping,
  but it does not use the NBP JSON payload schema.

## Gemini current state

The repo currently supports `gemini-imagen` as a prompt target and capability
profile only.

What exists:

- model capability entry in `public/config/engine-capabilities.json`
- client hints and model normalization in `public/js/client_logic_full.js`
- server-side prompt and JSON output through the shared builder path

What does not exist:

- direct Google Gemini SDK integration
- `@google/generative-ai` dependency
- dedicated Gemini backend service files
- Gemini API key handling in server code
- a route that sends prompts to Google for generation

`GEMINI.md` must describe this real state and must not claim more.

## Commands that are real

### Local development

- `npm run dev`
  Starts the server on port `3000` by default.

### Tests

- `npm run test:nbp-json`
  Runs prompt and JSON contract checks.
- `npm run test:e2e`
  Runs the full Playwright suite against the default port.
- `npm run test:e2e:fresh`
  Runs the full Playwright suite on a dedicated port.
- `npm run test:e2e:smoke`
  Runs smoke tests against the default port.
- `npm run test:e2e:smoke:fresh`
  Runs smoke tests on a dedicated port. This is the safer Windows default.
- `npm run test:e2e:reuse`
  Reuses an already running server for the full suite.
- `npm run test:e2e:smoke:reuse`
  Reuses an already running server for the smoke suite.
- `npm run playwright:install`
  Installs Playwright browsers.

There is no `npm run build`.
There is no `npm run deploy`.

## API surface

Current HTTP routes of interest:

- `GET /`
- `GET /mobile/`
- `GET /m/`
- `GET /mobile-latest`
- `GET /ready`
- `GET /health`
- `GET /api/ui/buttons`
- `POST /api/prompt`
- `POST /api/compact`
- `POST /api/translate`
- `POST /api/enhance`

`/api/prompt` accepts:

- `application/json`
- `multipart/form-data` with up to 13 images

`/api/prompt` returns:

- `prompt`
- `json`
- `warnings`

## Security and production rules

- Use `helmet`, `cors`, `express-rate-limit`, and input validation as already
  implemented in `server.js`.
- Do not weaken CSP or file-upload checks without a concrete reason and tests.
- Keep static HTML, CSS, JS, and JSON on `no-store` cache headers unless the
  deployment strategy is intentionally changed.
- Treat `render.yaml`, `server.js`, routing, and live deployment linkage as
  production-sensitive.

## Testing policy

Minimum expected verification:

- Prompt logic or model capability changes:
  `npm run test:nbp-json`
- Mobile, routing, or UI shell changes:
  `npm run test:e2e:smoke:fresh`
- Broad behavior changes:
  `npm run test:e2e:fresh`

Current smoke coverage includes:

- `/health`
- `/ready`
- `/`
- `/mobile/`
- `POST /api/prompt` JSON
- `POST /api/prompt` multipart upload
- desktop constructor prompt update
- mobile shell rendering

CI:

- GitHub Actions workflow: `.github/workflows/e2e.yml`
- Runs on pushes and pull requests to `main`
- Executes NBP JSON checks plus Playwright smoke

## Documentation policy

This repo currently does not use these files as required workflow artifacts:

- `README.md`
- `task.md`
- `walkthrough.md`
- `CHANGELOG.md`

Do not reference them as mandatory project steps unless they are added on purpose.

Current doc roles:

- `CODEX.md`
  Main architecture and workflow source of truth.
- `AGENTS.md`
  Short operational instructions for coding agents in this workspace.
- `CLAUDE.md`
  Thin Claude-specific overlay.
- `SYSTEM.md`
  Agent-neutral behavior overlay for tools that read system-style local docs.
- `.cursorrules`
  Cursor-specific overlay that must defer to this file.
- `GEMINI.md`
  Real current Gemini support notes for this repo.
- `MEMORY.md`
  Stable project facts and user preferences only. Not a workflow source of truth.
- `docs/testing.md`
  Testing commands and environment notes.

## Change guidelines

Before changing core behavior:

1. Identify the real source file.
2. Check whether the browser and server share that logic.
3. Update the smallest correct surface.
4. Run the smallest correct test set.
5. If live behavior changes, verify deployed behavior too when possible.

High-risk files:

- `server.js`
- `server/prompt_engine.js`
- `server/request_state.js`
- `server/version_routing.js`
- `public/js/client_logic_full.js`
- `public/config/engine-capabilities.json`
- `public/mobile/index.html`
- `public/mobile/mobile.css`
- `public/mobile/js/mobile-shell.js`
- `render.yaml`

## Non-goals

Do not assume this repo has:

- React
- JSX components
- a `src/` application tree
- staging-specific build pipelines
- hidden shell review scripts
- direct model-provider SDK integrations unless the code is present

If any of that changes, update this file first.
