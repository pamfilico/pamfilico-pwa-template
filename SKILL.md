---
name: pamfilico-pwa-template
description: >-
  Adopt @pamfilico/pwa-template in a Next.js app: install UI (PwaInstallProvider +
  PWAInstallButton), service worker templates, version API, share menu, and optional
  Web Share Target scaffolding. Use when adding PWA install, share target, service
  worker, or migrating from PWAInstallPrompt.
argument-hint: "[repo-path]"
disable-model-invocation: true
---

Install and wire **@pamfilico/pwa-template** in a Pamfilico Next.js frontend.

Package source: `codespec/packages/pamfilico-pwa-template/` (submodule) or:

```bash
npm install git+https://github.com/pamfilico/pamfilico-pwa-template.git
```

Full README: `packages/pamfilico-pwa-template/README.md`

## When to use

- New PWA setup in a Next.js App Router app
- Replace legacy `PWAInstallPrompt` auto-modal
- Add header/hero install button (CarFast pattern)
- Add outbound share menu or inbound share_target (projectfa.st / music_sets)
- Standardize SW version polling across repos

## Workflow

### 1. Install (real npm dependency — never a path reference)

```bash
npm install git+https://github.com/pamfilico/pamfilico-pwa-template.git
```

Commit the updated `package-lock.json`.

**`package.json` must look like:**

```json
"@pamfilico/pwa-template": "git+https://github.com/pamfilico/pamfilico-pwa-template.git"
```

**Never do this:**

```json
"@pamfilico/pwa-template": "file:../../../codespec/packages/pamfilico-pwa-template"
```

That creates a **host symlink**, not an installed package. It breaks immediately in Docker dev stacks that bind-mount `./frontend:/app` and use an anonymous `/app/node_modules` volume — the symlink target does not exist inside the container → `Module not found: Can't resolve '@pamfilico/pwa-template/react'`.

Ensure peers: `@mui/material`, `@mui/icons-material`, `next-intl`, `@emotion/react`, `@emotion/styled`.

Add to `next.config.ts`:

```ts
transpilePackages: ["@pamfilico/pwa-template"],
```

### 2. Copy templates

From `node_modules/@pamfilico/pwa-template/templates/`:

| Source | Destination |
|--------|-------------|
| `sw.template.js` | `public/sw.template.js` |
| `inject-version.js` | `scripts/inject-version.js` |
| `manifest.template.json` | Customize → `public/manifest.json` |

Add to `package.json`:

```json
"inject-version": "node scripts/inject-version.js",
"build": "npm run inject-version && next build"
```

### 3. Version API

```ts
// app/api/version/route.ts
import { createVersionRoute } from "@pamfilico/pwa-template/next";
export const GET = createVersionRoute();
```

### 4. Client wrapper

Wrap app children (inside SessionProvider if present):

```tsx
import { PwaInstallProvider, ServiceWorkerRegistrar } from "@pamfilico/pwa-template/react";

<PwaInstallProvider>
  <ServiceWorkerRegistrar />
  {children}
</PwaInstallProvider>
```

**Do not** register `beforeinstallprompt` in layout inline scripts — provider owns it.

### 5. Install triggers

```tsx
import { PWAInstallButton } from "@pamfilico/pwa-template/react";

// Header toolbar (all pages with header)
<PWAInstallButton variant="icon" />

// Landing hero CTA row
<PWAInstallButton variant="hero" />
```

Optional iOS banner: `<InlineInstallNag />`

### 6. i18n (merge into app messages — do not import from package)

Copy keys from `node_modules/@pamfilico/pwa-template/i18n/pwa.en.json` and `pwa.el.json` into the app's `messages/en.json` / `messages/el.json` under a `"PWA"` namespace.

Required namespace: `PWA.*` plus `buttons.cancel` for dialog dismiss.

**In app components, use `useTranslations("PWA")` only.** Do **not** import `@pamfilico/pwa-template/i18n/...` in production app code — that pattern is for the package's own test-frontend demo only.

Do **not** add `COPY i18n/` to app Dockerfiles. CarFast / music_sets / language_learning keep strings in `messages/*.json`.

### 7. Layout meta tags

Use Next.js metadata or `<PwaHeadMeta />` from `@pamfilico/pwa-template/next`:

