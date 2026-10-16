import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { RegistrationForm } from "@/components/RegistrationForm";
import { ArrowLeft, ExternalLink, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun Bisnis — Apeiron POS" },
      {
        name: "description",
        content:
          "Daftarkan bisnis F&B Anda di Apeiron POS. Platform operasional terpadu untuk kasir, dapur, inventaris, dan multi-cabang.",
      },
      { property: "og:title", content: "Daftar Akun Bisnis — Apeiron POS" },
      {
        property: "og:description",
        content:
          "Daftarkan bisnis F&B Anda di Apeiron POS. Platform operasional terpadu untuk kasir, dapur, inventaris, dan multi-cabang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const posLoginUrl =
    (typeof process !== "undefined" && process.env?.["VITE_APEIRON_POS_LOGIN_URL"]) ||
    "http://localhost:8000/login";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F7F5] text-[#37352F] font-sans antialiased selection:bg-[#37352F] selection:text-white">
      {/* ────────────────────────────────────────────────────────────
          HEADER: CLEAN, MINIMALIST TOP BAR
          ──────────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-[#E9E9E7]/80 bg-[#F7F7F5]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-85 group"
            aria-label="Kembali ke Beranda Apeiron"
          >
            <img
              src={logoUrl}
              alt="Apeiron System Logo"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="font-brand font-bold text-base sm:text-lg tracking-tight text-[#37352F] leading-tight">
                Apeiron System
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#787774]">
                Point of Sales
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="hidden sm:inline text-[#787774]">Sudah punya akun?</span>
            <a
              href={posLoginUrl}
              className="inline-flex items-center gap-1.5 font-medium px-4 py-2 rounded-xl border border-[#E9E9E7] bg-white text-[#37352F] hover:bg-[#F1F1EF] hover:border-[#D8D8D5] text-xs sm:text-sm transition-all duration-200 shadow-2xs active:scale-[0.98]"
            >
              <span>Masuk POS</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────
          MAIN: FOCUSED, SEAMLESS ONBOARDING WORKSPACE
          ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg mx-auto">
          {/* Back link & progress indicator */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#787774] hover:text-[#37352F] transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Kembali ke Beranda</span>
            </Link>

            <span className="text-xs font-medium text-[#9B9A97]">
              Langkah 1 dari 2
            </span>
          </div>

          {/* Heading block */}
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#55544E] border border-[#E9E9E7] mb-3 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>14 Hari Uji Coba Gratis · Tanpa Kartu Kredit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#37352F]">
              Daftarkan <span className="font-brand italic font-normal">Bisnis Anda</span>
            </h1>
            <p className="mt-2 text-sm text-[#787774] leading-relaxed">
              Mulai ruang kerja Apeiron POS. Akun pemilik (Owner) dan tenant workspace akan langsung disiapkan secara otomatis.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="rounded-2xl border border-[#E9E9E7] bg-white p-6 sm:p-9 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.02)]">
            <RegistrationForm />
          </div>

          {/* Reassurance Micro-Strip */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left text-xs text-[#787774]">
            <div className="flex items-center sm:items-start gap-2.5 justify-center sm:justify-start p-2">
              <ShieldCheck className="w-4 h-4 text-[#55544E] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#37352F]">Aman &amp; Terisolasi</p>
                <p className="text-[11px] text-[#9B9A97]">Data terenkripsi per tenant</p>
              </div>
            </div>
            <div className="flex items-center sm:items-start gap-2.5 justify-center sm:justify-start p-2">
              <Zap className="w-4 h-4 text-[#55544E] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#37352F]">Aktivasi Cepat</p>
                <p className="text-[11px] text-[#9B9A97]">Siap pakai dalam 2 menit</p>
              </div>
            </div>
            <div className="flex items-center sm:items-start gap-2.5 justify-center sm:justify-start p-2">
              <HelpCircle className="w-4 h-4 text-[#55544E] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#37352F]">Dukungan Penuh</p>
                <p className="text-[11px] text-[#9B9A97]">Panduan setup &amp; migrasi</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────
          FOOTER: MINIMALIST & PROFESSIONAL
          ──────────────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-[#E9E9E7]/80 bg-[#F7F7F5] py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#787774]">
          <p>© 2026 Apeiron System. Operating System for F&amp;B businesses.</p>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-[#37352F] transition">
              Beranda
            </Link>
            <a
              href={posLoginUrl}
              className="hover:text-[#37352F] transition inline-flex items-center gap-1"
            >
              <span>Login POS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
