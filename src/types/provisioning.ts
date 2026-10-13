export interface RegistrationInput {
  tenant_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string | undefined;
}

export interface ProvisioningSuccessResult {
  success: true;
  message: string;
  tenant_id: number;
  owner_user_id: number;
  store_id?: number;
  onboarding: {
    email_sent_to: string;
    activation_url?: string;
    onboarding_token?: string;
  };
  idempotent_replay?: boolean;
}

/**
 * POS sedang memproses request asli dengan idempotency key yang sama
 * (kontrak PROVISIONING.md — `200 OK (Pending Retryable)`).
 *
 * Respons ini BUKAN keberhasilan: tidak ada `tenant_id` dan tidak ada
 * `onboarding`. Pemanggil WAJIB menunggu lalu mengulang request dengan
 * `X-Idempotency-Key` yang SAMA (timestamp/nonce/signature baru).
 * Karena itu tipe ini TIDAK dimasukkan ke union `ProvisioningResult` —
 * memperlakukannya sebagai hasil akan menampilkan layar sukses palsu.
 */
export interface ProvisioningPendingResult {
  success: true;
  message: string;
  status: "pending";
  retryable: true;
}

export interface ProvisioningErrorResult {
  success: false;
  error: string;
  message: string;
  retryable?: boolean;
}

export type ProvisioningResult = ProvisioningSuccessResult | ProvisioningErrorResult;
