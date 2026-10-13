import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createProvisioningSignature,
  validateRegistrationInput,
  submitRegistrationToPos,
  type RegistrationInput,
} from "../server/provisioning";
import crypto from "node:crypto";

describe("Registration & Provisioning S2S Integration", () => {
  const secret = "test-secret-key-apeiron-marketing-2026";
  const validData: RegistrationInput = {
    tenant_name: "Kopi Senja Utama",
    owner_name: "Ahmad Fauzi",
    owner_email: "ahmad.fauzi@kopisenja.test",
    owner_phone: "+6281298765432",
  };

  describe("validateRegistrationInput", () => {
    it("accepts valid input", () => {
      const res = validateRegistrationInput(validData);
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects short or empty tenant_name", () => {
      expect(validateRegistrationInput({ ...validData, tenant_name: "" }).valid).toBe(false);
      expect(validateRegistrationInput({ ...validData, tenant_name: "A" }).valid).toBe(false);
    });

    it("rejects short or empty owner_name", () => {
      expect(validateRegistrationInput({ ...validData, owner_name: "" }).valid).toBe(false);
      expect(validateRegistrationInput({ ...validData, owner_name: "B" }).valid).toBe(false);
    });

    it("rejects invalid email formats", () => {
      expect(validateRegistrationInput({ ...validData, owner_email: "invalid-email" }).valid).toBe(false);
      expect(validateRegistrationInput({ ...validData, owner_email: "missing@domain" }).valid).toBe(false);
    });

    it("rejects invalid phone characters", () => {
      expect(validateRegistrationInput({ ...validData, owner_phone: "abc12345" }).valid).toBe(false);
    });

    it("accepts empty optional phone", () => {
      expect(validateRegistrationInput({ ...validData, owner_phone: "" }).valid).toBe(true);
      expect(validateRegistrationInput({ ...validData, owner_phone: undefined }).valid).toBe(true);
    });
  });

  describe("createProvisioningSignature", () => {
    it("computes exact HMAC-SHA256 signature matching canonical string specification", () => {
      const method = "POST";
      const path = "/api/v1/provisioning/registrations";
      const timestamp = "1728745200";
      const nonce = "550e8400-e29b-41d4-a716-446655440000";
      const rawBody = JSON.stringify({ tenant_name: "Test Brand" });

      const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
      const canonical = `${method}\n${path}\n${timestamp}\n${nonce}\n${bodyHash}`;
      const expectedSignature = crypto.createHmac("sha256", secret).update(canonical).digest("hex");

      const generatedSignature = createProvisioningSignature(
        method,
        path,
        timestamp,
        nonce,
        rawBody,
        secret
      );

      expect(generatedSignature).toBe(expectedSignature);
      expect(generatedSignature).toMatch(/^[a-f0-9]{64}$/);
    });

    it("produces different signatures for different secrets or payloads", () => {
      const sig1 = createProvisioningSignature("POST", "/path", "100", "n1", "{}", "secret1");
      const sig2 = createProvisioningSignature("POST", "/path", "100", "n1", "{}", "secret2");
      const sig3 = createProvisioningSignature("POST", "/path", "100", "n1", '{"a":1}', "secret1");

      expect(sig1).not.toBe(sig2);
      expect(sig1).not.toBe(sig3);
    });
  });

  describe("submitRegistrationToPos", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      process.env["APEIRON_POS_API_URL"] = "http://localhost:8000/api/v1/provisioning/registrations";
      process.env["APEIRON_POS_PROVISIONING_SECRET"] = secret;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      vi.restoreAllMocks();
    });

    it("returns 422 immediately when validation fails without calling fetch", async () => {
      const fetchSpy = vi.fn();
      globalThis.fetch = fetchSpy;

      const res = await submitRegistrationToPos({ ...validData, tenant_name: "" });
      expect(res.status).toBe(422);
      expect(res.data.success).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("sends signed S2S request and returns success result", async () => {
      const mockPosResponse = {
        success: true,
        message: "Provisioning berhasil.",
        tenant_id: 101,
        owner_user_id: 202,
        store_id: 303,
        onboarding: {
          email_sent_to: validData.owner_email,
          activation_url: "http://localhost:8000/onboarding/set-password/sample-token-123",
          onboarding_token: "sample-token-123",
        },
      };

      let capturedHeaders: HeadersInit | undefined;

      globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
        capturedHeaders = init?.headers;
        return new Response(JSON.stringify(mockPosResponse), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await submitRegistrationToPos(validData, "fixed-idempotency-key-01");

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect((res.data as any).tenant_id).toBe(101);
      expect((res.data as any).onboarding.activation_url).toContain("sample-token-123");

      // Verify headers passed to POS
      const h = capturedHeaders as Record<string, string>;
      expect(h["X-Idempotency-Key"]).toBe("fixed-idempotency-key-01");
      expect(h["X-Timestamp"]).toBeDefined();
      expect(h["X-Nonce"]).toBeDefined();
      expect(h["X-Signature"]).toMatch(/^[a-f0-9]{64}$/);
    });

    it("handles 409 email already in use", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: "email_already_in_use",
            message: "Email sudah terdaftar.",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        )
      );

      const res = await submitRegistrationToPos(validData);
      expect(res.status).toBe(409);
      expect(res.data.success).toBe(false);
      expect((res.data as any).error).toBe("email_already_in_use");
    });

    it("handles network failure cleanly as 503 retryable", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

      const res = await submitRegistrationToPos(validData);
      expect(res.status).toBe(503);
      expect(res.data.success).toBe(false);
      expect((res.data as any).retryable).toBe(true);
    });
  });
});
