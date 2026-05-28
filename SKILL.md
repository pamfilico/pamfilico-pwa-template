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

### 1. Install

```bash
npm install git+https://github.com/pamfilico/pamfilico-pwa-template.git
```

Ensure peers: `@mui/material`, `@mui/icons-material`, `next-intl`, `@emotion/react`, `@emotion/styled`.

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

### 6. i18n

Merge `@pamfilico/pwa-template/i18n/pwa.en.json` and `pwa.el.json` into app `messages/`.

Required namespace: `PWA.*` plus `buttons.cancel` for dialog dismiss.

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

```dockerfile
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
```

GitLab CI: `--build-arg NEXT_PUBLIC_APP_VERSION="$CI_COMMIT_SHA"`

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

- Do **not** use `next-pwa` or Workbox caching (network-only default)
- Do **not** auto-open install modal after timeout
- Do **not** duplicate `beforeinstallprompt` listeners outside provider
- Do **not** bake `NEXT_PUBLIC_*` URLs without rebuild when they change

## Reference implementations

| App | Path |
|-----|------|
| CarFast | `travelsuite_monorepo/frontends/carfast/` |
| language_learning | `pleasureapps/language_learning/frontend/` |
| projectfa.st | `organizationapps/workspace/frontends/project/` |
| music_sets | `pleasureapps/music_sets/frontend/` |

Spec: `codespec/docs/frontend/pwa/index.md`
