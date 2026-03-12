# Testing

## Smoke Suite

Run the permanent smoke suite locally:

```bash
npm run test:e2e:smoke
```

On Windows, the safer default is the dedicated-port variant:

```bash
npm run test:e2e:smoke:fresh
```

Run the full Playwright suite:

```bash
npm run test:e2e
```

Run the full suite on the dedicated Playwright port:

```bash
npm run test:e2e:fresh
```

If you intentionally want Playwright to attach to an already running local server:

```bash
npm run test:e2e:smoke:reuse
```

Or for the full suite:

```bash
npm run test:e2e:reuse
```

Install browser binaries when needed:

```bash
npm run playwright:install
```

Run the full autonomous project check:

```bash
npm run check:full
```

Run the same full check from any directory:

```bash
bash /mnt/c/Users/TOT/Documents/MoveVPE2/scripts/project1-anywhere.sh
```

Agent-facing copies (for AntiGravity/Codex tooling) are located in:

```text
.agent/workflows/
```

If your project path is different:

```bash
MOVEVPE2_ROOT=/path/to/MoveVPE2 bash /path/to/project1-anywhere.sh
```

## What the smoke suite covers

- `GET /health`
- `GET /`
- `GET /mobile/`
- `POST /api/prompt` with JSON payload
- `POST /api/prompt` with multipart image upload
- desktop constructor prompt generation
- mobile shell rendering

## WSL / npm reliability

The repo now includes a project-level [`.npmrc`](/mnt/c/Users/TOT/Documents/MoveVPE2/.npmrc) with:

- retry/backoff tuning
- longer network timeouts
- `prefer-offline=true`
- explicit npm registry

This reduces intermittent `EAI_AGAIN` failures in WSL, but it does not fully fix host-level DNS issues.

If WSL package installs become flaky again:

```bash
wsl --shutdown
```

Then reopen Ubuntu and retry:

```bash
npm ci
```

If the issue persists, verify basic connectivity:

```bash
npm ping
```

## CI

GitHub Actions smoke workflow:

- [e2e.yml](/mnt/c/Users/TOT/Documents/MoveVPE2/.github/workflows/e2e.yml)

It installs dependencies, downloads Playwright browsers, and runs the smoke suite on every push and pull request to `main`.
