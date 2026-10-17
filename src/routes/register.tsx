import { createFileRoute, Link } from "@tanstack/react-router";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Business — Apeiron POS" },
      {
        name: "description",
        content:
          "Register your food and beverage business on Apeiron POS. Unified operations for point of sale, kitchen display, inventory, and multi-branch management.",
      },
    ],
  }),
  component: RegisterPage,
});

export function RegisterPage() {
  const posLoginUrl =
    (typeof process !== "undefined" && process.env?.["VITE_APEIRON_POS_LOGIN_URL"]) ||
    "http://localhost:8000/login";

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 w-full bg-white overflow-x-hidden font-sans antialiased text-zinc-950 selection:bg-zinc-900 selection:text-white">
      {/* LEFT: REGISTRATION FORM CONTENT */}
      <div className="md:col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 w-full relative bg-white min-h-screen">
        {/* Form Mount strictly clamped to max-w-sm / 384px */}
        <div className="my-auto py-4 sm:py-6 w-full max-w-sm mx-auto" style={{ maxWidth: 384 }}>
          <RegistrationForm posLoginUrl={posLoginUrl} />
        </div>

        {/* Footer Bar */}
        <div
          className="w-full max-w-sm mx-auto md:max-w-none flex items-center justify-between text-xs text-zinc-400 pt-8 mt-auto border-t border-zinc-100"
          style={{ maxWidth: 384 }}
        >
          <span>© {new Date().getFullYear()} Apeiron Systems</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-zinc-600 transition-colors">
              Home
            </Link>
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="hover:text-zinc-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="hover:text-zinc-600 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT: EDITORIAL BRAND PANEL */}
      <div
        className="hidden md:flex md:col-span-1 lg:col-span-5 editorial-surface text-white p-8 sm:p-10 lg:p-12 xl:p-14 flex-col justify-between select-none relative overflow-hidden bg-[#0A0A0B] min-h-screen"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: "url('/assets/images/auth/panelKananLogin.avif')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 text-xs text-zinc-400 font-medium tracking-wide">
          Workspace Setup
        </div>

        <div className="relative z-10 my-auto max-w-xs space-y-8">
          <div className="space-y-2">
            <p className="text-lg font-normal tracking-tight text-zinc-100 leading-snug">
              Point of sale, inventory ledger, and cashier reconciliation built for modern hospitality.
            </p>
          </div>

          <div className="space-y-6 border-l border-zinc-800 pl-5">
            <div>
              <div className="text-xs text-white font-medium">1. Business Registration</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Register your business name and owner details to initialize your workspace.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500">2. Activation &amp; Credentials</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Verify your account and configure your master password via email activation.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500">3. Branch &amp; Operations</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Configure your primary branch, tables, products, and begin recording sales.
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 pt-6 border-t border-zinc-900">
          <span>Enterprise Point of Sale</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
