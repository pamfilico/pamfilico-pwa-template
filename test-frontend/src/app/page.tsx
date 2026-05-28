"use client";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { NextIntlClientProvider } from "next-intl";
import {
  PwaInstallProvider,
  PWAInstallButton,
  InlineInstallNag,
  ShareMenu,
  ServiceWorkerRegistrar,
} from "@pamfilico/pwa-template/react";
import messages from "@pamfilico/pwa-template/i18n/pwa.en.json";

const theme = createTheme();

export default function DemoApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NextIntlClientProvider locale="en" messages={messages}>
        <PwaInstallProvider>
          <ServiceWorkerRegistrar path="/sw.js" reloadOnUpdate={false} />
          <header style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}>
            <strong>PWA Template Demo</strong>
            <PWAInstallButton variant="icon" />
            <ShareMenu payload={{ title: "Demo", url: "https://example.com" }} />
          </header>
          <InlineInstallNag />
          <main style={{ padding: 16 }}>
            <PWAInstallButton variant="hero" />
          </main>
        </PwaInstallProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
