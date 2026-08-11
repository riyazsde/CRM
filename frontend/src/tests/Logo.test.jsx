import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Logo from "../components/Logo";

describe("Logo", () => {
  it("renders the RiyazCRM brand", () => {
    render(<Logo />);
    expect(screen.getByText("RiyazCRM")).toBeInTheDocument();
  });
});
