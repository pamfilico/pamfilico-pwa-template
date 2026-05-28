# Install UI

Uses **PwaInstallProvider** + **PWAInstallButton** (CarFast / codespec §7).

## Mount order

```
ClientWrapper
  └── PwaInstallProvider
        ├── ServiceWorkerRegistrar
        ├── Header → PWAInstallButton variant="icon"
        ├── LandingPage → PWAInstallButton variant="hero"
        └── InlineInstallNag (optional, iOS)
```

## Variants

| Variant | UI | test id |
|---------|-----|---------|
| `icon` | Bordered IconButton + tooltip | `pwa-install-button` |
| `hero` | Outlined Button with label | `pwa-install-hero` |

## Styling

Pass MUI `sx`, `iconSx`, or `heroSx` for design tokens:

```tsx
<PWAInstallButton
  variant="icon"
  iconSx={{ borderColor: tokens.line2, color: tokens.ink2 }}
/>
```

## iOS

Provider detects iOS and shows instruction-only dialog (no native Install button).
