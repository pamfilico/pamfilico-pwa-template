# @pamfilico/pwa-template

Reusable Progressive Web App kit for Pamfilico Next.js apps. Consolidates patterns from **CarFast** (install UI), **projectfa.st** (Web Share Target), and **music_sets** (iOS nag + optional offline SW).

## Install

```bash
npm install git+https://github.com/pamfilico/pamfilico-pwa-template.git
```

**Install it as a real dependency.** Do not use `file:../../../codespec/...` — that is a host symlink, not an npm install, and breaks in Docker dev stacks.

Peer dependencies: `react`, `next`, `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `next-intl`.

Add to `next.config.ts`:

```ts
transpilePackages: ["@pamfilico/pwa-template"],
```

## Quick start (5 minutes)

### 1. Copy templates into your app

```bash
cp node_modules/@pamfilico/pwa-template/templates/sw.template.js public/
cp node_modules/@pamfilico/pwa-template/templates/inject-version.js scripts/
cp node_modules/@pamfilico/pwa-template/templates/manifest.template.json public/manifest.json
# optional push stub
cp node_modules/@pamfilico/pwa-template/templates/sw-push-notifications.js.stub public/sw-push-notifications.js
```

Customize `public/manifest.json` (name, colors, icons). Remove `share_target` if not needed yet.

### 2. Wire build script

```json
{
  "scripts": {
    "inject-version": "node scripts/inject-version.js",
    "build": "npm run inject-version && next build"
  }
}
```

Set `NEXT_PUBLIC_APP_VERSION=$CI_COMMIT_SHA` in Docker/CI.

### 3. Version API route

```ts
// app/api/version/route.ts
import { createVersionRoute } from "@pamfilico/pwa-template/next";

export const GET = createVersionRoute();
```

### 4. Layout integration

```tsx
"use client";

import {
  PwaInstallProvider,
  ServiceWorkerRegistrar,
} from "@pamfilico/pwa-template/react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PwaInstallProvider>
      <ServiceWorkerRegistrar versionQuery={process.env.NEXT_PUBLIC_APP_VERSION} />
      {children}
    </PwaInstallProvider>
  );
}
```

### 5. Header + hero install buttons

```tsx
import { PWAInstallButton } from "@pamfilico/pwa-template/react";

<PWAInstallButton variant="icon" />
<PWAInstallButton variant="hero" />
```

### 6. i18n

Merge keys from `node_modules/@pamfilico/pwa-template/i18n/pwa.en.json` into `messages/en.json` (and `pwa.el.json` for Greek). Replace `{{appName}}` in strings if using ICU-style placeholders manually.

**Do not** import `@pamfilico/pwa-template/i18n/*` in app components — use `useTranslations("PWA")` with merged app messages (CarFast / music_sets / language_learning pattern).

---

## Docker dev & common mistakes

Real-world failures from the **language_learning** adoption (May 2026):

### 1. `file:` path instead of git install

```json
// WRONG — symlink to host codespec, missing in container
"@pamfilico/pwa-template": "file:../../../codespec/packages/pamfilico-pwa-template"

// CORRECT
"@pamfilico/pwa-template": "git+https://github.com/pamfilico/pamfilico-pwa-template.git"
```

Symptom: `Module not found: Can't resolve '@pamfilico/pwa-template/react'` and `/next`.

### 2. Stale anonymous `node_modules` volume

Compose dev stacks often use:

```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules
```

Rebuilding the image does **not** replace an existing anonymous volume. After fixing `package.json`, remove the old volume:

```bash
docker rm -v languagefast_frontend_local
./upbuild.sh --languagefast
```

### 3. Alpine Dockerfiles need `git`

```dockerfile
RUN apk add --no-cache git
```

Required before `npm ci` / `npm install` when the dependency comes from `git+https://...`.

### 4. i18n belongs in app `messages/`, not Docker `COPY i18n/`

Do not copy package `i18n/` into Docker images. Merge translation keys into the app's `messages/en.json` / `messages/el.json`.

---

## Package exports

| Import path | Contents |
|-------------|----------|
| `@pamfilico/pwa-template` | All public APIs |
| `@pamfilico/pwa-template/react` | UI components |
| `@pamfilico/pwa-template/next` | Next.js route factories + head meta |
| `@pamfilico/pwa-template/hooks` | React hooks |
| `@pamfilico/pwa-template/lib` | Utilities (detect, manifest builder, share parsing) |
| `@pamfilico/pwa-template/templates/*` | Copy-paste SW/manifest/inject files |
| `@pamfilico/pwa-template/i18n/*` | Translation JSON |

---

## Components

### Install UI (CarFast pattern)

| Component | Description |
|-----------|-------------|
| `PwaInstallProvider` | Single `beforeinstallprompt` listener + shared MUI dialog |
| `PWAInstallButton` | Wiggling install trigger — `variant="icon"` \| `"hero"` |
| `InlineInstallNag` | iOS Safari banner with Add to Home Screen hint |

**Behavior:** User-initiated only (never auto-modal). Visible when not installed / not standalone. iOS shows manual Share steps.

### Share (outbound)

| Component | Description |
|-----------|-------------|
| `PwaShareButton` | `navigator.share()` with clipboard fallback |
| `ShareMenu` | MUI menu: Share / Copy link / Install app |

### Service worker

| Component | Description |
|-----------|-------------|
| `ServiceWorkerRegistrar` | Registers `/sw.js`, polls updates, optional auto-reload |

### Debug (dev only)

| Component | Description |
|-----------|-------------|
| `PwaInstallDebug` | Install state diagnostics |
| `ServiceWorkerDebug` | SW registration status |

---

## Share target (inbound — projectfa.st / music_sets)

Add to `manifest.json`:

```json
"share_target": {
  "action": "/share-target",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": { "title": "title", "text": "text", "url": "url", "files": [...] }
}
```

Route scaffold:

```ts
// app/share-target/route.ts
import { createShareTargetRoute } from "@pamfilico/pwa-template/next";

const handler = createShareTargetRoute({
  isAuthenticated: async (request) => /* check session */,
  loginRedirect: (request, callbackPath) => new URL(`/auth/login?callbackUrl=${callbackPath}`, request.url),
  onCapture: async (request, payload) => {
    // Wire to your backend — save URL/files
    return Response.redirect(new URL("/inbox", request.url));
  },
});

