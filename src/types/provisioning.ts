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

export interface ProvisioningErrorResult {
  success: false;
  error: string;
  message: string;
  retryable?: boolean;
}

export type ProvisioningResult = ProvisioningSuccessResult | ProvisioningErrorResult;
