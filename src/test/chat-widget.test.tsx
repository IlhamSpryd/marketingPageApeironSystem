import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApeironChatWidget } from "../components/ApeironChatWidget";
import { handleGeminiChat } from "../server/geminiChat";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("Gemini Chat Server Handler", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns 500 when GEMINI_API_KEY is not configured", async () => {
    delete process.env["GEMINI_API_KEY"];
    delete process.env["VITE_GEMINI_API_KEY"];

    const result = await handleGeminiChat({ message: "Halo" });
    expect(result.status).toBe(500);
    expect(result.data.success).toBe(false);
    expect(result.data.error).toContain("GEMINI_API_KEY belum dikonfigurasi");
  });

  it("returns 400 when empty message is provided", async () => {
    process.env["GEMINI_API_KEY"] = "mock-key";

    const result = await handleGeminiChat({ message: "   " });
    expect(result.status).toBe(400);
    expect(result.data.success).toBe(false);
  });

  it("successfully returns reply from Gemini API", async () => {
    process.env["GEMINI_API_KEY"] = "mock-key";

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "Halo, saya Apeiron AI siap membantu Anda!" }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await handleGeminiChat({ message: "Apa itu Apeiron?" });
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    expect(result.data.reply).toBe("Halo, saya Apeiron AI siap membantu Anda!");
  });
});

describe("ApeironChatWidget Component", () => {
  beforeEach(() => {
    // Scroll mocks
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the floating launcher button initially", () => {
    render(<ApeironChatWidget />);

    const button = screen.getByRole("button", { name: /Buka AI/i });
    expect(button).toBeInTheDocument();
  });

  it("opens the chat modal and shows friendly customer service greeting when launcher is clicked", async () => {
    render(<ApeironChatWidget />);

    const launcher = screen.getByRole("button", { name: /Buka AI/i });
    fireEvent.click(launcher);

    expect(screen.getByRole("dialog", { name: /Apeiron AI/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Tutup$/i })).toBeInTheDocument();
    expect(screen.getByText(/Saya Apeiron AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Ada yang bisa saya bantu/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tanyakan spesifikasi operasional POS/i),
    ).toBeInTheDocument();

    // Verify elegant backdrop blur overlay is present
    const backdrop = screen.getByTestId("chat-backdrop");
    expect(backdrop).toBeInTheDocument();

    // Clicking backdrop closes the chat
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows user to type and send a chat message to receive reply from AI", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        reply: "Apeiron memiliki fitur multi-cabang real-time.",
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<ApeironChatWidget />);

    // Open widget
    fireEvent.click(screen.getByRole("button", { name: /Buka AI/i }));

    // Type question into input and submit
    const input = screen.getByPlaceholderText(/Tanyakan spesifikasi operasional POS/i);
    fireEvent.change(input, { target: { value: "Bagaimana fitur multi-cabang?" } });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    // Expect fetch was called with /api/chat
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/chat",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    // Check assistant response rendered
    await waitFor(() => {
      expect(
        screen.getByText(/Apeiron memiliki fitur multi-cabang real-time./i),
      ).toBeInTheDocument();
    });
  });
});
