import { useEffect, useState } from "react";
import { isStandaloneMode } from "../lib/pwa-detect.js";

export function useStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneMode());
  }, []);

  return standalone;
}
