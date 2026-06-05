import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// With `globals: false`, Testing Library's auto-cleanup is not registered,
// so we unmount rendered trees after each test ourselves to avoid leakage.
afterEach(() => {
  cleanup();
});
