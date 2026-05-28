# Share Target (inbound)

OS share sheet → installed PWA → your app.

## Manifest

Use `buildProjectFastStyleShareTarget()` or copy from projectfa.st manifest.

## Route scaffold

```ts
import { createShareTargetRoute } from "@pamfilico/pwa-template/next";

export const { GET, POST } = createShareTargetRoute({
  isAuthenticated: async (req) => Boolean(/* session cookie */),
  loginRedirect: (req, path) => new URL(`/auth/login?callbackUrl=${encodeURIComponent(path)}`, req.url),
  onCapture: async (req, payload) => {
    // payload: { title, text, url, sourceUrl, files }
    return Response.redirect(new URL("/inbox", req.url));
  },
});
```

## Payload parsing

`parseShareTargetFormData()` and `resolveCaptureSourceUrl()` in `@pamfilico/pwa-template/lib`.

## App-specific (not in package)

projectfa.st implements:

- Temp file staging (`share-batch/`)
- Multipart field name tolerance (Android gallery)
- Backend Ideas API upload

Document your app's capture handler; use package scaffold as entry point.

## Middleware

Exclude `/share-target` from i18n proxy if using locale prefixes (see music_sets `proxy.ts`).
