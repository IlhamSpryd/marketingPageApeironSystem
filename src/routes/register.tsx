import { createFileRoute, Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { RegistrationForm } from "@/components/RegistrationForm";
import "@/marketing/marketing.css";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun Bisnis — Apeiron System" },
      {
        name: "description",
        content:
          "Daftarkan bisnis F&B Anda di Apeiron POS. Platform operasional terpadu untuk kasir, dapur, inventaris, dan multi-cabang.",
      },
      { property: "og:title", content: "Daftar Akun Bisnis — Apeiron System" },
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
    <div className="min-h-screen bg-[#000000] text-[#E4E4E7] flex flex-col justify-between selection:bg-white/20 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-indigo-500/15 via-sky-500/8 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-t from-indigo-600/10 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/[0.08] bg-black/75 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Kembali ke Beranda Apeiron"
          >
            <span className="font-semibold text-base sm:text-lg tracking-tight text-[#F7F6F2]">
              Apeiron{" "}
              <small className="text-xs uppercase tracking-wider text-[#A9A79E] font-normal ml-1">
                POS
              </small>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="hidden sm:inline text-[#A9A79E]">Sudah punya akun?</span>
            <a
              href={posLoginUrl}
              className="inline-flex items-center justify-center font-medium px-4 py-2 rounded-full border border-[#2E2D29] bg-[#1B1A18] text-[#F7F6F2] hover:bg-[#201F1D] hover:border-[#8F8D85]/40 transition active:scale-[0.98]"
            >
              Log in POS ➜
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A9A79E] hover:text-[#F7F6F2] transition group"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 sm:mb-10 space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#A9A79E]">
              Apeiron System · Onboarding F&amp;B
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-[#F7F6F2]">
              Mulai dengan Apeiron POS
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#A9A79E] leading-relaxed">
              Daftarkan brand usaha Anda. Sistem terintegrasi untuk kasir, dapur, inventaris bahan
              baku resep, dan manajemen multi-cabang.
            </p>
          </div>

          {/* Registration Form */}
          <RegistrationForm />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-6 px-4 sm:px-6 text-center text-xs text-[#A1A1AA]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Apeiron System. Operating system for growing F&amp;B businesses.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-[#F7F6F2] transition">
              Beranda
            </Link>
            <a href={posLoginUrl} className="hover:text-[#F7F6F2] transition">
              Login POS
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
