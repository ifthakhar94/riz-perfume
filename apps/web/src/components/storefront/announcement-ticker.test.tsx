import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnnouncementTicker } from "./announcement-ticker";

const MESSAGE = "Eid Offer 15% discount on all combo";

describe("AnnouncementTicker", () => {
  it("renders a labelled announcement region", () => {
    render(<AnnouncementTicker message={MESSAGE} />);
    expect(screen.getByRole("region", { name: /announcement/i })).toBeInTheDocument();
  });

  it("exposes the message to assistive tech exactly once", () => {
    render(<AnnouncementTicker message={MESSAGE} />);
    const accessibleCopies = screen
      .getAllByText(MESSAGE)
      .filter((el) => !el.closest("[aria-hidden='true']"));
    expect(accessibleCopies).toHaveLength(1);
  });

  it("hides the animated marquee track from assistive tech", () => {
    const { container } = render(<AnnouncementTicker message={MESSAGE} />);
    const track = container.querySelector("[aria-hidden='true']");
    expect(track).not.toBeNull();
    expect(track?.textContent).toContain(MESSAGE);
  });

  it("duplicates the strip so the loop is seamless", () => {
    const { container } = render(<AnnouncementTicker message={MESSAGE} />);
    const track = container.querySelector("[aria-hidden='true']");
    expect(track?.children).toHaveLength(2);
    expect(track?.children.item(0)?.textContent).toBe(track?.children.item(1)?.textContent);
  });
});
