/**
 * Apeiron Astra Vortex — Ultra-Refined Micro-Particle Engine
 *
 * Visual & Mathematical Architecture:
 * 1. Aesthetic Standard: OpenAI GPT-6 Astra ("Clarity Monolith")
 *    - Strictly 4 harmonious tones (Pure Starlight White, Ice Alabaster,
 *      Clarity Periwinkle Blue, Deep Astral Cobalt).
 *    - 100% free of tacky rainbow colors, giant bokeh balls, and cross flares.
 *    - High-density micro-point cloud (3200 Desktop / 1400 Mobile).
 * 2. DOM-Aware H1 Anchor:
 *    - Dynamically anchors focal center behind "Run every branch with clarity.",
 *      specifically framing the italic "clarity." text.
 * 3. Geometry: 3D Tilted Orbital Torus (pitch ~64°, roll ~-16°) combined with
 *    2 sweeping asymmetric logarithmic spiral arms & low-frequency curl filaments.
 * 4. 2.8-Second Cinematic Entrance Choreography:
 *    - Custom quintic ease-out spiral implosion converging into serene equilibrium.
 * 5. Production Standards:
 *    - SSR-safe, JSDOM-safe, 60 FPS pre-rendered sprites, reduced-motion compliant.
 */

import { isReducedMotion } from "./motionTokens";

export interface ApeironVortexOptions {
  particleCount?: number;
  fov?: number;
  focalDepth?: number;
  focalRange?: number;
  reducedMotion?: boolean;
  baseRadius?: number;
  dprMax?: number;
  heroElementId?: string;
  enableParallax?: boolean;
  enableSwirl?: boolean;
  enableScrollCoupling?: boolean;
}

export type ParticleSubsystem = "torus" | "spiralArm0" | "spiralArm1" | "interstellar";

export interface VortexParticle {
  subsystem: ParticleSubsystem;
  // Equilibrium 3D coordinates
  x: number;
  y: number;
  z: number;
  // Orbit configuration
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  torusU: number;
  torusV: number;
  torusMajorR: number;
  torusMinorR: number;
  hVar: number;
  // Entrance implosion offsets
  initRadiusFactor: number;
  initAngleOffset: number;
  initZOffset: number;
  // Perturbation velocities (cursor swirl & ripple)
  wx: number;
  wy: number;
  wz: number;
  // Aesthetic parameters
  colorIndex: number;
  isMicro: boolean; // 85% micro (0.6 - 1.4px), 15% medium-soft (1.5 - 2.8px)
  size: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
}

/**
 * 4-Tone Exclusive GPT-6 Astra Palette ("Clarity Monolith")
 */
export const ASTRA_PALETTE = [
  // 0: Pure Starlight White — High-density core ridge & apex luminance
  {
    r: 255,
    g: 255,
    b: 255,
    core: "rgb(255, 255, 255)",
    mid: "rgba(240, 248, 255, 0.95)",
    halo: "rgba(224, 238, 255, 0.45)",
    edge: "rgba(255, 255, 255, 0)",
  },
  // 1: Ice Alabaster — Near-core luminous transition
  {
    r: 210,
    g: 228,
    b: 255,
    core: "rgb(245, 250, 255)",
    mid: "rgba(210, 228, 255, 0.92)",
    halo: "rgba(186, 215, 255, 0.42)",
    edge: "rgba(210, 228, 255, 0)",
  },
  // 2: Clarity Periwinkle Blue — Signature tone matching "clarity."
  {
    r: 155,
    g: 188,
    b: 255,
    core: "rgb(235, 242, 255)",
    mid: "rgba(155, 188, 255, 0.9)",
    halo: "rgba(125, 168, 255, 0.38)",
    edge: "rgba(155, 188, 255, 0)",
  },
  // 3: Deep Astral Cobalt — Outer spiral tail fading into pure black void
  {
    r: 75,
    g: 115,
    b: 215,
    core: "rgb(180, 205, 255)",
    mid: "rgba(75, 115, 215, 0.85)",
    halo: "rgba(50, 85, 185, 0.32)",
    edge: "rgba(75, 115, 215, 0)",
  },
] as const;

