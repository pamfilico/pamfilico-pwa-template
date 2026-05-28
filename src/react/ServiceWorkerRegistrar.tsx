"use client";

import { useEffect } from "react";
import {
  registerServiceWorker,
  type RegisterServiceWorkerOptions,
} from "../lib/register-service-worker.js";

export type ServiceWorkerRegistrarProps = RegisterServiceWorkerOptions & {
  /** Reload the page when a new SW version is detected (default: true) */
  reloadOnUpdate?: boolean;
  /** Delay before reload in ms (default: 1000) */
  reloadDelayMs?: number;
};

export default function ServiceWorkerRegistrar({
  reloadOnUpdate = true,
  reloadDelayMs = 1000,
  onAutoUpdate,
  onUpdate,
  ...options
}: ServiceWorkerRegistrarProps) {
  useEffect(() => {
    void registerServiceWorker({
      ...options,
      onUpdate: () => {
        onUpdate?.();
        if (reloadOnUpdate) {
          window.setTimeout(() => window.location.reload(), reloadDelayMs);
        }
      },
      onAutoUpdate: (version) => {
        onAutoUpdate?.(version);
        if (reloadOnUpdate) {
          window.setTimeout(() => window.location.reload(), reloadDelayMs);
        }
      },
    });
  }, [
    options.path,
    options.scope,
    options.versionQuery,
    reloadOnUpdate,
    reloadDelayMs,
    onAutoUpdate,
    onUpdate,
  ]);

  return null;
}
