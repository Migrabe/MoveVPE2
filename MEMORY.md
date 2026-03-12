# MEMORY.md

MoveVPE2 stable facts and user preferences.

This file stores durable context only.
It is not the main workflow source of truth.

## Stable project facts

- The project uses Node.js, Express, and a Vanilla JS frontend.
- Shared prompt generation depends on both `server/prompt_engine.js` and
  `public/js/client_logic_full.js`.
- Mobile and desktop routing depends on `server/version_routing.js`.
- `gemini-imagen` is currently a prompt target and capability profile, not a
  direct server-side Google SDK integration.

## Stable workspace facts

- `CODEX.md` is the primary source of truth.
- Agent overlays must not diverge from `CODEX.md`.
- Agent-private directories exist: `.agent/`, `.agents/`, `.claude/`, `.continue/`.

## User preferences

- Communicate in Russian unless asked otherwise.
- Keep code and identifiers in English.
- Prefer concise, plain Markdown over decorative formatting.
- Keep different agent outputs aligned and avoid agent-specific divergence.