/**
 * Pre-render tiny dot sprites across the 4 color tones and 2 size tiers:
 * - Tier 0: Micro-dot (16px canvas, radius 8px)
 * - Tier 1: Soft-halo dot (32px canvas, radius 16px)
 */
function createOffscreenDotSprites(): (HTMLCanvasElement | null)[][] {
  if (typeof document === "undefined" || !document.createElement) return [];

  const canvasSizes = [16, 32];

  return ASTRA_PALETTE.map((pal) => {
    return canvasSizes.map((sz, tierIdx) => {
      try {
        const off = document.createElement("canvas");
        off.width = sz;
        off.height = sz;
        const ctx = off.getContext("2d");
        if (!ctx) return null;

        const center = sz / 2;
        const radius = sz / 2;
        const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);

        if (tierIdx === 0) {
          // Micro dot: razor-sharp core with fast pinpoint falloff
          grad.addColorStop(0, pal.core);
          grad.addColorStop(0.25, pal.mid);
          grad.addColorStop(0.65, pal.halo);
          grad.addColorStop(1, pal.edge);
        } else {
          // Soft-halo dot: gentle diffused aura
          grad.addColorStop(0, pal.core);
          grad.addColorStop(0.3, pal.mid);
          grad.addColorStop(0.7, pal.halo);
          grad.addColorStop(1, pal.edge);
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        return off;
      } catch {
        return null;
      }
    });
  });
}

/**
 * Custom Quintic Ease-Out curve for entrance implosion.
 */
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
}

/**
 * Computes 3D coordinates on the Tilted 3D Orbital Torus (Apeiron Core Ring).
 */
function computeTorusPoint(
  u: number,
  v: number,
  majorR: number,
  minorR: number,
  pitch: number,
  roll: number,
  yaw: number,
): { x: number; y: number; z: number } {
  const cosU = Math.cos(u);
  const sinU = Math.sin(u);
  const cosV = Math.cos(v);
  const sinV = Math.sin(v);

  // Torus surface in local coordinate space
  const rTorus = majorR + minorR * cosV;
  const localX = rTorus * cosU;
  const localY = rTorus * sinU * 0.42 + minorR * sinV * 0.6;
  const localZ = minorR * sinV;

  // 3D Rotations (Euler pitch, roll, yaw)
  // 1. Rotate around X (pitch ~64°)
  const y1 = localY * Math.cos(pitch) - localZ * Math.sin(pitch);
  const z1 = localY * Math.sin(pitch) + localZ * Math.cos(pitch);

  // 2. Rotate around Z (roll ~-16°)
  const x2 = localX * Math.cos(roll) - y1 * Math.sin(roll);
  const y2 = localX * Math.sin(roll) + y1 * Math.cos(roll);

  // 3. Rotate around Y (subtle yaw tilt)
  const x3 = x2 * Math.cos(yaw) + z1 * Math.sin(yaw);
  const z3 = -x2 * Math.sin(yaw) + z1 * Math.cos(yaw);

  return { x: x3, y: y2, z: z3 };
}

/**
 * Computes 3D coordinates along one of the Sweeping Logarithmic Spiral Arms.
 */
function computeSpiralArmPoint(
  r: number,
  theta: number,
  armAngleOffset: number,
  pitchB: number,
  hVar: number,
  pitch: number,
  roll: number,
): { x: number; y: number; z: number } {
  // Logarithmic spiral progression: theta = armOffset + b * ln(r / r0)
  const spiralTheta = theta + armAngleOffset + pitchB * Math.log(Math.max(r, 30) / 50);
  const cosT = Math.cos(spiralTheta);
  const sinT = Math.sin(spiralTheta);

  const rawX = r * cosT;
  const rawY = r * sinT * 0.38 + hVar;
  const rawZ = r * sinT * 0.65;

  // Apply inclination pitch & roll
  const y1 = rawY * Math.cos(pitch) - rawZ * Math.sin(pitch);
  const z1 = rawY * Math.sin(pitch) + rawZ * Math.cos(pitch);

  const x2 = rawX * Math.cos(roll) - y1 * Math.sin(roll);
  const y2 = rawX * Math.sin(roll) + y1 * Math.cos(roll);

  return { x: x2, y: y2, z: z1 };
}

