export function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function canUseWebShare(data?: ShareData): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  if (data && navigator.canShare && !navigator.canShare(data)) return false;
  return true;
}

export function canUseClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.writeText
  );
}
