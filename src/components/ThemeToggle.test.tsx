
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("displays Dark Mode when dark mode is disabled", () => {
    render(
      <ThemeToggle isDarkMode={false} onToggle={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: /dark mode/i })
    ).toBeInTheDocument();
  });

  it("displays Light Mode when dark mode is enabled", () => {
    render(
      <ThemeToggle isDarkMode={true} onToggle={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: /light mode/i })
    ).toBeInTheDocument();
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <ThemeToggle isDarkMode={false} onToggle={onToggle} />
    );

    await user.click(
      screen.getByRole("button", { name: /dark mode/i })
    );

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("sets aria-pressed to match the current theme", () => {
    render(
      <ThemeToggle isDarkMode={true} onToggle={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: /light mode/i })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