/**
 * Very low-frequency organic pseudo-curl noise for silky filament dust strands.
 */
function computeLowFreqCurl(
  x: number,
  y: number,
  z: number,
  tSec: number,
): { dx: number; dy: number; dz: number } {
  const f = 0.0016; // Extremely low frequency for fluid continuity
  const t = tSec * 0.12; // Slow-motion cosmic drift

  const dyZ = Math.cos(y * f + t) * 14;
  const dzY = -Math.sin(z * f + t * 0.8) * 14;
  const dzX = Math.sin(z * f + t * 0.7) * 14;
  const dxZ = -Math.cos(x * f + t) * 14;
  const dxY = Math.cos(x * f + t * 0.6) * 14;
  const dyX = -Math.sin(y * f + t) * 14;

  return {
    dx: (dyZ - dzY) * 1.5,
    dy: (dzX - dxZ) * 1.5,
    dz: (dxY - dyX) * 1.5,
  };
}

/**
 * Main initializer for the Redesigned Apeiron Astra Vortex.
 */
export function initApeironVortex(
  canvasElement: HTMLCanvasElement | null,
  options?: ApeironVortexOptions,
): () => void {
  // SSR check
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Resolve target canvas element
  const canvas =
    canvasElement ||
    (document.getElementById("apeiron-vortex-canvas") as HTMLCanvasElement | null) ||
    (document.getElementById("hero-canvas") as HTMLCanvasElement | null);

  if (!canvas) {
    return () => {};
  }

  // JSDOM / Test safety
  let c2d: CanvasRenderingContext2D | null = null;
  try {
    c2d = canvas.getContext("2d", { alpha: true });
  } catch {
    return () => {};
  }

  if (!c2d) {
    return () => {};
  }
  const ctx2d: CanvasRenderingContext2D = c2d;

  const heroId = options?.heroElementId || "hero";
  const hero = document.getElementById(heroId) || canvas.parentElement || document.body;

  // Viewport & responsiveness setup
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  // Density point-cloud standard: 3200 on Desktop, 2200 Tablet, 1400 Mobile
  const DEFAULT_COUNT = isMobile ? 1400 : isTablet ? 2200 : 3200;
  const TOTAL_PARTICLES = options?.particleCount ?? DEFAULT_COUNT;
  const DPR_MAX = options?.dprMax ?? 2;
  const FOV = options?.fov ?? 760;
  const FOCAL_DEPTH = options?.focalDepth ?? 0;
  const FOCAL_RANGE = options?.focalRange ?? 360;
  const BASE_RADIUS = options?.baseRadius ?? 1.15;

  const reducedMotion = options?.reducedMotion ?? isReducedMotion();

  let W = hero ? hero.clientWidth || window.innerWidth : window.innerWidth;
  let H = hero ? hero.clientHeight || window.innerHeight : window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);

  // Pre-generate dot sprite lookup table
  const dotSprites = createOffscreenDotSprites();

  // DOM-Aware Anchor state: centered right behind H1 headline and "clarity."
  let anchorX = W * 0.5;
  let anchorY = Math.min(H * 0.32, 270);
  let h1Box: { top: number; bottom: number; left: number; right: number } | null = null;

  function updateAnchor() {
    if (typeof document === "undefined" || !hero || !canvas) return;
    const h1 = (hero.querySelector("h1") ||
      document.querySelector(".hero h1")) as HTMLElement | null;
    if (h1) {
      const h1Rect = h1.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      if (h1Rect.height > 0 && canvasRect.height > 0) {
        anchorX = W * 0.5;
        // Vertically centered behind H1 with a slight +12px offset framing the line
        anchorY = h1Rect.top - canvasRect.top + h1Rect.height * 0.5 + 12;
        h1Box = {
          top: h1Rect.top - canvasRect.top - 8,
          bottom: h1Rect.bottom - canvasRect.top + 8,
          left: h1Rect.left - canvasRect.left - 16,
          right: h1Rect.right - canvasRect.left + 16,
        };
        return;
      }
    }
    anchorX = W * 0.5;
    anchorY = Math.min(H * 0.32, 270);
    h1Box = null;
  }

  // Particle population setup
  let particles: VortexParticle[] = [];

  function spawnParticles() {
    const list: VortexParticle[] = [];

    // Distribution:
    // ~45% Tilted 3D Orbital Torus (The Apeiron Core Ring framing H1)
    // ~45% Sweeping Spiral Arms (Arm 0 top-left, Arm 1 bottom-right)
    // ~10% Ambient Interstellar Stardust
    const countTorus = Math.round(TOTAL_PARTICLES * 0.45);
    const countSpiral = Math.round(TOTAL_PARTICLES * 0.45);
    const countInterstellar = TOTAL_PARTICLES - countTorus - countSpiral;

    // 1. Tilted Orbital Torus Particles
    const majorRBase = Math.min(W * 0.36, 420);
    const minorRBase = Math.min(H * 0.2, 150);

    for (let i = 0; i < countTorus; i++) {
      // Density clustering: highest concentration along the front arc (u ~ 0.2 - 0.8 rad)
      const uBiased =
        Math.random() < 0.65
          ? (Math.random() - 0.2) * 1.6 // Clustered near front arc
          : Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;

      // 85% Micro (0.6 - 1.4px), 15% Medium-soft (1.5 - 2.8px)
      const isMicro = Math.random() < 0.85;
      const size = isMicro ? 0.65 + Math.random() * 0.75 : 1.5 + Math.random() * 1.3;

      // Color assignment: front arc is purest Starlight White (0) & Ice Alabaster (1)
      const uNorm = ((uBiased % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const isFrontArc = uNorm > 5.5 || uNorm < 2.0;
      let colorIndex = 1; // Ice Alabaster
      if (isFrontArc && Math.random() < 0.55) {
        colorIndex = 0; // Pure Starlight White
      } else if (Math.random() < 0.4) {
        colorIndex = 2; // Clarity Periwinkle Blue
      }

      list.push({
        subsystem: "torus",
        x: 0,
        y: 0,
        z: 0,
        orbitRadius: 0,
        orbitAngle: 0,
        orbitSpeed: 0.00012 + Math.random() * 0.00018, // Slow-motion cosmic drift
        torusU: uBiased,
        torusV: v,
        torusMajorR: majorRBase + (Math.random() - 0.5) * 36,
        torusMinorR: minorRBase + (Math.random() - 0.5) * 28,
        hVar: (Math.random() - 0.5) * 24,
        initRadiusFactor: 2.2 + Math.random() * 0.9,
        initAngleOffset: 1.6 + Math.random() * 0.5,
        initZOffset: -400 - Math.random() * 450,
        wx: 0,
        wy: 0,
        wz: 0,
        colorIndex,
        isMicro,
        size,
        baseAlpha: isMicro ? 0.5 + Math.random() * 0.45 : 0.65 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.001 + Math.random() * 0.0016,
      });
    }

    // 2. Sweeping Logarithmic Spiral Arms
    const spiralArmCount = 2;
    const countPerArm = Math.floor(countSpiral / spiralArmCount);

    for (let arm = 0; arm < spiralArmCount; arm++) {
      const armOffset = arm * Math.PI; // Arm 0: 0 rad, Arm 1: PI rad
      const subsystemName: ParticleSubsystem = arm === 0 ? "spiralArm0" : "spiralArm1";

      for (let i = 0; i < countPerArm; i++) {
        // Density falloff: more particles concentrated near the core
        const xi = Math.random();
        const rMin = 50;
        const rMax = Math.min(W * 0.58, 680);
        const r = rMin + (rMax - rMin) * Math.pow(xi, 1.45);
        const orbitSpeed = (12 / Math.pow(r + 50, 0.75)) * 0.00012;
        const hVar = (Math.random() - 0.5) * 38 * Math.sqrt(r / rMax);

        const isMicro = Math.random() < 0.85;
        const size = isMicro ? 0.6 + Math.random() * 0.75 : 1.5 + Math.random() * 1.2;

        // Progressive color fade along the spiral arm:
        // Core: White/Ice -> Mid: Clarity Periwinkle -> Outer Tail: Deep Astral Cobalt
        const rNorm = (r - rMin) / (rMax - rMin);
        let colorIndex = 2; // Clarity Periwinkle
        if (rNorm < 0.25) {
          colorIndex = Math.random() < 0.6 ? 0 : 1;
        } else if (rNorm < 0.65) {
          colorIndex = Math.random() < 0.5 ? 1 : 2;
        } else {
          colorIndex = Math.random() < 0.7 ? 3 : 2; // Deep Astral Cobalt
        }

        list.push({
          subsystem: subsystemName,
          x: 0,
          y: 0,
          z: 0,
          orbitRadius: r,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed,
          torusU: 0,
          torusV: 0,
          torusMajorR: 0,
          torusMinorR: 0,
          hVar,
          initRadiusFactor: 2.3 + Math.random() * 0.8,
          initAngleOffset: 1.7 + Math.random() * 0.45,
          initZOffset: -450 - Math.random() * 500,
          wx: 0,
          wy: 0,
          wz: 0,
          colorIndex,
          isMicro,
          size,
          baseAlpha: isMicro ? 0.4 + (1 - rNorm * 0.6) * 0.45 : 0.6 + (1 - rNorm * 0.5) * 0.35,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.0009 + Math.random() * 0.0014,
        });
      }
    }

    // 3. Ambient Interstellar Stardust
    for (let i = 0; i < countInterstellar; i++) {
      const r = 90 + Math.random() * (Math.min(W * 0.65, 780) - 90);
      const colorIndex = Math.random() < 0.65 ? 2 : 3;
      list.push({
        subsystem: "interstellar",
        x: 0,
        y: 0,
        z: 0,
        orbitRadius: r,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: 0.00008 + Math.random() * 0.00012,
        torusU: 0,
        torusV: 0,
        torusMajorR: 0,
        torusMinorR: 0,
        hVar: (Math.random() - 0.5) * 120,
        initRadiusFactor: 2.5,
        initAngleOffset: 1.5,
        initZOffset: -500,
        wx: 0,
        wy: 0,
        wz: 0,
        colorIndex,
        isMicro: true,
        size: 0.55 + Math.random() * 0.65,
        baseAlpha: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0008 + Math.random() * 0.0012,
      });
    }

    particles = list;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    W = hero ? hero.clientWidth || window.innerWidth : window.innerWidth;
    H = hero ? hero.clientHeight || window.innerHeight : window.innerHeight;

    if (canvas) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
    }

    updateAnchor();

    if (particles.length === 0) {
      spawnParticles();
    }
  }

  // Camera & Interactivity states
  let camYaw = 0;
  let camPitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;

  let pointerX = -9999;
  let pointerY = -9999;
  let isPointerActive = false;

  let scrollProgress = 0;
  let globalFade = 1;
  let cameraDollyZ = 0;

  let isIntersecting = true;
  let isTabVisible = typeof document !== "undefined" ? !document.hidden : true;
  let rafId = 0;
  let startTime = 0;
  let prevTime = 0;

  // Entrance duration: 2.8s
  const ENTRANCE_DURATION_MS = 2800;

  function onPointerMove(e: PointerEvent) {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
    isPointerActive = true;

    // Subtle 3D camera parallax
    const normX = (pointerX / W) * 2 - 1;
    const normY = (pointerY / H) * 2 - 1;
    targetYaw = normX * 0.18;
    targetPitch = -normY * 0.12;
  }

  function onPointerLeave() {
    isPointerActive = false;
    targetYaw = 0;
    targetPitch = 0;
  }

  function onScroll() {
    if (typeof window === "undefined" || !hero) return;
    const heroHeight = hero.clientHeight || 700;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    scrollProgress = Math.max(0, Math.min(1.2, scrollY / heroHeight));

    // Scroll coupling: smooth camera dolly-in and gradual atmospheric fade
    cameraDollyZ = scrollProgress * 180;
    globalFade = Math.max(0, 1 - scrollProgress * 1.05);
  }

  function onVisibilityChange() {
    isTabVisible = !document.hidden;
    if (isTabVisible && isIntersecting && !reducedMotion && rafId === 0) {
      prevTime = performance.now();
      rafId = requestAnimationFrame(render);
    }
  }

  // IntersectionObserver to pause when hero is completely scrolled off-screen
  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry ? entry.isIntersecting : true;
        if (isIntersecting && isTabVisible && !reducedMotion && rafId === 0) {
          prevTime = performance.now();
          rafId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.02 },
    );
    if (hero) observer.observe(hero);
  }

  // Progressive enhancement: contentvisibilityautostatechange listener
  const onContentVisibilityChange = (event: Event) => {
    const skipped = (event as { skipped?: boolean }).skipped;
    if (skipped) {
      isIntersecting = false;
    } else {
      isIntersecting = true;
      if (isTabVisible && !reducedMotion && rafId === 0) {
        prevTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    }
  };

  if (hero && "oncontentvisibilityautostatechange" in hero) {
    hero.addEventListener("contentvisibilityautostatechange", onContentVisibilityChange);
  }

  /**
   * Main rendering loop featuring 2.8s entrance choreography and serene equilibrium.
   */
  function render(timeMs: number) {
    rafId = 0;

    if (!isIntersecting || !isTabVisible) return;

    if (startTime === 0) {
      startTime = timeMs;
    }

    const elapsed = timeMs - startTime;
    const rawDt = prevTime > 0 ? (timeMs - prevTime) / 16.667 : 1;
    const dt = Math.min(Math.max(rawDt, 0.4), 2.2);
    prevTime = timeMs;

    const tSec = timeMs * 0.001;

    // 2.8s Entrance Choreography Progression
    // In reduced-motion mode, progress is instantaneously 1.0
    const rawProgress = reducedMotion ? 1.0 : Math.min(1.0, elapsed / ENTRANCE_DURATION_MS);
    const introProgress = easeOutQuint(rawProgress);
    const isIntro = introProgress < 0.999;

    // Smooth camera parallax damping
    camYaw += (targetYaw - camYaw) * 0.04 * dt;
    camPitch += (targetPitch - camPitch) * 0.04 * dt;

    // Periodically sync anchor during first few seconds as typography renders
    if (elapsed < 3500 && Math.random() < 0.03) {
      updateAnchor();
    }

    // Camera perspective precomputations
    const cosY = Math.cos(camYaw);
    const sinY = Math.sin(camYaw);
    const cosP = Math.cos(camPitch);
    const sinP = Math.sin(camPitch);

    // Constant subtle 3D orientation for the Apeiron Torus
    const torusPitch = 1.117; // ~64 deg
    const torusRoll = -0.279; // ~-16 deg
    const torusYaw = 0.14; // ~8 deg

    // Spiral arms inclination
    const spiralPitch = 0.94; // ~54 deg
    const spiralRoll = -0.22;

    const swirlRadius = isMobile ? 110 : 160;
    const swirlRadiusSq = swirlRadius * swirlRadius;

    // Clear canvas
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2d.clearRect(0, 0, W, H);

    // 1. Render Subtle Ambient Core Glow (Opacity <= 0.09)
    // Centered at (anchorX, anchorY) directly behind H1
    const glowRadius = Math.min(W * 0.44, 420);
    const glowAlpha = 0.08 * introProgress * globalFade;
    if (glowAlpha > 0.005) {
      const coreGrad = ctx2d.createRadialGradient(
        anchorX,
        anchorY,
        0,
        anchorX,
        anchorY,
        glowRadius,
      );
      coreGrad.addColorStop(0, `rgba(155, 188, 255, ${glowAlpha.toFixed(3)})`);
      coreGrad.addColorStop(0.35, `rgba(110, 150, 240, ${(glowAlpha * 0.55).toFixed(3)})`);
      coreGrad.addColorStop(0.7, `rgba(75, 115, 215, ${(glowAlpha * 0.22).toFixed(3)})`);
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx2d.fillStyle = coreGrad;
      ctx2d.beginPath();
      ctx2d.arc(anchorX, anchorY, glowRadius, 0, Math.PI * 2);
      ctx2d.fill();
    }

    // 2. Enable Additive Bloom Blending for high-density point cloud
    ctx2d.globalCompositeOperation = "lighter";

    // 3. Render Particles
    const pCount = particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = particles[i];
      if (!p) continue;

      let baseX = 0;
      let baseY = 0;
      let baseZ = 0;

      // Calculate Equilibrium Coordinates based on subsystem
      if (p.subsystem === "torus") {
        p.torusU = (p.torusU + p.orbitSpeed * dt) % (Math.PI * 2);
        const pt = computeTorusPoint(
          p.torusU,
          p.torusV,
          p.torusMajorR,
          p.torusMinorR,
          torusPitch,
          torusRoll,
          torusYaw,
        );
        baseX = pt.x;
        baseY = pt.y + p.hVar;
        baseZ = pt.z;
      } else if (p.subsystem === "spiralArm0" || p.subsystem === "spiralArm1") {
        p.orbitAngle = (p.orbitAngle + p.orbitSpeed * dt) % (Math.PI * 2);
        const armAngleOffset = p.subsystem === "spiralArm0" ? 0 : Math.PI;
        const pt = computeSpiralArmPoint(
          p.orbitRadius,
          p.orbitAngle,
          armAngleOffset,
          1.82,
          p.hVar,
          spiralPitch,
          spiralRoll,
        );
        baseX = pt.x;
        baseY = pt.y;
        baseZ = pt.z;
      } else {
        // Interstellar
        p.orbitAngle = (p.orbitAngle + p.orbitSpeed * dt) % (Math.PI * 2);
        const cosA = Math.cos(p.orbitAngle);
        const sinA = Math.sin(p.orbitAngle);
        baseX = p.orbitRadius * cosA;
        baseY = p.orbitRadius * sinA * 0.4 + p.hVar;
        baseZ = p.orbitRadius * sinA * 0.75;
      }

      // Entrance Implosion & Convergence Interpolation
      // Partikel menyapu masuk dalam gerak spiral implosion (radius 2.6x -> 1.0x, rotasi 1.8 rad -> 0 rad)
      if (isIntro) {
        const radiusScale = p.initRadiusFactor - (p.initRadiusFactor - 1.0) * introProgress;
        const angleOffset = p.initAngleOffset * (1.0 - introProgress);
        const cosOff = Math.cos(angleOffset);
        const sinOff = Math.sin(angleOffset);

        const rotatedX = (baseX * cosOff - baseY * sinOff) * radiusScale;
        const rotatedY = (baseX * sinOff + baseY * cosOff) * radiusScale;
        const zDisplacement = p.initZOffset * (1.0 - introProgress);

        baseX = rotatedX;
        baseY = rotatedY;
        baseZ += zDisplacement;
      }

      // Low-frequency procedural curl turbulence for smooth silky stardust lanes
      const curl = computeLowFreqCurl(baseX, baseY, baseZ, tSec);
      const posX = baseX + curl.dx + p.wx;
      const posY = baseY + curl.dy + p.wy;
      const posZ = baseZ + curl.dz + p.wz;

      // 3D Camera Rotation (Yaw -> Pitch)
      const xRot = posX * cosY + posZ * sinY;
      const zRot1 = -posX * sinY + posZ * cosY;

      const yRot = posY * cosP - zRot1 * sinP;
      const zRot = posY * sinP + zRot1 * cosP + cameraDollyZ;

      // Perspective Projection
      const depth = FOV + zRot;
      if (depth < 35) continue; // Near clipping

      const scale = FOV / depth;
      const screenX = anchorX + xRot * scale;
      const screenY = anchorY + yRot * scale;

      // Offscreen clipping
      if (screenX < -50 || screenX > W + 50 || screenY < -50 || screenY > H + 50) {
        continue;
      }

      // Depth of Field (DoF) & Bokeh simulation
      const focalDist = Math.abs(zRot - FOCAL_DEPTH);
      const defocus = Math.min(1, focalDist / FOCAL_RANGE);

      // Micro particles stay pinpoint (0.6 - 1.4px); soft halo particles expand gently (1.5 - 2.8px)
      const renderedRadius = (BASE_RADIUS * p.size + (p.isMicro ? 0 : defocus * 1.5)) * scale;
      const alphaDefocusFactor = p.isMicro ? 1.0 : 1.0 - defocus * 0.45;

      // Sinusoidal serene starlight twinkling
      const twinkle = 0.88 + 0.12 * Math.sin(timeMs * p.twinkleSpeed + p.phase);

      // Typography Readability Protection:
      // If a particle is directly inside the H1 headline bounds in front of text, soften its alpha
      let textDimming = 1.0;
      if (h1Box && zRot < 40) {
        if (
          screenX >= h1Box.left &&
          screenX <= h1Box.right &&
          screenY >= h1Box.top &&
          screenY <= h1Box.bottom
        ) {
          textDimming = 0.28; // Keep text razor sharp
        }
      }

      const renderedAlpha = Math.max(
        0,
        Math.min(
          1,
          p.baseAlpha * alphaDefocusFactor * twinkle * introProgress * globalFade * textDimming,
        ),
      );

      if (renderedAlpha < 0.015) continue;

      // Draw particle using tiny offscreen radial dot sprite
      const tierIndex = p.isMicro ? 0 : 1;
      const sprite = dotSprites[p.colorIndex]?.[tierIndex];

      ctx2d.globalAlpha = renderedAlpha;

      if (sprite) {
        const drawSize = renderedRadius * 2;
        ctx2d.drawImage(
          sprite,
          screenX - renderedRadius,
          screenY - renderedRadius,
          drawSize,
          drawSize,
        );
      } else {
        // Fallback for test / headless environments
        ctx2d.fillStyle = p.colorIndex === 0 ? "#ffffff" : "#9bbcff";
        ctx2d.beginPath();
        ctx2d.arc(screenX, screenY, Math.max(0.6, renderedRadius * 0.5), 0, Math.PI * 2);
        ctx2d.fill();
      }

      // Interactive Cursor Swirl Wake (tangential swirl + soft spring push)
      if (isPointerActive) {
        const dx = screenX - pointerX;
        const dy = screenY - pointerY;
        const distSq = dx * dx + dy * dy;

        if (distSq < swirlRadiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const f = Math.pow(1 - dist / swirlRadius, 1.8);
          // Soft tangential swirl
          const tx = (-dy / dist) * 2.0 * f * dt;
          const ty = (dx / dist) * 2.0 * f * dt;
          // Soft radial push
          const rx = (dx / dist) * 0.7 * f * dt;
          const ry = (dy / dist) * 0.7 * f * dt;

          p.wx += tx + rx;
          p.wy += ty + ry;
        }
      }

      // Damping perturbation back to equilibrium
      p.wx *= Math.pow(0.93, dt);
      p.wy *= Math.pow(0.93, dt);
      p.wz *= Math.pow(0.93, dt);
    }

    // Schedule next frame
    if (!reducedMotion) {
      rafId = requestAnimationFrame(render);
    }
  }

  // Reduced motion: directly render final equilibrium state
  if (reducedMotion) {
    resize();
    render(ENTRANCE_DURATION_MS + 1000);
    const onResizeReduced = () => {
      resize();
      render(ENTRANCE_DURATION_MS + 1000);
    };
    window.addEventListener("resize", onResizeReduced, { passive: true });
    return () => {
      window.removeEventListener("resize", onResizeReduced);
    };
  }

  // Event listeners
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (hero) {
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  // Initialize and immediately render first frame
  resize();
  startTime = performance.now();
  prevTime = startTime;
  render(startTime);
  rafId = requestAnimationFrame(render);

  // Return clean teardown function
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibilityChange);

    if (hero) {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      if ("oncontentvisibilityautostatechange" in hero) {
        hero.removeEventListener("contentvisibilityautostatechange", onContentVisibilityChange);
      }
    }

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    particles = [];
  };
}
