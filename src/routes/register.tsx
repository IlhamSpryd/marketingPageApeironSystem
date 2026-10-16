import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun Bisnis — Apeiron POS" },
      {
        name: "description",
        content:
          "Daftarkan bisnis F&B Anda di Apeiron POS. Platform operasional terpadu untuk kasir, dapur, inventaris, dan multi-cabang.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const posLoginUrl =
    (typeof process !== "undefined" && process.env?.["VITE_APEIRON_POS_LOGIN_URL"]) ||
    "http://localhost:8000/login";

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 w-full bg-white overflow-x-hidden font-sans antialiased text-zinc-950 selection:bg-zinc-900 selection:text-white">
      {/* KIRI: KONTEN FORM REGISTRASI */}
      <div className="md:col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 w-full relative bg-white min-h-screen">
        <div>
          {/* Brand Wordmark & Logo */}
          <div className="mb-6 sm:mb-8 w-full max-w-sm mx-auto md:mx-0" style={{ maxWidth: 384 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 select-none transition-opacity hover:opacity-85"
            >
              <img
                src={logoUrl}
                alt="Apeiron System Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 font-brand">
                Apeiron System
              </span>
            </Link>
          </div>
        </div>

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
              Beranda
            </Link>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-zinc-600 transition-colors">
              Privacy
            </a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-zinc-600 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>

      {/* KANAN: EDITORIAL BRAND PANEL */}
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
          Pengaturan Workspace
        </div>

        <div className="relative z-10 my-auto max-w-xs space-y-8">
          <div className="space-y-2">
            <p className="text-lg font-normal tracking-tight text-zinc-100 leading-snug">
              Point of sale, ledger inventaris, dan rekonsiliasi kasir untuk bisnis F&amp;B modern.
            </p>
          </div>

          <div className="space-y-6 border-l border-zinc-800 pl-5">
            <div>
              <div className="text-xs text-white font-medium">1. Pendaftaran Bisnis</div>
              <div className="text-xs text-zinc-400 mt-0.5">
                Daftarkan nama usaha dan identitas pemilik untuk menginisialisasi tenant.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500">2. Aktivasi &amp; Kata Sandi</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Verifikasi akun dan tentukan kata sandi master owner melalui tautan email.
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500">3. Cabang &amp; Operasional</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Konfigurasi gerai pertama, meja, produk, dan mulai mencatat penjualan.
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
