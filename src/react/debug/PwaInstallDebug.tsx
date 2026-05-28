"use client";

import React from "react";
import { Alert, Stack, Typography } from "@mui/material";
import { usePwaInstall } from "../PwaInstallProvider.js";
import { useBeforeInstallPrompt } from "../../hooks/useBeforeInstallPrompt.js";
import { useStandalone } from "../../hooks/useStandalone.js";
import { detectIOS } from "../../lib/pwa-detect.js";

export default function PwaInstallDebug() {
  const standalone = useStandalone();
  const { canShow, iosFallback, hasDeferredPrompt } = usePwaInstall();
  const { deferredPrompt, installed } = useBeforeInstallPrompt();

  return (
    <Alert severity="info" sx={{ m: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">PWA Install Debug</Typography>
        <Typography variant="caption">standalone: {String(standalone)}</Typography>
        <Typography variant="caption">ios: {String(detectIOS())}</Typography>
        <Typography variant="caption">canShow: {String(canShow)}</Typography>
        <Typography variant="caption">iosFallback: {String(iosFallback)}</Typography>
        <Typography variant="caption">hasDeferredPrompt: {String(hasDeferredPrompt)}</Typography>
        <Typography variant="caption">hook installed: {String(installed)}</Typography>
        <Typography variant="caption">hook prompt: {deferredPrompt ? "yes" : "no"}</Typography>
      </Stack>
    </Alert>
  );
}
