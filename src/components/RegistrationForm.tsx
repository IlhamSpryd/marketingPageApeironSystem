import React, { useState } from "react";
import {
  Store,
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { ProvisioningResult, ProvisioningSuccessResult } from "@/types/provisioning";

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
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [successResult, setSuccessResult] = useState<ProvisioningSuccessResult | null>(null);

  const posLoginUrl =
    (typeof window !== "undefined" &&
      (window as unknown as { __ENV__?: { VITE_APEIRON_POS_LOGIN_URL?: string } }).__ENV__
        ?.VITE_APEIRON_POS_LOGIN_URL) ||
    "http://localhost:8000/login";

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
      setErrorMessage("Nama bisnis/brand wajib diisi.");
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
        setErrorMessage(json.message || "Gagal melakukan registrasi.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghubungi server. Pastikan jaringan terhubung.";
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
      <div className="w-full text-[#37352F] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-[#37352F]">
            Registrasi Berhasil!
          </h3>
          <p className="text-sm text-[#787774]">
            Workspace bisnis Anda telah berhasil disiapkan di Apeiron POS.
          </p>
        </div>

        {/* Data Summary */}
        <div className="rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] p-5 text-sm space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-[#E9E9E7]">
            <span className="text-[#787774] font-medium text-xs uppercase tracking-wider">Bisnis / Brand</span>
            <span className="font-semibold text-[#37352F]">{formData.tenant_name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#E9E9E7]">
            <span className="text-[#787774] font-medium text-xs uppercase tracking-wider">Pemilik (Owner)</span>
            <span className="font-semibold text-[#37352F]">{formData.owner_name}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-[#E9E9E7]">
            <span className="text-[#787774] font-medium text-xs uppercase tracking-wider">Email Login</span>
            <span className="font-semibold text-[#37352F]">{formData.owner_email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#787774] font-medium text-xs uppercase tracking-wider">Tenant ID</span>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#E9E9E7] text-[#37352F]">
              #{successResult.tenant_id}
            </span>
          </div>
        </div>

        {/* Local magic link direct activation or email notice */}
        {successResult.onboarding.activation_url ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-amber-900 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Mode Development: Tautan Aktivasi Langsung Tersedia
            </div>
            <p className="text-amber-800 leading-relaxed">
              Email simulasi telah tercatat di Outbox. Anda dapat langsung mengaktifkan akun dan menetapkan kata sandi:
            </p>
            <a
              href={successResult.onboarding.activation_url}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#37352F] hover:bg-[#201F1D] text-white font-semibold px-4 py-3 text-sm shadow-xs transition active:scale-[0.98]"
            >
              Lanjutkan ke Aktivasi &amp; Set Password ➜
            </a>
          </div>
        ) : (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-1">
            <p className="font-semibold text-blue-900 text-sm">Cek Email Masuk Anda</p>
            <p className="text-blue-800 leading-relaxed">
              Tautan aktivasi akun Owner telah dikirimkan ke{" "}
              <strong className="text-blue-950 font-semibold">{successResult.onboarding.email_sent_to}</strong>.
              Buka email tersebut untuk mengonfirmasi akun dan menetapkan kata sandi POS Anda.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={posLoginUrl}
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#37352F] text-white px-5 py-3 text-sm font-semibold shadow-xs hover:bg-[#201F1D] transition active:scale-[0.98]"
          >
            Buka Halaman Login POS
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] px-5 py-3 text-sm font-semibold text-[#37352F] hover:bg-[#EAEAE7] transition active:scale-[0.98] cursor-pointer"
          >
            Daftar Bisnis Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-[#37352F]">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Error Notice */}
        {errorMessage && !isPendingNotice && (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-3 animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Pendaftaran Belum Berhasil</p>
              <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Pending Notice */}
        {isPendingNotice && errorMessage && (
          <div
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex items-start gap-3 animate-in fade-in duration-200"
            role="status"
            aria-live="polite"
          >
            <Clock className="h-5 w-5 shrink-0 text-blue-600 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold text-blue-950">Registrasi Sedang Diproses</p>
              <p className="mt-0.5 text-xs text-blue-800 leading-relaxed">{errorMessage}</p>
              <p className="mt-1.5 text-xs text-blue-700">
                Data Anda sudah kami terima dan tidak akan terdaftar ganda. Silakan coba kembali beberapa saat lagi.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Tenant Name */}
          <div>
            <label
              htmlFor="reg-tenant"
              className="block text-sm font-medium mb-1.5 text-[#37352F]"
            >
              Nama Bisnis / Brand <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9B9A97]">
                <Store className="h-4 w-4" />
              </div>
              <input
                id="reg-tenant"
                name="tenant_name"
                type="text"
                required
                value={formData.tenant_name}
                onChange={handleChange}
                placeholder="Contoh: Kopi Ruang Teduh"
                className="w-full rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#37352F] placeholder-[#9B9A97] focus:bg-white focus:border-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#37352F]/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-xs text-[#787774]">
              Nama brand usaha yang akan dicetak pada struk kasir dan laporan.
            </p>
          </div>

          {/* Owner Name */}
          <div>
            <label
              htmlFor="reg-owner"
              className="block text-sm font-medium mb-1.5 text-[#37352F]"
            >
              Nama Lengkap Pemilik <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9B9A97]">
                <User className="h-4 w-4" />
              </div>
              <input
                id="reg-owner"
                name="owner_name"
                type="text"
                required
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className="w-full rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#37352F] placeholder-[#9B9A97] focus:bg-white focus:border-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#37352F]/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-xs text-[#787774]">
              Nama akun pengelola utama (Tenant Owner) dengan hak akses penuh.
            </p>
          </div>

          {/* Owner Email */}
          <div>
            <label
              htmlFor="reg-email"
              className="block text-sm font-medium mb-1.5 text-[#37352F]"
            >
              Email Bisnis (Login) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9B9A97]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="reg-email"
                name="owner_email"
                type="email"
                required
                value={formData.owner_email}
                onChange={handleChange}
                placeholder="budi@kopiruangteduh.com"
                className="w-full rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#37352F] placeholder-[#9B9A97] focus:bg-white focus:border-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#37352F]/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-xs text-[#787774]">
              Tautan aktivasi akun dan kata sandi akan dikirim ke email ini.
            </p>
          </div>

          {/* Owner Phone */}
          <div>
            <label
              htmlFor="reg-phone"
              className="block text-sm font-medium mb-1.5 text-[#37352F]"
            >
              Nomor WhatsApp / Telepon{" "}
              <span className="text-[#9B9A97] font-normal normal-case">(Opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9B9A97]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="reg-phone"
                name="owner_phone"
                type="tel"
                value={formData.owner_phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full rounded-xl border border-[#E9E9E7] bg-[#F7F7F5] pl-10 pr-4 py-2.5 sm:py-3 text-sm text-[#37352F] placeholder-[#9B9A97] focus:bg-white focus:border-[#37352F] focus:outline-none focus:ring-2 focus:ring-[#37352F]/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            <p className="mt-1 text-xs text-[#787774]">
              Dukungan verifikasi dua arah dan informasi operasional penting.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#37352F] text-white px-5 py-3.5 text-sm font-semibold shadow-xs hover:bg-[#201F1D] focus:outline-none focus:ring-2 focus:ring-[#37352F]/20 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] cursor-pointer group"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Mendaftarkan Bisnis...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang &amp; Mulai Onboarding</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-[#787774] leading-relaxed pt-1">
          Dengan mendaftar, Anda menyetujui{" "}
          <span className="text-[#37352F] font-medium underline underline-offset-2">Ketentuan Layanan</span> dan{" "}
          <span className="text-[#37352F] font-medium underline underline-offset-2">Kebijakan Privasi</span> Apeiron POS.
        </p>

        <p className="text-center text-xs text-[#787774]">
          Sudah memiliki akun bisnis?{" "}
          <a
            href={posLoginUrl}
            className="font-semibold text-[#37352F] hover:text-black underline underline-offset-2"
          >
            Masuk ke Apeiron POS
          </a>
        </p>
      </form>
    </div>
  );
}
