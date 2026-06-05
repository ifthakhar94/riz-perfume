import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ComingSoon } from "./coming-soon";

describe("ComingSoon", () => {
  it("renders a top-level heading", () => {
    render(<ComingSoon variant="store" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("shows the brand and a launching message", () => {
    render(<ComingSoon variant="store" />);
    // "Riz Perfume" appears in both the eyebrow and the footer.
    expect(screen.getAllByText(/riz perfume/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/launching soon/i)).toBeInTheDocument();
  });

  it("uses dashboard-specific copy for the admin variant", () => {
    render(<ComingSoon variant="dashboard" />);
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });
});
