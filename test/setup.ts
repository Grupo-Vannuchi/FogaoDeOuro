// Registers @testing-library/jest-dom matchers (e.g. toBeInTheDocument) on
// Vitest's expect, and pulls in their type augmentation for the typechecker.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount the rendered tree after each test (we don't use Vitest globals, so
// RTL's automatic afterEach cleanup isn't auto-registered).
afterEach(() => cleanup());

// jsdom doesn't implement scrollIntoView; stub it so components that autoscroll
// don't throw during tests.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
