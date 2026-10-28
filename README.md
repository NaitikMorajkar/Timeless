# Project Timeless

Project Timeless is a cinematic archive experience for preserving human wisdom, cultural traditions and practical life knowledge.

## Ask the Archive

The `/ask` route uses a same-origin server endpoint at `POST /api/ask-archive`. The browser sends only the question. The Nebius credential is read on the server from `NEBIUS_API_KEY` and is never included in frontend JavaScript.

Responses are explicitly labeled as **General AI answer** and **Not grounded in archived stories**. The current project contains example stories only; the prompt prevents the model from inventing archive sources, citations, people, dates or quotations.

The default model is the cost-efficient public NVIDIA Nemotron model documented by Nebius:

```text
nvidia/Nemotron-3-Nano-30B-A3B
```

The server accepts optional overrides when a valid Nebius account catalog requires them:

```text
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEBIUS_MODEL_ID=nvidia/Nemotron-3-Nano-30B-A3B
```

### Required environment variable

Set the key only in the server/runtime environment or the project's protected secret manager:

```text
NEBIUS_API_KEY=<your Nebius Token Factory API key>
```

Never place the key in `src/`, `.env` files committed to the repository, browser code, or client-side request headers.

### Local development

Install dependencies and start the Vite server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Vite runs the Ask the Archive API middleware server-side in development. Check its health endpoint:

```bash
curl http://localhost:3000/api/health
```

### Production server

Build and run the compatible container/server target:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The server listens on `PORT` when supplied, otherwise port `3000`. It serves `dist/`, handles SPA fallback routes, exposes `/api/health`, and keeps `/api/ask-archive` server-side.

### Verify the Nebius catalog

With `NEBIUS_API_KEY` available only in the shell environment, verify the account's current model catalog before changing `NEBIUS_MODEL_ID`:

```bash
curl -fsS \
  -H "Authorization: Bearer ${NEBIUS_API_KEY}" \
  "${NEBIUS_BASE_URL:-https://api.tokenfactory.nebius.com/v1}/models"
```

Use a model ID returned by that account's catalog. The production route reports the configured model ID in its JSON metadata but never returns the API key.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

No authentication, database persistence or archive-source retrieval is implemented in this step.
