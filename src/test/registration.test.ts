import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createProvisioningSignature,
  validateRegistrationInput,
  submitRegistrationToPos,
  type RegistrationInput,
  type ProvisioningErrorResult,
  type ProvisioningSuccessResult,
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
      expect(validateRegistrationInput({ ...validData, owner_email: "invalid-email" }).valid).toBe(
        false,
      );
      expect(validateRegistrationInput({ ...validData, owner_email: "missing@domain" }).valid).toBe(
        false,
      );
    });

    it("rejects invalid phone characters", () => {
      expect(validateRegistrationInput({ ...validData, owner_phone: "abc12345" }).valid).toBe(
        false,
      );
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
        secret,
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
      process.env["APEIRON_POS_API_URL"] =
        "http://localhost:8000/api/v1/provisioning/registrations";
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
      const successData = res.data as ProvisioningSuccessResult;
      expect(successData.tenant_id).toBe(101);
      expect(successData.onboarding.activation_url).toContain("sample-token-123");

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
          { status: 409, headers: { "Content-Type": "application/json" } },
        ),
      );

      const res = await submitRegistrationToPos(validData);
      expect(res.status).toBe(409);
      expect(res.data.success).toBe(false);
      expect((res.data as ProvisioningErrorResult).error).toBe("email_already_in_use");
    });

    it("handles network failure cleanly as 503 retryable", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

      const res = await submitRegistrationToPos(validData);
      expect(res.status).toBe(503);
      expect(res.data.success).toBe(false);
      expect((res.data as ProvisioningErrorResult).retryable).toBe(true);
    });

    /**
     * REGRESSION (BUG-01): The signed path MUST equal the path the POS server
     * reconstructs from the request. Laravel's Request::path() strips trailing
     * slashes and the leading slash, so the canonical path is always
     * "/api/v1/provisioning/registrations". If APEIRON_POS_API_URL carries a
     * trailing slash, the client must NOT sign it verbatim — otherwise the
     * signature never matches and every registration is rejected with 401.
     */
    it("signs the canonical path even when APEIRON_POS_API_URL has a trailing slash", async () => {
      process.env["APEIRON_POS_API_URL"] =
        "http://localhost:8000/api/v1/provisioning/registrations/";

      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });

      await submitRegistrationToPos(validData);

      // Rebuild the canonical exactly as the POS middleware does.
      const timestamp = capturedHeaders["X-Timestamp"];
      const nonce = capturedHeaders["X-Nonce"];
      const rawBody = JSON.stringify({
        tenant_name: validData.tenant_name.trim(),
        owner_name: validData.owner_name.trim(),
        owner_email: validData.owner_email.trim().toLowerCase(),
        owner_phone: validData.owner_phone?.trim(),
      });
      const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
      const serverCanonical = [
        "POST",
        "/api/v1/provisioning/registrations",
        timestamp,
        nonce,
        bodyHash,
      ].join("\n");
      const serverExpected = crypto
        .createHmac("sha256", secret)
        .update(serverCanonical)
        .digest("hex");

      expect(capturedHeaders["X-Signature"]).toBe(serverExpected);
    });

    /**
     * REGRESSION (BUG-01): a base URL mounted under a path prefix (reverse
     * proxy / sub-path deployment) must be signed with the FULL public path,
     * matching what the POS server sees.
     */
    it("signs the full path prefix when the POS API is mounted under a sub-path", async () => {
      process.env["APEIRON_POS_API_URL"] =
        "https://apeiron.example.com/pos/api/v1/provisioning/registrations";

      let capturedHeaders: Record<string, string> = {};
      globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });

      await submitRegistrationToPos(validData);

      const timestamp = capturedHeaders["X-Timestamp"];
      const nonce = capturedHeaders["X-Nonce"];
      const rawBody = JSON.stringify({
        tenant_name: validData.tenant_name.trim(),
        owner_name: validData.owner_name.trim(),
        owner_email: validData.owner_email.trim().toLowerCase(),
        owner_phone: validData.owner_phone?.trim(),
      });
      const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
      const serverCanonical = [
        "POST",
        "/pos/api/v1/provisioning/registrations",
        timestamp,
        nonce,
        bodyHash,
      ].join("\n");
      const serverExpected = crypto
        .createHmac("sha256", secret)
        .update(serverCanonical)
        .digest("hex");

      expect(capturedHeaders["X-Signature"]).toBe(serverExpected);
    });

    /**
     * REGRESSION (M-A03): POS dapat menjawab 200 dengan status "pending"
     * (kontrak PROVISIONING.md — "200 OK (Pending Retryable)") SELAGI request
     * aslinya masih diproses. Respons ini TIDAK punya tenant_id/onboarding;
     * jika diteruskan ke form, `json.success === true` akan menampilkan layar
     * sukses palsu. Klien harus me-retry otomatis dengan X-Idempotency-Key
     * yang SAMA (timestamp/nonce/signature baru) sampai hasil final.
     */
    it("auto-retries on 200 pending response with the SAME idempotency key until success", async () => {
      const pendingBody = {
        success: true,
        message: "Provisioning sedang diproses.",
        status: "pending",
        retryable: true,
      } as const;
      const finalBody = {
        success: true,
        message: "Provisioning berhasil.",
        tenant_id: 555,
        owner_user_id: 666,
        onboarding: { email_sent_to: validData.owner_email },
      };

      const capturedKeys: (string | undefined)[] = [];
      const timestamps: (string | undefined)[] = [];
      let calls = 0;

      globalThis.fetch = vi.fn().mockImplementation(async (_url, init) => {
        const h = init?.headers as Record<string, string>;
        capturedKeys.push(h["X-Idempotency-Key"]);
        timestamps.push(h["X-Timestamp"]);
        calls++;
        return new Response(JSON.stringify(calls <= 2 ? pendingBody : finalBody), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await submitRegistrationToPos(validData, "pending-retry-key-0001");

      // 2 x pending, lalu sukses = 3 panggilan total.
      expect(calls).toBe(3);
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect((res.data as ProvisioningSuccessResult).tenant_id).toBe(555);

      // Idempotency key PERTAHANKAN di semua attempt.
      expect(capturedKeys).toHaveLength(3);
      for (const key of capturedKeys) {
        expect(key).toBe("pending-retry-key-0001");
      }

      // Timestamp/nonce/signature BERBEDA antar attempt (anti-replay transport).
      expect(timestamps[0]).not.toBe(timestamps[1]);
    });

    it("never reports false success when pending retries are exhausted", async () => {
      const pendingBody = {
        success: true,
        message: "Provisioning sedang diproses.",
        status: "pending",
        retryable: true,
      } as const;

      let calls = 0;
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        calls++;
        return new Response(JSON.stringify(pendingBody), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await submitRegistrationToPos(validData, "pending-exhaust-key-001");

      // Semua attempt pending -> TIDAK boleh success:true tanpa tenant_id.
      expect(calls).toBe(3); // PENDING_RETRY_LIMIT
      expect(res.data.success).toBe(false);
      expect((res.data as ProvisioningErrorResult).error).toBe("provisioning_pending");
      expect((res.data as ProvisioningErrorResult).retryable).toBe(true);
      expect(
        "tenant_id" in res.data ? (res.data as ProvisioningSuccessResult).tenant_id : undefined,
      ).toBeUndefined();
    });
  });
});
