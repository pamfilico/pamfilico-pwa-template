"use client";

import React, { useState } from "react";
import { Button, Snackbar, type ButtonProps } from "@mui/material";
import { Share as ShareIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useWebShare, type WebSharePayload } from "../hooks/useWebShare.js";

export type PwaShareButtonProps = Omit<ButtonProps, "onClick"> & {
  payload: WebSharePayload;
  onCopied?: () => void;
  onShared?: () => void;
};

export default function PwaShareButton({
  payload,
  onCopied,
  onShared,
  children,
  startIcon = <ShareIcon />,
  ...buttonProps
}: PwaShareButtonProps) {
  const tPWA = useTranslations("PWA");
  const { supported, clipboardSupported, share, copyLink } = useWebShare(payload);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      if (supported) {
        await share(payload);
        onShared?.();
        return;
      }
      if (clipboardSupported && payload.url) {
        await copyLink(payload.url);
        setMessage(tPWA("linkCopied"));
        onCopied?.();
        return;
      }
      setMessage(tPWA("shareUnsupported"));
    } catch {
      setMessage(tPWA("shareFailed"));
    }
  };

  return (
    <>
      <Button {...buttonProps} startIcon={startIcon} onClick={handleClick}>
        {children ?? tPWA("share")}
      </Button>
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        message={message}
      />
    </>
  );
}
