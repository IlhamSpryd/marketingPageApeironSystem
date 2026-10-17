import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import logoUrl from "@/assets/logo.png";
import footerBrandUrl from "@/assets/footer_brand.png";
import { markup } from "@/marketing/markup";
import { initMarketing } from "@/marketing/interactions";
import "@/marketing/marketing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apeiron System — Operating system for F&B" },
      {
        name: "description",
        content:
          "One system for sales, inventory, cash, kitchen operations, and branches. Built for growing F&B businesses.",
      },
      { property: "og:title", content: "Apeiron System — Operating system for F&B" },
      {
        property: "og:description",
        content: "Sales, inventory, cash, kitchen, and every branch — connected in one system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ children: "document.documentElement.classList.add('js-enabled');" }],
  }),
  component: Index,
});

function Index() {
  const posLoginUrl =
    (typeof process !== "undefined" && process.env?.["VITE_APEIRON_POS_LOGIN_URL"]) ||
    "http://localhost:8000/login";

  const html = useMemo(() => {
    return markup
      .split("__LOGO__")
      .join(logoUrl)
      .split("__FOOTER_LOGO__")
      .join(footerBrandUrl)
      .replace(/href="#start"([^>]*>Get Started<\/a>)/g, 'href="/register"$1')
      .replace(/href="#start"([^>]*>Contact sales<\/a>)/g, 'href="/register"$1')
      .split('<a class="login" href="#start">Log in</a>')
      .join(`<a class="login" href="${posLoginUrl}">Log in</a>`)
      .split('<a href="#start">Log in</a>')
      .join(`<a href="/register">Get Started</a><a href="${posLoginUrl}">Log in</a>`);
  }, [posLoginUrl]);

  useEffect(() => initMarketing(), []);

  return (
    <div className="relative">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