- `theme-color`
- `apple-mobile-web-app-capable`
- `manifest` link to `/manifest.json`

### 8. Optional share target

1. Add `share_target` to manifest (see `buildProjectFastStyleShareTarget()`)
2. Create `app/share-target/route.ts` with `createShareTargetRoute({ isAuthenticated, loginRedirect, onCapture })`
3. Wire `onCapture` to app backend (projectfa.st share-batch is app-specific — not in package)

### 9. Optional outbound share

```tsx
import { ShareMenu, PwaShareButton } from "@pamfilico/pwa-template/react";

<ShareMenu payload={{ title: "Page", url: window.location.href }} />
```

### 10. CI / Docker

**Production Dockerfile** (`node:20-alpine`):

```dockerfile
RUN apk add --no-cache git   # required for git+https npm dependencies

ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION

COPY package*.json ./
RUN npm ci                     # lockfile must resolve @pamfilico/pwa-template from GitHub
COPY . .
RUN npm run build
```

GitLab CI: `--build-arg NEXT_PUBLIC_APP_VERSION="$CI_COMMIT_SHA"`

**Docker Compose dev** (bind-mount + anonymous `node_modules` volume — language_learning pattern):

```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules          # persists across container recreates
  - /app/.next
```

Pitfalls observed in **language_learning** integration (May 2026):

| Mistake | Symptom | Fix |
|---------|---------|-----|
| `file:../../../codespec/...` in `package.json` | `Module not found` for `/react`, `/next` in container | Use `git+https://github.com/pamfilico/pamfilico-pwa-template.git`; run `npm install`; commit lockfile |
| Rebuilt image but old `node_modules` volume | Package missing in running container even after `--build` | `docker rm -v languagefast_frontend_local` then `./upbuild.sh --languagefast` (recreates fresh volume from image) |
| Alpine image without `git` | `npm install` / `npm ci` fails silently or omits git dependency | `RUN apk add --no-cache git` before `npm ci` |
| Importing `@pamfilico/pwa-template/i18n/*` in app | Wrong pattern; user rejected | Merge keys into `messages/*.json` |
| `COPY i18n/` in Dockerfile | Not used in CarFast/music_sets | Remove; strings live in app messages |

After changing `package.json` dependencies in a compose dev stack, **rebuilding the image is not enough** — remove the container's anonymous `/app/node_modules` volume or the stale volume keeps the old (broken) install.

```bash
docker compose -f docker-compose.dev-languagefast.yml stop languagefast-frontend
docker rm -v languagefast_frontend_local
./upbuild.sh --languagefast
```

See [docs/docker-ci.md](./docs/docker-ci.md) for full Docker/CI notes.

## Verification checklist

- [ ] Install icon visible in header when not standalone
- [ ] Hero install button on landing
- [ ] Click opens dialog (never auto-opens on load)
- [ ] iOS shows Share → Add to Home Screen steps
- [ ] `/api/version` returns commit SHA
- [ ] Deploy new version → clients reload within ~30s
- [ ] Share menu copy-link works when Web Share unsupported
- [ ] Remove legacy `PWAInstallPrompt` if present

## Anti-patterns

- Do **not** use `file:` path references to codespec or monorepo siblings — install from GitHub
- Do **not** assume `docker compose up --build` refreshes `/app/node_modules` when an anonymous volume exists
- Do **not** import `@pamfilico/pwa-template/i18n/*` in app code — merge into `messages/*.json`
- Do **not** `COPY i18n/` in app Dockerfiles
- Do **not** use `next-pwa` or Workbox caching (network-only default)
- Do **not** auto-open install modal after timeout
- Do **not** duplicate `beforeinstallprompt` listeners outside provider
- Do **not** bake `NEXT_PUBLIC_*` URLs without rebuild when they change
- Do **not** copy inline `PwaInstallProvider` / `PWAInstallButton` into apps when the package exists

## Reference implementations

| App | Path |
|-----|------|
| CarFast | `travelsuite_monorepo/frontends/carfast/` |
| language_learning | `pleasureapps/language_learning/frontend/` |
| projectfa.st | `organizationapps/workspace/frontends/project/` |
| music_sets | `pleasureapps/music_sets/frontend/` |

Spec: `codespec/docs/frontend/pwa/index.md`
