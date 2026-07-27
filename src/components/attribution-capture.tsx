"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Records the visit's first-touch attribution once, on mount. Renders nothing.
 * Mounted in the public layouts so the first public page a visitor hits is the
 * one captured. */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
