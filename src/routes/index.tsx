import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import logo from "@/assets/apeiron-logo.png.asset.json";
import { markup } from "@/marketing/markup";
import { initMarketing } from "@/marketing/interactions";
import "@/marketing/marketing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apeiron POS — Operating system for F&B" },
      {
        name: "description",
        content:
          "One system for sales, inventory, cash, kitchen operations, and branches. Built for growing F&B businesses.",
      },
      { property: "og:title", content: "Apeiron POS — Operating system for F&B" },
      {
        property: "og:description",
        content: "Sales, inventory, cash, kitchen, and every branch — connected in one system.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const html = useMemo(() => markup.split("__LOGO__").join(logo.url), []);
  useEffect(() => initMarketing(), []);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
