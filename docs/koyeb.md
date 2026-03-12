# Koyeb Deploy (MoveVPE2)

Prepared files for Koyeb:

- `Dockerfile.koyeb` — production image using only runtime files
- `.dockerignore` — excludes non-runtime files from build context
- `koyeb.yaml` — Koyeb app/service descriptor

## Runtime payload included in image

- `package.json`
- `package-lock.json`
- `server.js`
- `server/`
- `public/`

No agent folders, test artifacts, docs, or local tooling are copied into the container.

## Deploy using Koyeb dashboard

1. In Koyeb, create a new App from Git repository `Migrabe/MoveVPE2`.
2. Select branch `main`.
3. Choose Docker deployment.
4. Set Dockerfile path to `Dockerfile.koyeb`.
5. Expose port `3000` as HTTP.
6. Deploy.

## Health check endpoint

- `/health`
