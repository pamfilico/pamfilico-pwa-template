# Service Worker

Default: **network-only** (`templates/sw.template.js`).

## Responsibilities

- `skipWaiting()` + `clients.claim()` on activate
- Poll `/api/version` every 30 seconds
- Post `AUTO_UPDATE` to clients on version mismatch
- Passthrough fetch (no asset caching)

## Build pipeline

1. Copy `sw.template.js` to `public/`
2. Copy `inject-version.js` to `scripts/`
3. Run before `next build`:

```bash
NEXT_PUBLIC_APP_VERSION=$CI_COMMIT_SHA node scripts/inject-version.js
```

4. Outputs `public/sw.js` + `public/version.json`

## Client registration

Use `ServiceWorkerRegistrar` or `registerServiceWorker()` from `@pamfilico/pwa-template/lib`.

## Advanced: caching template

`templates/sw.caching.template.js` — music_sets-style offline routes. Not recommended unless you need offline shell.

## Push (optional)

Copy `sw-push-notifications.js.stub` → `public/sw-push-notifications.js` and customize.