export const { GET, POST } = handler;
```

See [docs/share-target.md](./docs/share-target.md) for projectfa.st-style file staging notes.

---

## Manifest builder

```ts
import { buildManifest, buildProjectFastStyleShareTarget } from "@pamfilico/pwa-template/lib";

const manifest = buildManifest({
  name: "My App",
  short_name: "MyApp",
  description: "Description",
  theme_color: "#1A237E",
  background_color: "#ffffff",
  icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  share_target: buildProjectFastStyleShareTarget("/share-target"),
});
```

---

## Service worker strategies

| Template | Use when |
|----------|----------|
| `templates/sw.template.js` | **Default** — network-only, version polling (codespec standard) |
| `templates/sw.caching.template.js` | Advanced offline shell (music_sets style) |

Push notifications: copy `sw-push-notifications.js.stub` → `public/sw-push-notifications.js`.

---

## Full integration checklist

1. Icons (192, 512, maskable, apple-touch)
2. `manifest.json` (+ optional `share_target`)
3. Copy `sw.template.js` → run `inject-version` before build
4. `/api/version` route via `createVersionRoute()`
5. `PwaInstallProvider` in client layout wrapper
6. `ServiceWorkerRegistrar` (or inline registration script)
7. `PWAInstallButton` in header + hero
8. Merge i18n `PWA` namespace
9. Dockerfile `ARG NEXT_PUBLIC_APP_VERSION`
10. CI `--build-arg NEXT_PUBLIC_APP_VERSION=$CI_COMMIT_SHA`
11. Optional: `ShareMenu` / share-target route
12. Optional: `InlineInstallNag` on landing
13. Test install on Chrome + iOS Safari
14. Test version reload after deploy

Detailed guides: [docs/](./docs/).

---

## Migration from legacy `PWAInstallPrompt`

| Legacy | Replacement |
|--------|-------------|
| Auto-modal after 3–5s | `PWAInstallButton` (user click) |
| Inline layout `beforeinstallprompt` | `PwaInstallProvider` only |
| Hardcoded English | `next-intl` `PWA` namespace |

See [docs/migration-legacy-prompt.md](./docs/migration-legacy-prompt.md).

---

## Per-app examples

| App | What to copy |
|-----|--------------|
| CarFast | Provider + header/hero buttons |
| language_learning | Same + design token `sx` overrides |
| projectfa.st | Share target + share-batch (app-specific backend) |
| music_sets | InlineInstallNag + optional caching SW |

Snippets: [examples/](./examples/).

---

## Agent skill

Cursor agents: read [SKILL.md](./SKILL.md) for step-by-step adoption in any repo.

---

## Tests

```bash
./run-tests.sh
```

Dockerized Next.js demo + Playwright (install button, share menu).

---

## License

MIT © Pamfilico
