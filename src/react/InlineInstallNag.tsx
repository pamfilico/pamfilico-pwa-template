"use client";

import React, { useEffect, useState } from "react";
import { Alert, Box, Typography, type SxProps, type Theme } from "@mui/material";
import { useTranslations } from "next-intl";
import { detectIOS, isStandaloneMode } from "../lib/pwa-detect.js";

export type InlineInstallNagProps = {
  sx?: SxProps<Theme>;
};

export default function InlineInstallNag({ sx }: InlineInstallNagProps) {
  const tPWA = useTranslations("PWA");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (detectIOS() && !isStandaloneMode()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <Box sx={{ mx: { xs: 2, md: "auto" }, maxWidth: 900, mb: 1, ...sx }}>
      <Alert severity="info" sx={{ alignItems: "center" }}>
        <Typography variant="body2">{tPWA("inlineNag")}</Typography>
      </Alert>
    </Box>
  );
}
