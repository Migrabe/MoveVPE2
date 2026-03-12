# GEMINI.md

MoveVPE2 Gemini notes.

This file describes the real current `gemini-imagen` support in this repo.
It is not a generic Google Gemini SDK guide.

Scope rule:

- use `CODEX.md` for general project workflow
- use this file only for Gemini-specific facts
- if there is any conflict on general workflow, `CODEX.md` wins

## Current status

`gemini-imagen` is supported as a prompt target inside the VPE builder.

Today that means:

- the model appears in the UI model registry
- prompt format is normalized against Gemini capabilities
- prompt text and JSON output are generated for Gemini through the shared
  browser-and-server builder path

Today that does not mean:

- direct calls to Google Gemini APIs
- image generation on the server through Google
- API key management for Gemini in this repo
- a dedicated Gemini backend service

## Where Gemini support lives

- `public/config/engine-capabilities.json`
- `public/js/client_logic_full.js`
- `server/prompt_engine.js`

These files define and consume the current Gemini behavior.

## Actual capabilities in this repo

Current `gemini-imagen` capability entry:

- `allowed_prompt_formats`: `flat`, `structured`
- `allowed_aspect_ratios`: `1:1`, `4:3`, `3:4`, `16:9`, `9:16`
- `default_aspect_ratio`: `1:1`
- `uses_nbp_wrappers`: `true`
- `payload_mode`: `standard`
- `supports_reference_weight`: `false`
- `param_panel`: `none`
- `max_prompt_chars`: `9000`

Behavioral meaning:

- Gemini does not expose a dedicated engine-parameter panel in the current UI.
- Gemini does not use the Midjourney prompt format.
- Gemini does not use the NBP JSON payload schema.
- Gemini shares some NBP-style wrapper logic for prompt shaping and special-mode
  composition, but the final JSON stays on the standard payload path.

## JSON behavior

Because `payload_mode` is `standard`, Gemini output follows the standard VPE
JSON structure, not the NBP structure.

Standard payload fields are defined by the shared builder logic and include:

- `schema`
- `model`
- `subject`
- `prompt_flat`
- `technical`
- `parameters`
- `modes`

If the shared builder changes, this file must be updated to match the actual
result rather than an intended future design.

## What is not implemented

The following do not exist in the current codebase:

- `@google/generative-ai`
- Gemini-specific runtime service files
- Gemini API routes in `server.js`
- Gemini environment variables consumed by runtime code
- Gemini caching, retries, rate limiting, or safety wrappers

Do not document those features as live unless they are actually added.

## How to test current Gemini support

### Local server

Start the app:

```bash
npm run dev
```

### Prompt API check

Send a request with `aiModel: "gemini-imagen"` and a supported format.

PowerShell example:

```powershell
$body = @{
  state = @{
    aiModel = "gemini-imagen"
    promptFormat = "flat"
    mainSubject = "studio portrait under soft blue light"
    aspectRatio = "1:1"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/prompt" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected result:

- `model` in returned JSON is `gemini-imagen`
- no Midjourney-only syntax is forced
- output remains on the standard JSON path

### Regression checks

Run:

```bash
npm run test:nbp-json
npm run test:e2e:smoke:fresh
```

There is no dedicated Gemini test file yet.
Gemini is currently covered indirectly through shared prompt-engine behavior.

## Safe editing rules for Gemini support

If you change Gemini behavior, check both places:

1. `public/config/engine-capabilities.json`
2. `public/js/client_logic_full.js`

If server output changes, also verify:

3. `server/prompt_engine.js`
4. `server/request_state.js`

Typical safe changes:

- adjust capability flags
- change allowed prompt formats
- change aspect-ratio allowances
- update model hints and compatibility pruning

High-risk changes:

- changing `payload_mode`
- changing `uses_nbp_wrappers`
- changing shared builder logic in a way that affects other models

## If direct Gemini API integration is added later

When real Google Gemini generation is implemented, update this file only after
all of the following exist in code:

- runtime dependency added to `package.json`
- server-side Gemini client code
- environment-variable loading and validation
- request path wired into `server.js`
- tests for success and failure paths

Until then, this file must remain a description of prompt-target support only.
