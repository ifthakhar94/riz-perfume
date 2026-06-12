import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HeroSlide } from "./hero-slides";
import { HeroSlider } from "./hero-slider";

const slide = (id: string, heading: string): HeroSlide => ({
  id,
  imageSrc: `/hero/${id}.png`,
  imageAlt: heading,
  heading,
  copy: "Copy",
  ctaLabel: "See Collection",
  ctaHref: "/shop",
});

describe("HeroSlider", () => {
  it("renders the default slide content with a CTA", () => {
    render(<HeroSlider />);
    expect(screen.getByRole("heading", { name: /riz perfume special/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /see collection/i });
    expect(cta).toHaveAttribute("href", "/shop");
  });

  it("hides arrows when there is a single slide", () => {
    render(<HeroSlider />);
    expect(screen.queryByRole("button", { name: /next slide/i })).not.toBeInTheDocument();
  });

  it("navigates between slides with arrows, looping at the ends", () => {
    render(<HeroSlider slides={[slide("a", "Slide A"), slide("b", "Slide B")]} />);

    const slideOf = (name: RegExp) =>
      screen.getByRole("heading", { name, hidden: true }).closest("article");

    expect(slideOf(/slide a/i)).toHaveAttribute("aria-hidden", "false");

    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(slideOf(/slide b/i)).toHaveAttribute("aria-hidden", "false");
    expect(slideOf(/slide a/i)).toHaveAttribute("aria-hidden", "true");

    // Looping: next from the last slide returns to the first.
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(slideOf(/slide a/i)).toHaveAttribute("aria-hidden", "false");

    // And previous from the first wraps to the last.
    fireEvent.click(screen.getByRole("button", { name: /previous slide/i }));
    expect(slideOf(/slide b/i)).toHaveAttribute("aria-hidden", "false");
  });

  it("renders nothing without slides", () => {
    const { container } = render(<HeroSlider slides={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
