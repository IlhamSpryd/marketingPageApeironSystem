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
    expect(screen.getByRole("heading", { name: /Register your business/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business or brand name/i)).toBeInTheDocument();
  });

  it("does not render the Apeiron Chat Widget on the register page", () => {
    render(<RegisterPage />);

    expect(screen.queryByRole("button", { name: /Buka AI/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /Apeiron AI/i })).not.toBeInTheDocument();
  });

  it("renders Phone or WhatsApp as a required field with country code dropdown", () => {
    render(<RegisterPage />);

    // Label must not contain "(Optional)"
    expect(screen.queryByText(/Phone or WhatsApp.*Optional/i)).not.toBeInTheDocument();
    const phoneInput = screen.getByLabelText(/^Phone or WhatsApp$/i);
    expect(phoneInput).toBeInTheDocument();
    expect(phoneInput).toBeRequired();

    // Country calling code dropdown exists and defaults to +62 (Indonesia)
    const countrySelect = screen.getByLabelText(/Country calling code/i) as HTMLSelectElement;
    expect(countrySelect).toBeInTheDocument();
    expect(countrySelect.value).toBe("+62");

    // Contains international dial code options
    expect(screen.getByRole("option", { name: /Indonesia \(\+62\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Malaysia \(\+60\)/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Singapore \(\+65\)/i })).toBeInTheDocument();
  });

  it("renders success state without yellow development mode badge pill and with compact Register Another Business button", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const { RegistrationForm } = await import("@/components/RegistrationForm");

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          message: "Provisioning berhasil.",
          tenant_id: 2,
          owner_user_id: 10,
          store_id: 20,
          onboarding: {
            email_sent_to: "ilhamsepriyadi0@gmail.com",
            activation_url: "http://localhost:8000/onboarding/set-password/sample-token",
            onboarding_token: "sample-token",
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<RegistrationForm posLoginUrl="http://localhost:8000/login" />);

    fireEvent.change(screen.getByLabelText(/Business or brand name/i), {
      target: { value: "Percobaan02" },
    });
    fireEvent.change(screen.getByLabelText(/Owner full name/i), {
      target: { value: "Ilham Sepriyadi" },
    });
    fireEvent.change(screen.getByLabelText(/Business email/i), {
      target: { value: "ilhamsepriyadi0@gmail.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Phone or WhatsApp$/i), {
      target: { value: "85718965973" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register business/i }));

    const successHeading = await screen.findByText("Registration Successful");
    expect(successHeading).toBeInTheDocument();

    // Verify absence of the yellow development mode badge pill and texts
    expect(screen.queryByText(/Development Mode: Activation Link Ready/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/You can activate your account and configure your master password immediately/i)
    ).not.toBeInTheDocument();

    // Verify presence of clean master password setup CTA button
    const activateBtn = screen.getByRole("link", { name: /Set Master Password & Activate Account/i });
    expect(activateBtn).toBeInTheDocument();
    expect(activateBtn).toHaveAttribute("href", "http://localhost:8000/onboarding/set-password/sample-token");

    // Verify absence of premature login and reset buttons
    expect(screen.queryByRole("link", { name: /Open POS Sign In/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Register Another Business/i })).not.toBeInTheDocument();
  });
});
