import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Send, Copy, Check, Bot, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INITIAL_GREETING = "Halo, \nSaya Apeiron AI. Ada yang bisa saya bantu?";

/**
 * Formats basic markdown elements (bold, bullet points, numbered lists, inline code)
 * into compact, elegant React nodes.
 */
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");

  const renderInline = (lineText: string): React.ReactNode[] => {
    const parts = lineText.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-zinc-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="rounded bg-zinc-100 border border-zinc-200/80 px-1 py-0.5 font-mono text-[10px] text-zinc-800"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-1.5 text-[11.5px] leading-relaxed text-zinc-800 font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-0.5" />;
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-400" />
              <div>{renderInline(trimmed.slice(2))}</div>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch && numMatch[1] && numMatch[2]) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="shrink-0 font-medium text-[11px] text-zinc-700">{numMatch[1]}.</span>
              <div>{renderInline(numMatch[2])}</div>
            </div>
          );
        }

        return <p key={idx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

export function ApeironChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome-init",
      role: "assistant",
      content: INITIAL_GREETING,
      timestamp: "Baru saja",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Smooth scroll to bottom whenever messages change or loading state toggles
  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      if (typeof scrollContainerRef.current.scrollTo === "function") {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = setTimeout(() => scrollToBottom(true), 60);
    return () => {
      clearTimeout(timer);
    };
  }, [messages, isLoading, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const sendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMessage: MessageItem = {
      id: "usr-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue("");
    setIsLoading(true);

    try {
      // Send conversation turns to API (filtering out client-only welcome id if desired)
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages: payloadMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghubungi layanan AI.");
      }

      const botMessage: MessageItem = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Maaf, terjadi kendala saat menghubungkan ke AI.";

      const errorMessage: MessageItem = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `⚠️ ${errMsg}\n\nSilakan coba tanyakan kembali atau hubungi tim representatif Apeiron System.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputEl = form.querySelector("input") as HTMLInputElement | null;
    const textToSend = (inputValue || inputEl?.value || "").trim();
    if (textToSend) {
      sendMessage(textToSend);
    }
  };

  const backdropRef = useRef<HTMLDivElement | null>(null);

  // Close chat on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Lock body & html scroll while chatbot is open so mousepad/trackpad never scrolls main page
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isOpen]);

  // Trap wheel inside chat container so trackpad gestures never chain/bleed to the page
  useEffect(() => {
    if (!isOpen) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const isScrollable = el.scrollHeight > el.clientHeight;
      if (!isScrollable) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const atTop = el.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;

      if (atTop || atBottom) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [isOpen]);

  // Prevent scroll chaining when scrolling over the blurred backdrop
  useEffect(() => {
    if (!isOpen) return;

    const backdropEl = backdropRef.current;
    if (!backdropEl) return;

    const blockScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    backdropEl.addEventListener("wheel", blockScroll, { passive: false });
    backdropEl.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      backdropEl.removeEventListener("wheel", blockScroll);
      backdropEl.removeEventListener("touchmove", blockScroll);
    };
  }, [isOpen]);

  return (
    <>
      {/*
          ELEGANT BACKDROP BLUR OVERLAY
          Focuses user attention onto the active conversation.
          Softly dims and blurs the underlying page with smooth transition.
         */}
      {isOpen && (
        <div
          ref={backdropRef}
          data-testid="chat-backdrop"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-pointer overscroll-contain overflow-hidden"
        />
      )}

      {/*
          CHAT WINDOW PANEL (Fixed, Self-Contained, High-Contrast White Surface)
          Direct customer service conversation mode with instant friendly greeting
         */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Apeiron AI Chat Window"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed bottom-22 right-4 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] md:w-[400px] h-[530px] max-h-[calc(100dvh-7rem)] rounded-xl border border-zinc-200/90 bg-white shadow-2xl shadow-zinc-950/25 text-zinc-900 overflow-hidden font-sans antialiased animate-in fade-in zoom-in-95 duration-150 overscroll-contain"
        >
          {/* HEADER (Clean, Minimalist, Close Button Only) */}
          <div className="flex items-center justify-end px-3 py-2 border-b border-zinc-100 bg-white select-none shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              title="Tutup"
              aria-label="Tutup"
              className="size-7 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* CHAT MESSAGES BODY (Native Smooth Scrollable Container with min-h-0) */}
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 bg-[#FAF9F7] overscroll-contain space-y-3"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d4d4d8 transparent",
            }}
          >
            <div className="space-y-3 pt-0.5">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const mentionsRegister =
                  !isUser &&
                  (msg.content.toLowerCase().includes("daftar") ||
                    msg.content.toLowerCase().includes("uji coba") ||
                    msg.content.toLowerCase().includes("registrasi"));

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-start gap-1.5 max-w-[92%]">
                      {!isUser && (
                        <div className="size-5 rounded-md bg-zinc-950 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Bot className="size-3 text-white stroke-[2.2]" />
                        </div>
                      )}

                      <div
                        className={`relative group rounded-xl px-3.5 py-2.5 shadow-2xs ${
                          isUser
                            ? "bg-zinc-950 text-white rounded-tr-xs"
                            : "bg-white text-zinc-800 rounded-tl-xs border border-zinc-200/90"
                        }`}
                        style={
                          isUser
                            ? { backgroundColor: "#09090b", color: "#ffffff" }
                            : { backgroundColor: "#ffffff" }
                        }
                      >
                        {isUser ? (
                          <p
                            className="whitespace-pre-wrap leading-relaxed text-[11.5px]"
                            style={{ color: "#ffffff" }}
                          >
                            {msg.content}
                          </p>
                        ) : (
                          <div>
                            <MarkdownRenderer text={msg.content} />

                            {/* Clean Enterprise Call-to-action (Strictly Guaranteed White Text on Black) */}
                            {mentionsRegister && (
                              <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between">
                                <Link
                                  to="/register"
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[11px] font-medium shadow-sm transition-colors cursor-pointer"
                                  style={{
                                    backgroundColor: "#09090b",
                                    color: "#ffffff",
                                  }}
                                >
                                  <span style={{ color: "#ffffff" }}>
                                    Inisialisasi Workspace Bisnis
                                  </span>
                                </Link>
                              </div>
                            )}

                            {/* Copy button */}
                            <div className="mt-1 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="text-[10px] text-zinc-400 hover:text-zinc-700 flex items-center gap-0.5 p-0.5 rounded transition-colors cursor-pointer"
                                title="Salin respon"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="size-3 text-emerald-600" />
                                    <span className="text-[10px] text-emerald-600 font-medium">
                                      Tersalin
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3" />
                                    <span className="text-[10px]">Salin</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`text-[9px] text-zinc-400 mt-0.5 ${isUser ? "pr-1" : "pl-7"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* TYPING INDICATOR */}
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl rounded-tl-xs bg-white border border-zinc-200/90 shadow-2xs w-fit text-zinc-500 text-[11px] animate-pulse">
                  <Loader2 className="size-3.5 animate-spin text-zinc-800" />
                  <span>Apeiron AI sedang merumuskan jawaban operasional...</span>
                </div>
              )}
            </div>
          </div>

          {/* INPUT FORM FOOTER (Compact Crisp White Bar, Guaranteed Non-Squishable) */}
          <div className="p-2.5 border-t border-zinc-200/90 bg-white shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <Input
                name="chatMessage"
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tanyakan spesifikasi operasional POS..."
                disabled={isLoading}
                className="h-8.5 text-xs bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 placeholder:text-[11px] rounded-lg focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-zinc-950"
              />

              <Button
                type="submit"
                aria-label="Kirim pesan"
                disabled={isLoading || !inputValue.trim()}
                className="size-8.5 shrink-0 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white disabled:opacity-30 disabled:hover:bg-zinc-950 shadow-xs transition-opacity cursor-pointer"
                style={{ backgroundColor: "#09090b", color: "#ffffff" }}
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin text-white" />
                ) : (
                  <Send className="size-3.5 text-white" />
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-1.5 px-0.5 text-[10px] text-zinc-400">
              <span>Apeiron System • Operational AI</span>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-zinc-800 hover:text-zinc-500 font-medium transition-colors cursor-pointer"
              >
                Inisialisasi Tenant
              </Link>
            </div>
          </div>
        </div>
      )}

      {/*
          FLOATING LAUNCHER BUTTON (White Bot Icon with Thin 1px White Border)
          Crisp, minimal, clean 1px white border with zero glow.
         */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Tutup obrolan AI" : "Buka AI"}
          className="flex items-center justify-center size-12 sm:size-13 rounded-full bg-zinc-950 text-white border border-white hover:bg-zinc-900 hover:scale-105 active:scale-95 shadow-lg shadow-black/50 transition-all duration-200 cursor-pointer"
          style={{ backgroundColor: "#09090b", color: "#ffffff" }}
        >
          {isOpen ? (
            <X className="size-5 text-white stroke-[2.2]" />
          ) : (
            <Bot className="size-6 text-white stroke-[2.2]" />
          )}
        </button>
      </div>
    </>
  );
}
