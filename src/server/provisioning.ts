import crypto from "node:crypto";

import {
  type RegistrationInput,
  type ProvisioningResult,
  type ProvisioningSuccessResult,
  type ProvisioningErrorResult,
  type ProvisioningPendingResult,
} from "../types/provisioning";

export type {
  RegistrationInput,
  ProvisioningResult,
  ProvisioningSuccessResult,
  ProvisioningErrorResult,
  ProvisioningPendingResult,
};

/**
 * Calculates HMAC-SHA256 signature according to Apeiron POS Domain 1 specification:
 *   canonical = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + SHA256_HEX(RAW_BODY)
 *   signature = hex( HMAC-SHA256( secret, canonical ) )
 */
export function createProvisioningSignature(
  method: string,
  path: string,
  timestamp: string | number,
  nonce: string,
  rawBody: string,
  secret: string,
): string {
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const canonical = [method.toUpperCase(), path, String(timestamp), nonce, bodyHash].join("\n");

  return crypto.createHmac("sha256", secret).update(canonical).digest("hex");
}

export function validateRegistrationInput(input: RegistrationInput): {
  valid: boolean;
  error?: string;
} {
  if (
    !input.tenant_name ||
    input.tenant_name.trim().length < 2 ||
    input.tenant_name.trim().length > 120
  ) {
    return { valid: false, error: "Nama bisnis/tenant wajib diisi (2-120 karakter)." };
  }

  if (
    !input.owner_name ||
    input.owner_name.trim().length < 2 ||
    input.owner_name.trim().length > 120
  ) {
    return { valid: false, error: "Nama lengkap pemilik wajib diisi (2-120 karakter)." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.owner_email || !emailRegex.test(input.owner_email.trim())) {
    return { valid: false, error: "Format email pemilik tidak valid." };
  }

  if (input.owner_phone && input.owner_phone.trim().length > 0) {
    const phoneRegex = /^[0-9+\-\s()]{6,32}$/;
    if (!phoneRegex.test(input.owner_phone.trim())) {
      return { valid: false, error: "Nomor telepon tidak valid (6-32 karakter)." };
    }
  }

  return { valid: true };
}

export async function submitRegistrationToPos(
  input: RegistrationInput,
  idempotencyKey?: string,
): Promise<{ status: number; data: ProvisioningResult }> {
  const validation = validateRegistrationInput(input);
  if (!validation.valid) {
    return {
      status: 422,
      data: {
        success: false,
        error: "validation_error",
        message: validation.error ?? "Input registrasi tidak valid.",
      },
    };
  }

  const posApiUrl =
    process.env["APEIRON_POS_API_URL"] || "http://localhost:8000/api/v1/provisioning/registrations";
  const posSecret =
    process.env["APEIRON_POS_PROVISIONING_SECRET"] || "local-provisioning-secret-apeiron-2026";

  const cleanPayload = {
    tenant_name: input.tenant_name.trim(),
    owner_name: input.owner_name.trim(),
    owner_email: input.owner_email.trim().toLowerCase(),
    ...(input.owner_phone && input.owner_phone.trim().length > 0
      ? { owner_phone: input.owner_phone.trim() }
      : {}),
  };

  const rawBody = JSON.stringify(cleanPayload);
  const idempKey = idempotencyKey || crypto.randomUUID();

  // Extract path from URL (default: /api/v1/provisioning/registrations).
  //
  // PENTING (BUG-01): path yang DITANDATANGAN harus identik dengan yang
  // direkonstruksi POS dari request. POS memakai Laravel Request::path(), yang
  // MEMBUANG trailing slash dan leading slash ("…/registrations/" ->
  // "api/v1/provisioning/registrations"). Karena canonical memakai "/"+
  // path, nilai efektifnya selalu "/api/v1/provisioning/registrations".
  // Bila kita menandatangani pathname apa adanya (mis. URL berakhiran "/"),
  // signature TIDAK akan pernah cocok dan setiap registrasi ditolak 401.
  const normalizeSigningPath = (pathname: string): string => {
    const trimmed = pathname.replace(/\/+$/, "");
    return trimmed === "" ? "/" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };

  let requestPath = "/api/v1/provisioning/registrations";
  try {
    const parsedUrl = new URL(posApiUrl);
    requestPath = normalizeSigningPath(parsedUrl.pathname);
  } catch {
    // fallback to default
  }

  /**
   * Satu percobaan request ter-signing. Timestamp, nonce, dan signature SELALU
   * dibuat baru di setiap panggilan (kontrak PROVISIONING.md "Penanganan Retry":
   * pertahankan X-Idempotency-Key yang sama, generate timestamp/nonce/signature
   * baru agar tidak ditolak sebagai replay transport).
   */
  const attempt = async (): Promise<
    | { kind: "result"; status: number; data: ProvisioningResult }
    | { kind: "pending"; data: ProvisioningPendingResult }
    | { kind: "unavailable" }
  > => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomUUID();
    const signature = createProvisioningSignature(
      "POST",
      requestPath,
      timestamp,
      nonce,
      rawBody,
      posSecret,
    );

    try {
      const response = await fetch(posApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Timestamp": timestamp,
          "X-Nonce": nonce,
          "X-Idempotency-Key": idempKey,
          "X-Signature": signature,
        },
        body: rawBody,
      });

      const responseData = (await response.json().catch(() => ({
        success: false,
        error: "invalid_response",
        message: `POS backend returned status ${response.status}`,
      }))) as ProvisioningResult | ProvisioningPendingResult;

      // M-A03: respons pending (kontrak "200 OK (Pending Retryable)") BUKAN
      // keberhasilan — tidak punya tenant_id/onboarding. Jika diteruskan ke
      // form apa adanya, `json.success === true` akan menampilkan layar sukses
      // palsu dengan "Tenant ID #undefined". Perlakukan sebagai sinyal retry.
      const isPending = (
        body: ProvisioningResult | ProvisioningPendingResult,
      ): body is ProvisioningPendingResult =>
        body.success === true && (body as ProvisioningPendingResult).status === "pending";

      if (isPending(responseData)) {
        return { kind: "pending", data: responseData };
      }

      return { kind: "result", status: response.status, data: responseData };
    } catch {
      return { kind: "unavailable" };
    }
  };

  // M-A03: retry otomatis BERBATAS pada respons pending, dengan idempotency
  // key yang SAMA. Jeda antar attempt memakai backoff linear; angka attempt
  // kecil karena POS memproses request aslinya dalam hitungan detik
  // (throttle:10,1 di POS juga membatasi frekuensi).
  const PENDING_RETRY_LIMIT = 3;
  const PENDING_RETRY_DELAY_MS = 1050;

  for (let attemptNumber = 1; attemptNumber <= PENDING_RETRY_LIMIT; attemptNumber++) {
    const outcome = await attempt();

    if (outcome.kind === "result") {
      return { status: outcome.status, data: outcome.data };
    }

    if (outcome.kind === "unavailable") {
      return {
        status: 503,
        data: {
          success: false,
          error: "service_unavailable",
          message: "Tidak dapat terhubung ke Apeiron POS backend. Pastikan server POS berjalan.",
          retryable: true,
        },
      };
    }

    // kind === "pending": masih ada percobaan tersisa -> tunggu lalu ulang.
    if (attemptNumber < PENDING_RETRY_LIMIT) {
      await new Promise((resolve) => setTimeout(resolve, PENDING_RETRY_DELAY_MS));
    }
  }

  // Retry pending habis: POS masih memproses request ASLI (tenant mungkin
  // sudah/belum dibuat). Respons pending diteruskan apa adanya agar pemanggil
  // tahu ini BUKAN keberhasilan — tetapi status HTTP-nya dibungkus 200 dengan
  // penanda eksplisit, bukan diperlakukan sebagai sukses provisioning.
  return {
    status: 200,
    data: {
      success: false,
      error: "provisioning_pending",
      message:
        "Provisioning masih diproses oleh Apeiron POS. Data telah diterima dan tidak akan digandakan; silakan coba beberapa saat lagi.",
      retryable: true,
    },
  };
}
