// Example: CarFast-style layout wrapper
"use client";

import {
  PwaInstallProvider,
  ServiceWorkerRegistrar,
  PWAInstallButton,
} from "@pamfilico/pwa-template/react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PwaInstallProvider>
      <ServiceWorkerRegistrar />
      <header>
        <PWAInstallButton variant="icon" />
      </header>
      {children}
    </PwaInstallProvider>
  );
}
