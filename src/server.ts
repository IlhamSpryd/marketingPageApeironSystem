import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/register" && request.method === "POST") {
        try {
          const { submitRegistrationToPos } = await import("./server/provisioning");
          const body = await request.json();
          const idempKey = request.headers.get("x-idempotency-key") || undefined;
          const { status, data } = await submitRegistrationToPos(body, idempKey);
          return new Response(JSON.stringify(data), {
            status,
            headers: { "content-type": "application/json" },
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Invalid JSON payload";
          return new Response(
            JSON.stringify({
              success: false,
              error: "bad_request",
              message,
            }),
            { status: 400, headers: { "content-type": "application/json" } },
          );
        }
      }

      if (url.pathname === "/api/chat") {
        if (request.method === "GET") {
          return new Response(JSON.stringify({ status: "ok", service: "Apeiron AI API" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        if (request.method === "POST") {
          try {
            const { handleGeminiChat } = await import("./server/geminiChat");
            const body = await request.json();
            const { status, data } = await handleGeminiChat(body, env);
            return new Response(JSON.stringify(data), {
              status,
              headers: { "content-type": "application/json" },
            });
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Invalid JSON payload or chat error";
            return new Response(
              JSON.stringify({
                success: false,
                error: message,
              }),
              { status: 400, headers: { "content-type": "application/json" } },
            );
          }
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
