import { useCallback, useEffect, useState } from "react";
import { canUseClipboard, canUseWebShare } from "../lib/pwa-detect.js";

export type WebSharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export function useWebShare(defaultPayload?: WebSharePayload) {
  const [supported, setSupported] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(false);

  useEffect(() => {
    setSupported(canUseWebShare(defaultPayload));
    setClipboardSupported(canUseClipboard());
  }, [defaultPayload?.title, defaultPayload?.text, defaultPayload?.url]);

  const share = useCallback(
    async (payload: WebSharePayload = {}) => {
      const data = { ...defaultPayload, ...payload };
      if (!canUseWebShare(data)) {
        throw new Error("Web Share API is not supported for this payload");
      }
      await navigator.share(data);
    },
    [defaultPayload],
  );

  const copyLink = useCallback(async (url?: string) => {
    const target = url ?? defaultPayload?.url;
    if (!target || !canUseClipboard()) {
      throw new Error("Clipboard API is not available");
    }
    await navigator.clipboard.writeText(target);
  }, [defaultPayload?.url]);

  return {
    supported,
    clipboardSupported,
    share,
    copyLink,
  };
}
