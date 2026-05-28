"use client";

import React, { useEffect, useState } from "react";
import { Button, IconButton, Tooltip, type SxProps, type Theme } from "@mui/material";
import { InstallMobile as InstallIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { usePwaInstall } from "./PwaInstallProvider.js";

const wiggleSx = {
  animation: "pwaInstallWiggle 0.65s ease-in-out 3",
  "@keyframes pwaInstallWiggle": {
    "0%, 100%": { transform: "rotate(0deg)" },
    "20%": { transform: "rotate(-12deg)" },
    "40%": { transform: "rotate(12deg)" },
    "60%": { transform: "rotate(-8deg)" },
    "80%": { transform: "rotate(8deg)" },
  },
};

export type PWAInstallButtonProps = {
  variant?: "icon" | "hero";
  sx?: SxProps<Theme>;
  iconSx?: SxProps<Theme>;
  heroSx?: SxProps<Theme>;
};

export default function PWAInstallButton({
  variant = "icon",
  sx,
  iconSx,
  heroSx,
}: PWAInstallButtonProps) {
  const tPWA = useTranslations("PWA");
  const { canShow, openDialog } = usePwaInstall();
  const [wiggling, setWiggling] = useState(true);

  useEffect(() => {
    if (!canShow) return;
    setWiggling(true);
    const stopWiggle = window.setTimeout(() => setWiggling(false), 7200);
    return () => window.clearTimeout(stopWiggle);
  }, [canShow]);

  if (!canShow) return null;

  const handleClick = () => {
    setWiggling(false);
    openDialog();
  };

  if (variant === "hero") {
    return (
      <Button
        variant="outlined"
        size="large"
        startIcon={<InstallIcon />}
        onClick={handleClick}
        data-testid="pwa-install-hero"
        aria-label={tPWA("installApp")}
        sx={[
          {
            px: 3,
            py: 1.5,
            fontSize: "1.05rem",
            fontWeight: 600,
            textTransform: "none",
          },
          wiggling ? wiggleSx : {},
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ...(Array.isArray(heroSx) ? heroSx : heroSx ? [heroSx] : []),
        ]}
      >
        {tPWA("installApp")}
      </Button>
    );
  }

  return (
    <Tooltip title={tPWA("installApp")} arrow>
      <IconButton
        onClick={handleClick}
        aria-label={tPWA("installApp")}
        data-testid="pwa-install-button"
        size="small"
        sx={[
          {
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "action.hover" },
          },
          wiggling ? wiggleSx : {},
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ...(Array.isArray(iconSx) ? iconSx : iconSx ? [iconSx] : []),
        ]}
      >
        <InstallIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
