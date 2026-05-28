"use client";

import React, { useState } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  type IconButtonProps,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  InstallMobile as InstallIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useWebShare, type WebSharePayload } from "../hooks/useWebShare.js";
import { usePwaInstall } from "./PwaInstallProvider.js";

export type ShareMenuProps = {
  payload: WebSharePayload;
  triggerProps?: IconButtonProps;
  showInstall?: boolean;
};

export default function ShareMenu({
  payload,
  triggerProps,
  showInstall = true,
}: ShareMenuProps) {
  const tPWA = useTranslations("PWA");
  const { supported, clipboardSupported, share, copyLink } = useWebShare(payload);
  const { canShow, openDialog } = usePwaInstall();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  const closeMenu = () => setAnchorEl(null);

  const handleShare = async () => {
    closeMenu();
    try {
      if (supported) {
        await share(payload);
        return;
      }
      if (clipboardSupported && payload.url) {
        await copyLink(payload.url);
        setMessage(tPWA("linkCopied"));
        return;
      }
      setMessage(tPWA("shareUnsupported"));
    } catch {
      setMessage(tPWA("shareFailed"));
    }
  };

  const handleCopy = async () => {
    closeMenu();
    try {
      if (!payload.url) return;
      await copyLink(payload.url);
      setMessage(tPWA("linkCopied"));
    } catch {
      setMessage(tPWA("shareFailed"));
    }
  };

  const handleInstall = () => {
    closeMenu();
    openDialog();
  };

  return (
    <>
      <Tooltip title={tPWA("shareMenu")} arrow>
        <IconButton
          aria-label={tPWA("shareMenu")}
          data-testid="pwa-share-menu-trigger"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          {...triggerProps}
        >
          <MoreIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
        <MenuItem onClick={handleShare} data-testid="pwa-share-menu-share">
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{tPWA("share")}</ListItemText>
        </MenuItem>
        {payload.url && (
          <MenuItem onClick={handleCopy} data-testid="pwa-share-menu-copy">
            <ListItemIcon>
              <CopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{tPWA("copyLink")}</ListItemText>
          </MenuItem>
        )}
        {showInstall && canShow && (
          <MenuItem onClick={handleInstall} data-testid="pwa-share-menu-install">
            <ListItemIcon>
              <InstallIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{tPWA("installApp")}</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage(null)}
        message={message}
      />
    </>
  );
}
