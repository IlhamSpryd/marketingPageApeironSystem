import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ProvisioningResult, ProvisioningSuccessResult } from "@/types/provisioning";

interface FormState {
  tenant_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

interface RegistrationFormProps {
  posLoginUrl?: string;
}

export function RegistrationForm({
  posLoginUrl = "http://localhost:8000/login",
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormState>({
    tenant_name: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [successResult, setSuccessResult] = useState<ProvisioningSuccessResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
    if (isPendingNotice) setIsPendingNotice(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsPendingNotice(false);

    // Client-side quick validation
    if (!formData.tenant_name.trim()) {
      setErrorMessage("Business or brand name is required.");
      return;
    }
    if (!formData.owner_name.trim()) {
      setErrorMessage("Owner full name is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.owner_email.trim() || !emailRegex.test(formData.owner_email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          tenant_name: formData.tenant_name.trim(),
          owner_name: formData.owner_name.trim(),
          owner_email: formData.owner_email.trim(),
          owner_phone: formData.owner_phone.trim() || undefined,
        }),
      });

      const json = (await res.json()) as ProvisioningResult;
      if (json.success) {
        setSuccessResult(json as ProvisioningSuccessResult);
      } else if ((json as { error?: string }).error === "provisioning_pending") {
        setIsPendingNotice(true);
        setErrorMessage(json.message || null);
      } else {
        setErrorMessage(json.message || "Registration could not be completed.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while connecting to the server. Please verify your connection.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tenant_name: "",
      owner_name: "",
      owner_email: "",
      owner_phone: "",
    });
    setSuccessResult(null);
    setErrorMessage(null);
  };

  if (successResult) {
    return (
      <div className="w-full text-zinc-950 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-zinc-950">
              Registration Successful
            </h2>
            <p className="text-xs text-zinc-500">Your workspace has been initialized in the system.</p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="divide-y divide-zinc-100 border-t border-b border-zinc-100 text-xs py-1">
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-zinc-500">Business</span>
            <span className="font-medium text-zinc-900">{formData.tenant_name}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-zinc-500">Owner</span>
            <span className="font-medium text-zinc-900">{formData.owner_name}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-zinc-500">Email</span>
            <span className="font-medium text-zinc-900">{formData.owner_email}</span>
          </div>
          <div className="py-2.5 flex justify-between items-center">
            <span className="text-zinc-500">Tenant ID</span>
            <span className="font-sans font-medium text-zinc-700">#{successResult.tenant_id}</span>
          </div>
        </div>

        {/* Local magic link direct activation or email notice */}
        {successResult.onboarding.activation_url ? (
          <div className="p-4 rounded-md border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-2">
            <p className="font-medium">Development Mode: Activation Link Ready</p>
            <p className="text-amber-800 leading-relaxed">
              You can activate your account and configure your master password immediately:
            </p>
            <a
              href={successResult.onboarding.activation_url}
              style={{ backgroundColor: "#141413", color: "#ffffff" }}
              className="btn-primary-black inline-flex w-full items-center justify-center gap-2 rounded-md font-medium px-4 h-10 text-xs transition active:scale-[0.98]"
            >
              Activate Account &amp; Set Password ➜
            </a>
          </div>
        ) : (
          <div className="p-4 rounded-md border border-zinc-200 bg-zinc-50 text-xs text-zinc-600 space-y-1">
            <p className="font-medium text-zinc-900">Check Your Email</p>
            <p className="leading-relaxed">
              An activation link has been sent to{" "}
              <strong className="text-zinc-900 font-semibold">
                {successResult.onboarding.email_sent_to}
              </strong>
              . Follow the link to complete your master password configuration.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <a
            href={posLoginUrl}
            style={{ backgroundColor: "#141413", color: "#ffffff" }}
            className="btn-primary-black flex-1 inline-flex items-center justify-center h-10 rounded-md text-xs font-medium transition active:scale-[0.98]"
          >
            Open POS Sign In
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-zinc-300 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition active:scale-[0.98] cursor-pointer"
          >
            Register Another Business
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-zinc-950">
      {/* Heading Block */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-950">Register your business</h1>
        <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
          Complete the details below to create your Apeiron POS operational workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error Notice */}
        {errorMessage && !isPendingNotice && (
          <div
            className="mb-4 pb-3 border-b border-rose-200 text-xs text-rose-600 leading-relaxed"
            role="alert"
          >
            <span className="font-semibold block mb-0.5">Registration Incomplete</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Pending Notice */}
        {isPendingNotice && errorMessage && (
          <div
            className="mb-4 pb-3 border-b border-blue-200 text-xs text-blue-700 leading-relaxed"
            role="status"
            aria-live="polite"
          >
            <span className="font-semibold block mb-0.5">Registration In Progress</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tenant Name */}
        <div>
          <label
            htmlFor="reg-tenant"
            className="block text-[13px] font-medium text-zinc-800 mb-1.5"
          >
            Business or brand name
          </label>
          <input
            id="reg-tenant"
            name="tenant_name"
            type="text"
            required
            value={formData.tenant_name}
            onChange={handleChange}
            placeholder="e.g., The Roastery Cafe"
            className="field-input w-full h-10 px-3 rounded-md border border-zinc-300 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
          />
        </div>

        {/* Owner Name */}
        <div>
          <label htmlFor="reg-owner" className="block text-[13px] font-medium text-zinc-800 mb-1.5">
            Owner full name
          </label>
          <input
            id="reg-owner"
            name="owner_name"
            type="text"
            required
            value={formData.owner_name}
            onChange={handleChange}
            placeholder="e.g., Alex Morgan"
            className="field-input w-full h-10 px-3 rounded-md border border-zinc-300 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
          />
        </div>

        {/* Owner Email */}
        <div>
          <label htmlFor="reg-email" className="block text-[13px] font-medium text-zinc-800 mb-1.5">
            Business email (sign in)
          </label>
          <input
            id="reg-email"
            name="owner_email"
            type="email"
            required
            value={formData.owner_email}
            onChange={handleChange}
            placeholder="name@company.com"
            className="field-input w-full h-10 px-3 rounded-md border border-zinc-300 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
          />
          <p className="mt-1 text-xs text-zinc-400">
            Your master password setup link will be sent to this email address.
          </p>
        </div>

        {/* Owner Phone */}
        <div>
          <label htmlFor="reg-phone" className="block text-[13px] font-medium text-zinc-800 mb-1.5">
            Phone or WhatsApp{" "}
            <span className="text-zinc-400 font-normal text-xs">(Optional)</span>
          </label>
          <input
            id="reg-phone"
            name="owner_phone"
            type="tel"
            value={formData.owner_phone}
            onChange={handleChange}
            placeholder="+62 812 3456 7890"
            className="field-input w-full h-10 px-3 rounded-md border border-zinc-300 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all shadow-2xs"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: "#141413", color: "#ffffff" }}
            className="btn-primary-black w-full h-10 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-white text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Registering business...</span>
              </>
            ) : (
              <span>Register business</span>
            )}
          </button>
        </div>

        {/* Link to Login */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-xs text-zinc-500 leading-relaxed text-center sm:text-left">
          Already have a business account?{" "}
          <a
            href={posLoginUrl}
            className="text-zinc-950 font-medium hover:underline underline-offset-4 ml-1"
          >
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}
