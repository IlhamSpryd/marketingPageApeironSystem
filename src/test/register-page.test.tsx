import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RegisterPage } from "@/routes/register";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("RegisterPage Typography & Chatbot Absence", () => {
  it("renders RegisterPage using Jakarta Sans (font-sans) across all text elements", () => {
    const { container } = render(<RegisterPage />);

    // Root container must have font-sans
    expect(container.firstChild).toHaveClass("font-sans");

    // Brand wordmark and logo above the form have been removed
    expect(screen.queryByText("Apeiron System")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Apeiron System Logo")).not.toBeInTheDocument();

    // Form heading and inputs must be present
    expect(screen.getByRole("heading", { name: /Daftarkan Bisnis Anda/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Bisnis/i)).toBeInTheDocument();
  });

  it("does not render the Apeiron Chat Widget on the register page", () => {
    render(<RegisterPage />);

    expect(screen.queryByRole("button", { name: /Buka AI/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /Apeiron AI/i })).not.toBeInTheDocument();
  });
});
