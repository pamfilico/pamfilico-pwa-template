# Migration from PWAInstallPrompt

## Replace

| Remove | Add |
|--------|-----|
| `PWAInstallPrompt.tsx` | `PwaInstallProvider` |
| Auto-open setTimeout | `PWAInstallButton` triggers |
| Session dismiss cookies | Hide when installed/standalone |
| Layout inline `beforeinstallprompt` | Provider only |

## ClientWrapper before

```tsx
<PWAInstallPrompt />
{children}
```

## ClientWrapper after

```tsx
<PwaInstallProvider>
  <ServiceWorkerRegistrar />
  {children}
</PwaInstallProvider>
```

## i18n

Move hardcoded strings to `PWA` namespace from package i18n files.
