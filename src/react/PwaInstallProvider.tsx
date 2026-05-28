"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { InstallMobile as InstallIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { detectIOS, isStandaloneMode } from "../lib/pwa-detect.js";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaInstallContextValue = {
  canShow: boolean;
  iosFallback: boolean;
  hasDeferredPrompt: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return ctx;
}

export type PwaInstallProviderProps = {
  children: React.ReactNode;
  /** Override cancel button label namespace key (default: buttons.cancel) */
  cancelNamespace?: string;
  cancelKey?: string;
};

export default function PwaInstallProvider({
  children,
  cancelNamespace = "buttons",
  cancelKey = "cancel",
}: PwaInstallProviderProps) {
  const tPWA = useTranslations("PWA");
  const tCancel = useTranslations(cancelNamespace);

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [iosFallback, setIosFallback] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneMode();
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    if (detectIOS() && !standalone) {
      setIosFallback(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setDialogOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShow = !isInstalled && !isStandalone;

  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setDialogOpen(false);
      }
    } catch {
      // no-op
    }
  };

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      canShow,
      iosFallback,
      hasDeferredPrompt: deferredPrompt !== null,
      openDialog,
      closeDialog,
    }),
    [canShow, iosFallback, deferredPrompt, openDialog, closeDialog],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      {canShow && (
        <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            {iosFallback ? tPWA("addToHomeScreen") : tPWA("installApp")}
          </DialogTitle>
          <DialogContent>
            {iosFallback ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2">{tPWA("installInstructions")}</Typography>
                <Typography variant="body2">{tPWA("tapShareButton")}</Typography>
                <Typography variant="body2">{tPWA("scrollDown")}</Typography>
                <Typography variant="body2">{tPWA("chooseAddToHomeScreen")}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {tPWA("installAppDescription")}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>
              {iosFallback ? tPWA("gotIt") : tCancel(cancelKey)}
            </Button>
            {!iosFallback && deferredPrompt && (
              <Button
                variant="contained"
                onClick={handleInstall}
                startIcon={<InstallIcon />}
              >
                {tPWA("installApp")}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </PwaInstallContext.Provider>
  );
}
