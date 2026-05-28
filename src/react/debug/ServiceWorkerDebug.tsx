"use client";

import React, { useEffect, useState } from "react";
import { Alert, Typography } from "@mui/material";

export default function ServiceWorkerDebug() {
  const [state, setState] = useState<string>("checking");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) {
        setState("not registered");
        return;
      }
      setState(
        `registered (active: ${reg.active?.scriptURL ?? "none"}, waiting: ${reg.waiting?.scriptURL ?? "none"})`,
      );
    });
  }, []);

  return (
    <Alert severity="info" sx={{ m: 2 }}>
      <Typography variant="caption">Service worker: {state}</Typography>
    </Alert>
  );
}
