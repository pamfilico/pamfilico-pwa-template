export type RegisterServiceWorkerOptions = {
  path?: string;
  scope?: string;
  versionQuery?: string;
  onUpdate?: () => void;
  onAutoUpdate?: (newVersion: string) => void;
};

export async function registerServiceWorker(
  options: RegisterServiceWorkerOptions = {},
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  const {
    path = "/sw.js",
    scope = "/",
    versionQuery,
    onUpdate,
    onAutoUpdate,
  } = options;

  const url = versionQuery ? `${path}?v=${encodeURIComponent(versionQuery)}` : path;

  try {
    const registration = await navigator.serviceWorker.register(url, { scope });

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          onUpdate?.();
          registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data as { type?: string; version?: string; newVersion?: string };
      if (data?.type === "AUTO_UPDATE") {
        const version = data.version ?? data.newVersion ?? "unknown";
        onAutoUpdate?.(version);
      }
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      onUpdate?.();
    });

    if (document.visibilityState === "visible") {
      void registration.update();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void registration.update();
      }
    });

    return registration;
  } catch {
    return null;
  }
}
