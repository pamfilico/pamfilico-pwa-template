# Docker & CI

## Install dependency in Docker

`@pamfilico/pwa-template` is installed from GitHub, not copied from codespec:

```json
"@pamfilico/pwa-template": "git+https://github.com/pamfilico/pamfilico-pwa-template.git"
```

Alpine-based Node images **must install git** before `npm ci`:

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app
COPY package*.json ./
RUN npm ci
```

The package runs `prepare` → `npm run build` on install, producing `dist/` with subpath exports (`/react`, `/next`, etc.).

Commit `package-lock.json` — CI and Docker builds rely on the lockfile, not a local symlink.

---

## Production Dockerfile

```dockerfile
FROM node:20-alpine

RUN apk add --no-cache git

ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

Build must run `inject-version` before `next build` (via `npm run build` script).

## GitLab CI

```yaml
build:
  script:
    - docker build --build-arg NEXT_PUBLIC_APP_VERSION="$CI_COMMIT_SHA" .
```

## Env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_VERSION` | SW version + client query string |
| `CI_COMMIT_SHA` | Fallback in inject-version + version API |
| `PWA_CACHE_PREFIX` | Optional cache namespace in SW template |

---

## Docker Compose dev (bind-mount + anonymous node_modules)

Pattern used by language_learning:

```yaml
languagefast-frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - /app/.next
```

### How it works

1. Image build runs `npm install` → populates `/app/node_modules` in the image layer.
2. On **first** container create, the anonymous `/app/node_modules` volume is initialized from the image.
3. On **subsequent** recreates, the **same volume persists** — even after `docker compose up --build`.

### When dependencies change

If you add or fix `@pamfilico/pwa-template` in `package.json`, rebuilding alone is **not enough**. The stale volume still has the old (or missing) install.

```bash
docker compose -f docker-compose.dev-languagefast.yml stop languagefast-frontend
docker rm -v languagefast_frontend_local
./upbuild.sh --languagefast
```

Verify inside the container:

```bash
docker exec languagefast_frontend_local ls node_modules/@pamfilico/pwa-template/dist/next/index.js
```

---

## Mistakes to avoid (language_learning, May 2026)

| Mistake | Why it fails |
|---------|--------------|
| `"file:../../../codespec/..."` | Symlink target absent in container; not a real install |
| Rebuild without removing `node_modules` volume | Old volume keeps broken/missing package |
| No `git` in Alpine before `npm ci` | GitHub dependency cannot be fetched |
| `COPY i18n/` from package in app Dockerfile | Wrong pattern — strings belong in app `messages/*.json` |
| Import `@pamfilico/pwa-template/i18n/*` in app | Demo-only; production apps use merged `messages/` |

---

## next.config

```ts
const nextConfig = {
  transpilePackages: ["@pamfilico/pwa-template"],
};
```

Required so Next.js/Turbopack compiles the package's TypeScript exports in dev.
