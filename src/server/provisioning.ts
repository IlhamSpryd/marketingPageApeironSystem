import crypto from "node:crypto";

import {
  type RegistrationInput,
  type ProvisioningResult,
  type ProvisioningSuccessResult,
  type ProvisioningErrorResult,
} from "../types/provisioning";

export type {
  RegistrationInput,
  ProvisioningResult,
  ProvisioningSuccessResult,
  ProvisioningErrorResult,
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
  secret: string
): string {
  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const canonical = [
    method.toUpperCase(),
    path,
    String(timestamp),
    nonce,
    bodyHash,
  ].join("\n");

  return crypto.createHmac("sha256", secret).update(canonical).digest("hex");
}

export function validateRegistrationInput(input: RegistrationInput): { valid: boolean; error?: string } {
  if (!input.tenant_name || input.tenant_name.trim().length < 2 || input.tenant_name.trim().length > 120) {
    return { valid: false, error: "Nama bisnis/tenant wajib diisi (2-120 karakter)." };
  }

  if (!input.owner_name || input.owner_name.trim().length < 2 || input.owner_name.trim().length > 120) {
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
  idempotencyKey?: string
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
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const idempKey = idempotencyKey || crypto.randomUUID();

  // Extract path from URL (default: /api/v1/provisioning/registrations)
  let requestPath = "/api/v1/provisioning/registrations";
  try {
    const parsedUrl = new URL(posApiUrl);
    requestPath = parsedUrl.pathname;
  } catch {
    // fallback to default
  }

  const signature = createProvisioningSignature("POST", requestPath, timestamp, nonce, rawBody, posSecret);

  try {
    const response = await fetch(posApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
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
    }))) as ProvisioningResult;

    return {
      status: response.status,
      data: responseData,
    };
  } catch (error) {
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
}
