# Outbound Share

## PwaShareButton

Single action: Web Share API → clipboard fallback.

```tsx
<PwaShareButton
  payload={{ title: "My Page", url: "https://example.com/page" }}
  variant="outlined"
/>
```

## ShareMenu

Composite menu (Share / Copy link / Install):

```tsx
<ShareMenu
  payload={{ title: document.title, url: window.location.href }}
  showInstall
/>
```

Requires `PwaInstallProvider` ancestor for Install menu item.

## Hooks

```tsx
const { supported, share, copyLink } = useWebShare({ url: "https://..." });
```

## Unsupported browsers

Menu always offers **Copy link** when URL provided. Snackbar confirms copy.
