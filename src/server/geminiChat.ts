import fs from "node:fs";
import path from "node:path";
import { APEIRON_SYSTEM_CONTEXT } from "../marketing/aiKnowledge";

export interface ChatMessage {
  role: "user" | "assistant" | "model" | "system";
  content: string;
}

export interface ChatRequestPayload {
  message?: string;
  messages?: ChatMessage[];
  model?: string;
}

export interface ChatResponseData {
  success: boolean;
  reply?: string;
  error?: string;
  modelUsed?: string;
}

interface GeminiContentPart {
  text: string;
}

interface GeminiContentItem {
  role: "user" | "model";
  parts: GeminiContentPart[];
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

/**
 * Robustly retrieves the Gemini API key from various runtime contexts:
 * 1. Runtime env argument (Nitro/Vinxi/Cloudflare)
 * 2. process.env (Node.js)
 * 3. Direct .env file read from project root (handles Vite dev server caching)
 */
export function getGeminiApiKey(env?: unknown): string {
  // 1. Check passed env parameter (e.g. from Cloudflare / Nitro / Vinxi)
  if (env && typeof env === "object") {
    const candidate =
      (env as Record<string, unknown>)["GEMINI_API_KEY"] ||
      (env as Record<string, unknown>)["VITE_GEMINI_API_KEY"];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  // 2. Check process.env
  if (typeof process !== "undefined" && process.env) {
    const fromProcess = process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
    if (fromProcess && fromProcess.trim()) {
      return fromProcess.trim();
    }
  }

  // 3. Fallback: Read directly from .env file in project root
  // (Skipped in unit test runners when keys are unset for test isolation)
  if (
    typeof process !== "undefined" &&
    (process.env?.["VITEST"] === "true" || process.env?.["NODE_ENV"] === "test")
  ) {
    return "";
  }

  try {
    const cwd = typeof process !== "undefined" && process.cwd ? process.cwd() : ".";
    const envPaths = [
      path.resolve(cwd, ".env"),
      path.resolve(cwd, "marketingPageApeironSystem/.env"),
    ];

    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        const match = content.match(/^\s*(?:VITE_)?GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (match && match[1] && match[1].trim()) {
          return match[1].trim();
        }
      }
    }
  } catch {
    // Ignore filesystem read errors in edge runtimes
  }

  return "";
}

/**
 * Executes a generateContent call to Google AI Studio API for a given model.
 */
async function callGeminiApi(
  apiKey: string,
  model: string,
  contents: GeminiContentItem[],
  systemInstruction: string,
  timeoutMs = 30000,
): Promise<{ status: number; data: GeminiApiResponse }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as GeminiApiResponse;
    return { status: response.status, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Prepares the conversation history for Gemini API.
 * Gemini expects alternating user and model turns.
 */
function prepareGeminiContents(payload: ChatRequestPayload): GeminiContentItem[] {
  const items: GeminiContentItem[] = [];

  if (Array.isArray(payload.messages) && payload.messages.length > 0) {
    for (const msg of payload.messages) {
      if (!msg.content || typeof msg.content !== "string") continue;
      const trimmed = msg.content.trim();
      if (!trimmed) continue;

      // Map roles: 'assistant' -> 'model', 'user' -> 'user'
      // Skip system messages as systemInstruction is used
      if (msg.role === "system") continue;

      const role: "user" | "model" =
        msg.role === "assistant" || msg.role === "model" ? "model" : "user";

      // Gemini doesn't allow two consecutive messages with the same role
      const prev = items[items.length - 1];
      if (prev && prev.role === role && prev.parts[0]) {
        prev.parts[0].text += `\n\n${trimmed}`;
      } else {
        items.push({
          role,
          parts: [{ text: trimmed }],
        });
      }
    }
  }

  // If a single message string is provided and wasn't in messages
  if (payload.message && typeof payload.message === "string") {
    const trimmed = payload.message.trim();
    if (trimmed) {
      const prev = items[items.length - 1];
      if (!prev || prev.role !== "user" || prev.parts[0]?.text !== trimmed) {
        if (prev && prev.role === "user" && prev.parts[0]) {
          prev.parts[0].text += `\n\n${trimmed}`;
        } else {
          items.push({
            role: "user",
            parts: [{ text: trimmed }],
          });
        }
      }
    }
  }

  // Ensure conversation starts with a user message
  const firstItem = items[0];
  if (firstItem && firstItem.role !== "user") {
    items.unshift({
      role: "user",
      parts: [{ text: "Halo" }],
    });
  }

  return items;
}

/**
 * Main handler for handling chatbot requests from the frontend.
 */
export async function handleGeminiChat(
  payload: unknown,
  env?: unknown,
): Promise<{ status: number; data: ChatResponseData }> {
  const apiKey = getGeminiApiKey(env);

  if (!apiKey) {
    return {
      status: 500,
      data: {
        success: false,
        error:
          "GEMINI_API_KEY belum dikonfigurasi di server. Silakan tambahkan GEMINI_API_KEY ke file .env.",
      },
    };
  }

  const chatPayload = (payload || {}) as ChatRequestPayload;
  const contents = prepareGeminiContents(chatPayload);

  if (contents.length === 0) {
    return {
      status: 400,
      data: {
        success: false,
        error: "Pesan tidak boleh kosong.",
      },
    };
  }

  // Default to gemini-3.8-flash for Google AI Studio API
  const primaryModel = chatPayload.model || process.env["GEMINI_MODEL"] || "gemini-3.8-flash";
  const fallbackModels = ["gemini-3.5-flash-lite", "gemini-2.5-flash"];
  const candidateModels = [primaryModel, ...fallbackModels.filter((m) => m !== primaryModel)];

  let lastError = "Gagal memproses permintaan chat.";

  for (const modelToTry of candidateModels) {
    try {
      const { status, data } = await callGeminiApi(
        apiKey,
        modelToTry,
        contents,
        APEIRON_SYSTEM_CONTEXT,
      );

      // If model not found, deprecated, overloaded, or high demand, attempt next fallback model
      const isTransientOrUnavailable =
        status === 404 ||
        status === 429 ||
        status === 503 ||
        (data.error &&
          (data.error.code === 404 ||
            data.error.code === 429 ||
            data.error.code === 503 ||
            data.error.message?.toLowerCase().includes("high demand") ||
            data.error.message?.toLowerCase().includes("quota") ||
            data.error.message?.toLowerCase().includes("no longer available")));

      if (isTransientOrUnavailable) {
        console.warn(
          `[GeminiChat] Model ${modelToTry} returned status ${status} / ${data.error?.message}. Attempting fallback...`,
        );
        lastError = data.error?.message || `Model ${modelToTry} tidak tersedia.`;
        continue;
      }

      if (status !== 200 || data.error) {
        console.error(`[GeminiChat] Error from ${modelToTry}:`, data.error);
        lastError = data.error?.message || "Terjadi kesalahan pada layanan AI.";
        continue;
      }

      // Extract generated text from candidates
      const candidate = data.candidates?.[0];
      const replyParts = candidate?.content?.parts || [];
      const replyText = replyParts
        .map((p) => p.text || "")
        .filter(Boolean)
        .join("\n")
        .trim();

      if (!replyText) {
        return {
          status: 502,
          data: {
            success: false,
            error: "Model AI tidak menghasilkan respon teks.",
          },
        };
      }

      return {
        status: 200,
        data: {
          success: true,
          reply: replyText,
          modelUsed: modelToTry,
        },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[GeminiChat] Request failed with model ${modelToTry}: ${errMsg}`);
      lastError = errMsg;
    }
  }

  return {
    status: 500,
    data: {
      success: false,
      error: `Semua model gagal merespon: ${lastError}`,
    },
  };
}
