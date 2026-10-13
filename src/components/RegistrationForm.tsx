import React, { useState } from "react";
import type {
  ProvisioningResult,
  ProvisioningSuccessResult,
} from "@/types/provisioning";

interface FormState {
  tenant_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormState>({
    tenant_name: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ProvisioningSuccessResult | null>(null);

  const posLoginUrl =
    (typeof window !== "undefined" && (window as any).__ENV__?.VITE_APEIRON_POS_LOGIN_URL) ||
    "http://localhost:8000/login";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validation
    if (!formData.tenant_name.trim()) {
      setErrorMessage("Nama bisnis/usaha wajib diisi.");
      return;
    }
    if (!formData.owner_name.trim()) {
      setErrorMessage("Nama lengkap pemilik wajib diisi.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.owner_email.trim() || !emailRegex.test(formData.owner_email.trim())) {
      setErrorMessage("Format email tidak valid.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
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
      } else {
        setErrorMessage(json.message || "Gagal melakukan registrasi.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Terjadi kesalahan saat menghubungi server. Pastikan jaringan terhubung."
      );
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

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border border-[#2E2D29] bg-[#1B1A18]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-md transition-all text-[#E9E8E3]">
      {successResult ? (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shadow-sm">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#F7F6F2]">
              Registrasi Berhasil!
            </h3>
            <p className="mt-2 text-sm text-[#A9A79E]">
              Tenant bisnis Anda telah siap diprovisioning di Apeiron POS.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2E2D29] bg-[#141413] p-5 text-left text-sm space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-[#2E2D29]">
              <span className="text-[#8F8D85] font-medium">Bisnis</span>
              <span className="font-semibold text-[#F7F6F2]">{formData.tenant_name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#2E2D29]">
              <span className="text-[#8F8D85] font-medium">Pemilik</span>
              <span className="font-semibold text-[#F7F6F2]">{formData.owner_name}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#2E2D29]">
              <span className="text-[#8F8D85] font-medium">Email</span>
              <span className="font-semibold text-[#F7F6F2]">{formData.owner_email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8F8D85] font-medium">Tenant ID</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#2E2D29] text-[#E9E8E3]">
                #{successResult.tenant_id}
              </span>
            </div>
          </div>

          {successResult.onboarding.activation_url ? (
            <div className="rounded-2xl border border-amber-900/60 bg-amber-950/40 p-4 text-left text-xs text-amber-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Mode Lokal: Tautan Aktivasi Langsung Tersedia
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                Email simulasi telah tercatat di Outbox. Anda dapat langsung mengaktifkan akun dan menetapkan password sekarang:
              </p>
              <a
                href={successResult.onboarding.activation_url}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-3 text-sm shadow-sm transition active:scale-[0.99]"
              >
                Lanjutkan ke Aktivasi & Set Password ➜
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-900/60 bg-blue-950/40 p-4 text-left text-xs text-blue-200">
              <p className="font-semibold text-blue-300 mb-1">Cek Email Anda</p>
              <p>
                Tautan aktivasi akun Owner telah dikirim ke{" "}
                <span className="font-medium text-white">{successResult.onboarding.email_sent_to}</span>.
                Buka email tersebut untuk mengatur kata sandi Anda.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={posLoginUrl}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#F7F6F2] text-[#141413] px-5 py-3 text-sm font-semibold shadow-sm hover:bg-white transition active:scale-[0.99]"
            >
              Buka Halaman Login POS
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-xl border border-[#2E2D29] bg-[#201F1D] px-5 py-3 text-sm font-semibold text-[#E9E8E3] hover:bg-[#2A2926] transition"
            >
              Daftar Bisnis Lain
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="text-center pb-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#A9A79E] bg-[#2E2D29]/70 rounded-full mb-2">
              Mulai Uji Coba Gratis
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F6F2]">
              Daftarkan Bisnis Anda
            </h3>
            <p className="mt-1.5 text-sm text-[#A9A79E]">
              Lengkapi formulir berikut untuk memulai onboarding Apeiron POS.
            </p>
          </div>

          {errorMessage && (
            <div
              className="rounded-2xl border border-rose-900/60 bg-rose-950/50 p-4 text-sm text-rose-300 flex items-start gap-3 animate-in fade-in"
              role="alert"
            >
              <svg
                className="h-5 w-5 shrink-0 text-rose-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold text-rose-200">Pendaftaran Gagal</p>
                <p className="mt-0.5 text-xs text-rose-300">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="reg-tenant" className="block text-xs font-semibold uppercase tracking-wider text-[#A9A79E] mb-1.5">
                Nama Bisnis / Brand <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-tenant"
                name="tenant_name"
                type="text"
                required
                value={formData.tenant_name}
                onChange={handleChange}
                placeholder="Contoh: Kopi Ruang Teduh"
                className="w-full rounded-xl border border-[#2E2D29] bg-[#141413] px-4 py-3 text-sm text-[#F7F6F2] placeholder-[#6B6A66] focus:bg-[#1C1B19] focus:border-[#E9E8E3] focus:outline-none focus:ring-2 focus:ring-[#E9E8E3]/15 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-owner" className="block text-xs font-semibold uppercase tracking-wider text-[#A9A79E] mb-1.5">
                Nama Lengkap Pemilik <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-owner"
                name="owner_name"
                type="text"
                required
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-xl border border-[#2E2D29] bg-[#141413] px-4 py-3 text-sm text-[#F7F6F2] placeholder-[#6B6A66] focus:bg-[#1C1B19] focus:border-[#E9E8E3] focus:outline-none focus:ring-2 focus:ring-[#E9E8E3]/15 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-[#A9A79E] mb-1.5">
                Email Bisnis (Login) <span className="text-rose-400">*</span>
              </label>
              <input
                id="reg-email"
                name="owner_email"
                type="email"
                required
                value={formData.owner_email}
                onChange={handleChange}
                placeholder="budi@kopiruangteduh.com"
                className="w-full rounded-xl border border-[#2E2D29] bg-[#141413] px-4 py-3 text-sm text-[#F7F6F2] placeholder-[#6B6A66] focus:bg-[#1C1B19] focus:border-[#E9E8E3] focus:outline-none focus:ring-2 focus:ring-[#E9E8E3]/15 transition"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold uppercase tracking-wider text-[#A9A79E] mb-1.5">
                Nomor WhatsApp / Telepon <span className="text-[#6B6A66] font-normal">(Opsional)</span>
              </label>
              <input
                id="reg-phone"
                name="owner_phone"
                type="tel"
                value={formData.owner_phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full rounded-xl border border-[#2E2D29] bg-[#141413] px-4 py-3 text-sm text-[#F7F6F2] placeholder-[#6B6A66] focus:bg-[#1C1B19] focus:border-[#E9E8E3] focus:outline-none focus:ring-2 focus:ring-[#E9E8E3]/15 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F7F6F2] text-[#141413] px-5 py-3.5 text-sm font-semibold shadow-md hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#141413]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Mendaftarkan Bisnis...</span>
                </>
              ) : (
                <span>Daftar Sekarang & Mulai Onboarding ➜</span>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-[#A9A79E] pt-1">
            Sudah memiliki akun?{" "}
            <a href={posLoginUrl} className="font-semibold text-[#F7F6F2] hover:text-white underline">
              Masuk ke Apeiron POS
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
