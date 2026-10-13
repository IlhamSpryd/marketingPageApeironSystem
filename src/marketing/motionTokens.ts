/**
 * Apeiron Systems Motion Design Tokens
 * Reusable motion tokens for micro-interactions, layout transitions, and cinematic scroll storytelling.
 * Compatible with GSAP and CSS custom properties.
 */

export const MOTION_TOKENS = {
  // Easing Curves (GSAP string names & CSS cubic-bezier definitions)
  ease: {
    cinematic: "power4.out",
    cinematicIn: "power4.in",
    cinematicInOut: "power4.inOut",
    smooth: "power3.out",
    natural: "power2.out",
    spring: "back.out(1.4)",
    springGentle: "back.out(1.15)",
    linear: "none",
    sine: "sine.inOut",
    css: {
      cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      sharp: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  },

  // Durations (in seconds for GSAP, milliseconds for CSS)
  duration: {
    instant: 0.12, // 120ms - buttons, toggles, icon micro-states
    fast: 0.22, // 220ms - dropdowns, item highlight, badge pop
    normal: 0.38, // 380ms - tab switches, card elevation, sheet open
    deliberate: 0.75, // 750ms - section reveals, staggered cards
    cinematic: 1.15, // 1150ms - hero headline reveal, 3D stage entrance
    ambient: 3.5, // 3500ms - floating oscillation, gradient sweep
  },

  // Stagger Intervals (seconds)
  stagger: {
    tight: 0.04, // equalizer bars, grid items
    normal: 0.08, // card lists, nav links
    relaxed: 0.14, // section headings, roadmap steps
  },

  // Distances and Scaling
  distance: {
    sm: 8,
    md: 18,
    lg: 32,
    xl: 48,
  },
  scale: {
    press: 0.97,
    hover: 1.025,
    spotlight: 1.04,
  },

  // Scroll Trigger Viewport Thresholds
  scroll: {
    leadIn: "top 92%",
    standard: "top 85%",
    centered: "top 65%",
    scrubRange: "top 80% bottom 30%",
  },
} as const;

export function isReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
