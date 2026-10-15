import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { markup } from "@/marketing/markup";
import { initMarketing } from "@/marketing/interactions";
import { MOTION_TOKENS, isReducedMotion } from "@/marketing/motionTokens";
import { initApeironVortex } from "@/marketing/apeironVortex";

describe("Marketing Page & Motion Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports motion design tokens with all standardized categories", () => {
    expect(MOTION_TOKENS.ease.cinematic).toBeDefined();
    expect(MOTION_TOKENS.ease.spring).toBeDefined();
    expect(MOTION_TOKENS.duration.cinematic).toBeGreaterThan(0);
    expect(MOTION_TOKENS.stagger.normal).toBeGreaterThan(0);
    expect(MOTION_TOKENS.distance.md).toBeGreaterThan(0);
    expect(MOTION_TOKENS.scale.hover).toBeGreaterThan(1);
    expect(MOTION_TOKENS.scroll.standard).toBeDefined();
  });

  it("detects reduced motion preference accurately", () => {
    expect(typeof isReducedMotion()).toBe("boolean");
  });

  it("contains all essential enterprise marketing sections in markup", () => {
    // Navigation & Hero
    expect(markup).toContain('id="nav"');
    expect(markup).toContain('id="hero"');
    expect(markup).toContain('id="hero-canvas"');
    expect(markup).toContain('id="apeiron-vortex-canvas"');
    expect(markup).toContain('id="apeiron-vortex-wrap"');
    expect(markup).toContain("Run every branch");
    expect(markup).toContain("clarity.");

    // Interactive Demo Sections
    expect(markup).toContain('id="product"'); // POS
    expect(markup).toContain('id="kitchen"'); // KDS
    expect(markup).toContain('id="inventory"'); // Live inventory
    expect(markup).toContain('id="system"'); // System diagram
    expect(markup).toContain('id="branches"'); // Multi-branch HQ

    // Trust & Commercial
    expect(markup).toContain('id="integrity"'); // Audit trails & ledger
    expect(markup).toContain('id="solutions"'); // Concepts
    expect(markup).toContain('id="how"'); // Roadmap
    expect(markup).toContain('id="pricing"'); // Plans
    expect(markup).toContain('id="start"'); // CTA
  });

  it("mounts marketing HTML and initializes motion system with clean teardown", () => {
    // Set up mock DOM elements needed for GSAP and Lenis in test environment
    const div = document.createElement("div");
    div.innerHTML = markup;
    document.body.appendChild(div);

    const mockCtx = {
      clearRect: vi.fn(),
      setTransform: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    };

    // Canvas mocks for both hero-canvas and apeiron-vortex-canvas
    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
    if (canvas) {
      canvas.getContext = vi.fn().mockReturnValue(mockCtx);
    }
    const vortexCanvas = document.getElementById(
      "apeiron-vortex-canvas",
    ) as HTMLCanvasElement | null;
    if (vortexCanvas) {
      vortexCanvas.getContext = vi.fn().mockReturnValue(mockCtx);
    }

    // Initialize marketing
    const cleanup = initMarketing();
    expect(typeof cleanup).toBe("function");

    // Test teardown
    expect(() => cleanup()).not.toThrow();

    // Clean up DOM
    document.body.removeChild(div);
  });

  describe("Apeiron Boundless Vortex Engine", () => {
    it("safely returns a no-op cleanup when canvas or context is null", () => {
      const cleanupNull = initApeironVortex(null);
      expect(typeof cleanupNull).toBe("function");
      expect(() => cleanupNull()).not.toThrow();

      const canvasWithoutCtx = document.createElement("canvas");
      // JSDOM getContext returns null by default in our setup
      const cleanupNoCtx = initApeironVortex(canvasWithoutCtx);
      expect(typeof cleanupNoCtx).toBe("function");
      expect(() => cleanupNoCtx()).not.toThrow();
    });

    it("initializes with active canvas context, supports reducedMotion, and executes clean teardown", () => {
      const heroEl = document.createElement("header");
      heroEl.id = "hero";
      document.body.appendChild(heroEl);

      const canvas = document.createElement("canvas");
      canvas.id = "apeiron-vortex-canvas";
      heroEl.appendChild(canvas);

      const mockCtx = {
        clearRect: vi.fn(),
        setTransform: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        drawImage: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      };

      canvas.getContext = vi.fn().mockReturnValue(mockCtx);

      // Test reduced motion mode (renders single static frame)
      const cleanupReduced = initApeironVortex(canvas, { reducedMotion: true });
      expect(typeof cleanupReduced).toBe("function");
      expect(canvas.getContext).toHaveBeenCalled();
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(() => cleanupReduced()).not.toThrow();

      // Test regular animation mode
      mockCtx.clearRect.mockClear();
      const cleanupActive = initApeironVortex(canvas, { reducedMotion: false, particleCount: 100 });
      expect(typeof cleanupActive).toBe("function");
      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(() => cleanupActive()).not.toThrow();

      // Clean up DOM
      document.body.removeChild(heroEl);
    });
  });
});
