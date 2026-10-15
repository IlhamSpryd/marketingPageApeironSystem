/**
 * Apeiron Boundless Vortex — High-End 3D Cosmic Particle Engine
 *
 * Designed for Apeiron System:
 * - Brand Topology: Dual-attractor cosmic architecture combining a 3D Twisted
 *   Lemniscate / Möbius Ribbon (∞ Apeiron Attractor) with a Logarithmic Spiral
 *   Accretion Disk (Keplerian differential rotation).
 * - High-Fidelity 3D Projection: True perspective camera projection with
 *   Depth-of-Field (bokeh simulation) and multi-frequency pseudo-curl flow field.
 * - Ultra-High Performance: Pre-rendered offscreen glow sprite caching with
 *   additive blending (ctx.globalCompositeOperation = 'lighter') for 60 FPS bloom.
 * - Interactive Dynamics: Smooth 3D camera mouse parallax, local cursor swirl wake,
 *   and scroll-coupled dolly-in and fade.
 * - Production Safeguards: SSR-safe, JSDOM-safe, reduced-motion compliance,
 *   content-visibility integration, and tab visibility pausing.
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

export type ParticleType = "mobius" | "spiral" | "halo";

export interface VortexParticle {
  type: ParticleType;
  // 3D coordinates
  x: number;
  y: number;
  z: number;
  // Orbit configuration
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  spiralArm: number;
  mobiusU: number;
  mobiusW: number;
  haloPhase: number;
  hVar: number;
  // Perturbation velocities (spring wake from cursor)
  wx: number;
  wy: number;
  wz: number;
  // Visual aesthetics
  colorIndex: number;
  size: number;
  baseAlpha: number;
  phase: number;
  twinkleSpeed: number;
  isHeroStar: boolean;
}

/**
 * Pre-renders radial glow gradient sprites on offscreen canvases.
 * This avoids expensive radial gradient allocations or shadowBlur in the 60fps render loop.
 */
function createOffscreenGlowSprites(): (HTMLCanvasElement | null)[][] {
  if (typeof document === "undefined" || !document.createElement) return [];

  // Color Palettes:
  // 0: Hot White Core (#ffffff)
  // 1: Electric Cyan (#38bdf8 - Apeiron Primary Accent)
  // 2: Cosmic Astra Blue (#60a5fa)
  // 3: Deep Nebula Indigo (#818cf8 - Apeiron Secondary)
  // 4: Primordial Violet (#c084fc)
  const palettes = [
    {
      core: "#ffffff",
      mid: "rgba(240, 249, 255, 0.95)",
      halo: "rgba(224, 231, 255, 0.4)",
      edge: "rgba(255, 255, 255, 0)",
    },
    {
      core: "#ffffff",
      mid: "rgba(56, 189, 248, 0.95)",
      halo: "rgba(14, 165, 233, 0.45)",
      edge: "rgba(2, 132, 199, 0)",
    },
    {
      core: "#f0f7ff",
      mid: "rgba(96, 165, 250, 0.9)",
      halo: "rgba(59, 130, 246, 0.4)",
      edge: "rgba(37, 99, 235, 0)",
    },
    {
      core: "#eef2ff",
      mid: "rgba(129, 140, 248, 0.85)",
      halo: "rgba(99, 102, 241, 0.38)",
      edge: "rgba(79, 70, 229, 0)",
    },
    {
      core: "#faf5ff",
      mid: "rgba(192, 132, 252, 0.8)",
      halo: "rgba(168, 85, 247, 0.35)",
      edge: "rgba(147, 51, 234, 0)",
    },
  ];

  // 3 sizes: Small (16px), Medium (32px), Large (64px)
  const sizes = [16, 32, 64];

  return palettes.map((pal) => {
    return sizes.map((sz) => {
      try {
        const off = document.createElement("canvas");
        off.width = sz;
        off.height = sz;
        const ctx = off.getContext("2d");
        if (!ctx) return null;

        const center = sz / 2;
        const radius = sz / 2;
        const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
        grad.addColorStop(0, pal.core);
        grad.addColorStop(0.18, pal.mid);
        grad.addColorStop(0.48, pal.halo);
        grad.addColorStop(1, pal.edge);

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
 * Computes 3D coordinates for a point along the 3D Twisted Möbius Lemniscate (∞ Apeiron Attractor).
 */
function computeMobiusPoint(
  u: number,
  w: number,
  a: number,
  breath: number,
  tiltX: number,
  tiltY: number,
  tiltZ: number,
): { x: number; y: number; z: number } {
  const scaledA = a * breath;
  const sinU = Math.sin(u);
  const cosU = Math.cos(u);
  const denom = 1 + sinU * sinU;

  // 2D Bernoulli lemniscate base
  const x0 = (scaledA * cosU) / denom;
  const y0 = (scaledA * sinU * cosU) / denom;

  // Möbius half-twist along the figure-eight ribbon
  const halfU = u * 0.5;
  const sinHalf = Math.sin(halfU);
  const cosHalf = Math.cos(halfU);

  // 3D toroidal depth & ribbon normal displacement
  const ribbonZ = 120 * sinU * cosU + w * sinHalf;
  const ribbonX = x0 + w * cosHalf * sinU * 0.55;
  const ribbonY = y0 + w * cosHalf * cosU * 0.55;

  // 3D Euler rotations (pitch, yaw, roll)
  const y1 = ribbonY * Math.cos(tiltX) - ribbonZ * Math.sin(tiltX);
  const z1 = ribbonY * Math.sin(tiltX) + ribbonZ * Math.cos(tiltX);

  const x2 = ribbonX * Math.cos(tiltY) + z1 * Math.sin(tiltY);
  const z2 = -ribbonX * Math.sin(tiltY) + z1 * Math.cos(tiltY);

  const x3 = x2 * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
  const y3 = x2 * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);

  return { x: x3, y: y3, z: z2 };
}

/**
 * Computes 3D coordinates for a particle in the Logarithmic Spiral Accretion Disk.
 */
function computeSpiralPoint(
  r: number,
  theta: number,
  armOffset: number,
  pitchB: number,
  hVar: number,
  diskTiltX: number,
  diskTiltY: number,
): { x: number; y: number; z: number } {
  // Logarithmic spiral angle calculation
  const spiralTheta = theta + armOffset + pitchB * Math.log(Math.max(r, 20) / 45);
  const cosT = Math.cos(spiralTheta);
  const sinT = Math.sin(spiralTheta);

  const rawX = r * cosT;
  const rawY = r * sinT * 0.36 + hVar;
  const rawZ = r * sinT * 0.72;

  // Inclination tilt of the galactic disk plane
  const y1 = rawY * Math.cos(diskTiltX) - rawZ * Math.sin(diskTiltX);
  const z1 = rawY * Math.sin(diskTiltX) + rawZ * Math.cos(diskTiltX);

  const x2 = rawX * Math.cos(diskTiltY) + z1 * Math.sin(diskTiltY);
  const z2 = -rawX * Math.sin(diskTiltY) + z1 * Math.cos(diskTiltY);

  return { x: x2, y: y1, z: z2 };
}

/**
 * Multi-frequency pseudo-curl turbulence field for smooth cosmic dust filaments.
 */
function computeCurlDisplacement(
  x: number,
  y: number,
  z: number,
  tSec: number,
): { dx: number; dy: number; dz: number } {
  const f1 = 0.0026;
  const f2 = 0.0062;
  const t1 = tSec * 0.4;
  const t2 = tSec * 0.85;

  const dyZ = Math.cos(y * f1 + t1) * f1 * 16 + Math.sin(y * f2 + t2) * f2 * 7;
  const dzY = -Math.sin(z * f1 + t2) * f1 * 16 - Math.cos(z * f2 + t1) * f2 * 7;

  const dzX = Math.sin(z * f1 + t1) * f1 * 16;
  const dxZ = -Math.cos(x * f1 + t2) * f1 * 16;

  const dxY = Math.cos(x * f1 + t2) * f1 * 16;
  const dyX = -Math.sin(y * f1 + t1) * f1 * 16;

  return {
    dx: (dyZ - dzY) * 260,
    dy: (dzX - dxZ) * 260,
    dz: (dxY - dyX) * 260,
  };
}

/**
 * Main initializer for Apeiron Boundless Vortex.
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

  // JSDOM / Test safety: if 2D context is unavailable, cleanly no-op
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

  const DEFAULT_COUNT = isMobile ? 750 : isTablet ? 1100 : 1600;
  const TOTAL_PARTICLES = options?.particleCount ?? DEFAULT_COUNT;
  const DPR_MAX = options?.dprMax ?? 2;
  const FOV = options?.fov ?? 720;
  const FOCAL_DEPTH = options?.focalDepth ?? 0;
  const FOCAL_RANGE = options?.focalRange ?? 320;
  const BASE_RADIUS = options?.baseRadius ?? 1.25;

  const reducedMotion = options?.reducedMotion ?? isReducedMotion();

  let W = hero ? hero.clientWidth || window.innerWidth : window.innerWidth;
  let H = hero ? hero.clientHeight || window.innerHeight : window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);

  // Pre-generate offscreen glow sprites
  const spriteCache = createOffscreenGlowSprites();

  // Particle population setup
  let particles: VortexParticle[] = [];

  function spawnParticles() {
    const list: VortexParticle[] = [];
    // Particle partition:
    // ~36% Möbius Infinity Attractor
    // ~50% Logarithmic Spiral Accretion Disk
    // ~14% Ambient Interstellar Halo
    const countMobius = Math.round(TOTAL_PARTICLES * 0.36);
    const countSpiral = Math.round(TOTAL_PARTICLES * 0.5);
    const countHalo = TOTAL_PARTICLES - countMobius - countSpiral;

    // 1. Möbius Ribbon particles
    for (let i = 0; i < countMobius; i++) {
      const mobiusU = Math.random() * Math.PI * 2;
      const mobiusW = (Math.random() - 0.5) * 58;
      const isCore = Math.random() < 0.28;
      const colorIndex = isCore ? 0 : Math.random() < 0.55 ? 1 : Math.random() < 0.8 ? 2 : 3;
      list.push({
        type: "mobius",
        x: 0,
        y: 0,
        z: 0,
        orbitRadius: 0,
        orbitAngle: 0,
        orbitSpeed: 0.00045 + Math.random() * 0.0006,
        spiralArm: 0,
        mobiusU,
        mobiusW,
        haloPhase: 0,
        hVar: 0,
        wx: 0,
        wy: 0,
        wz: 0,
        colorIndex,
        size: 0.9 + Math.random() * 1.5,
        baseAlpha: 0.45 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0018 + Math.random() * 0.0025,
        isHeroStar: Math.random() < 0.028,
      });
    }

    // 2. Spiral Accretion Disk particles
    const spiralArms = 4;
    for (let i = 0; i < countSpiral; i++) {
      const arm = Math.floor(Math.random() * spiralArms);
      // Density falloff: higher density near core
      const xi = Math.random();
      const rMin = 40;
      const rMax = Math.min(W * 0.55, 620);
      const r = rMin + (rMax - rMin) * Math.pow(xi, 1.6);
      const orbitSpeed = 16 / Math.pow(r + 50, 0.7);
      const hVar = (Math.random() - 0.5) * 45 * Math.sqrt(r / rMax);

      const isCore = r < 120 && Math.random() < 0.45;
      const colorIndex = isCore
        ? 0
        : Math.random() < 0.45
          ? 1
          : Math.random() < 0.72
            ? 2
            : Math.random() < 0.88
              ? 3
              : 4;

      list.push({
        type: "spiral",
        x: 0,
        y: 0,
        z: 0,
        orbitRadius: r,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: orbitSpeed * 0.001,
        spiralArm: arm,
        mobiusU: 0,
        mobiusW: 0,
        haloPhase: 0,
        hVar,
        wx: 0,
        wy: 0,
        wz: 0,
        colorIndex,
        size: 0.8 + Math.random() * 1.4,
        baseAlpha: 0.35 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0015 + Math.random() * 0.002,
        isHeroStar: Math.random() < 0.024,
      });
    }

    // 3. Interstellar Ambient Halo particles
    for (let i = 0; i < countHalo; i++) {
      const r = 90 + Math.random() * (Math.min(W * 0.65, 780) - 90);
      const colorIndex = Math.random() < 0.4 ? 1 : Math.random() < 0.7 ? 3 : 2;
      list.push({
        type: "halo",
        x: 0,
        y: 0,
        z: 0,
        orbitRadius: r,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: 0.00015 + Math.random() * 0.0003,
        spiralArm: 0,
        mobiusU: 0,
        mobiusW: 0,
        haloPhase: Math.random() * Math.PI * 2,
        hVar: (Math.random() - 0.5) * 160,
        wx: 0,
        wy: 0,
        wz: 0,
        colorIndex,
        size: 0.65 + Math.random() * 1.0,
        baseAlpha: 0.18 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0012 + Math.random() * 0.0018,
        isHeroStar: false,
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
  let prevTime = 0;

  function onPointerMove(e: PointerEvent) {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
    isPointerActive = true;

    // Normalize coordinates [-1, 1] for 3D parallax
    const normX = (pointerX / W) * 2 - 1;
    const normY = (pointerY / H) * 2 - 1;
    targetYaw = normX * 0.28;
    targetPitch = -normY * 0.18;
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

    // Scroll coupling: Dolly into the vortex and fade as user scrolls down
    cameraDollyZ = scrollProgress * 220;
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
   * Main mathematical animation frame render.
   */
  function render(timeMs: number) {
    rafId = 0;

    // Check if animation should run
    if (!isIntersecting || !isTabVisible) return;

    // Time delta with clamping
    const rawDt = prevTime > 0 ? (timeMs - prevTime) / 16.667 : 1;
    const dt = Math.min(Math.max(rawDt, 0.4), 2.5);
    prevTime = timeMs;

    const tSec = timeMs * 0.001;

    // Smooth camera rotation damping (lerp 0.04)
    camYaw += (targetYaw - camYaw) * 0.04 * dt;
    camPitch += (targetPitch - camPitch) * 0.04 * dt;

    // Vortex focal center (intelligently placed to frame headline and stage transition)
    const centerX = W * 0.5;
    const centerY = H * 0.38;

    // Camera perspective precomputations
    const cosY = Math.cos(camYaw);
    const sinY = Math.sin(camYaw);
    const cosP = Math.cos(camPitch);
    const sinP = Math.sin(camPitch);

    // Cosmic breathing for the central Apeiron attractor
    const breath = 1 + 0.038 * Math.sin(timeMs * 0.0009);

    // Fixed tilt angles for the central Möbius ribbon
    const mobiusTiltX = 0.48; // ~27.5 deg
    const mobiusTiltY = -0.38; // ~-21.7 deg
    const mobiusTiltZ = 0.22; // ~12.6 deg

    // Fixed tilt for the accretion disk plane
    const diskTiltX = 0.98; // ~56.1 deg inclination
    const diskTiltY = -0.24;

    const swirlRadius = isMobile ? 120 : 180;
    const swirlRadiusSq = swirlRadius * swirlRadius;

    // Clear canvas
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2d.clearRect(0, 0, W, H);

    // Enable additive bloom blending
    ctx2d.globalCompositeOperation = "lighter";

    // Loop through all particles
    const pCount = particles.length;
    for (let i = 0; i < pCount; i++) {
      const p = particles[i];
      if (!p) continue;

      let baseX = 0;
      let baseY = 0;
      let baseZ = 0;

      // 1. Calculate base 3D coordinates based on subsystem
      if (p.type === "mobius") {
        p.mobiusU = (p.mobiusU + p.orbitSpeed * dt) % (Math.PI * 2);
        const mob = computeMobiusPoint(
          p.mobiusU,
          p.mobiusW,
          Math.min(W * 0.26, 310),
          breath,
          mobiusTiltX,
          mobiusTiltY,
          mobiusTiltZ,
        );
        baseX = mob.x;
        baseY = mob.y;
        baseZ = mob.z;
      } else if (p.type === "spiral") {
        p.orbitAngle = (p.orbitAngle + p.orbitSpeed * dt) % (Math.PI * 2);
        const armOffset = p.spiralArm * (Math.PI / 2);
        const spiral = computeSpiralPoint(
          p.orbitRadius,
          p.orbitAngle,
          armOffset,
          2.35,
          p.hVar,
          diskTiltX,
          diskTiltY,
        );
        baseX = spiral.x;
        baseY = spiral.y;
        baseZ = spiral.z;
      } else {
        // Halo
        p.orbitAngle = (p.orbitAngle + p.orbitSpeed * dt) % (Math.PI * 2);
        const cosA = Math.cos(p.orbitAngle);
        const sinA = Math.sin(p.orbitAngle);
        baseX = p.orbitRadius * cosA;
        baseY = p.orbitRadius * sinA * 0.42 + p.hVar;
        baseZ = p.orbitRadius * sinA * 0.78;
      }

      // 2. Multi-frequency pseudo-curl turbulence displacement
      const curl = computeCurlDisplacement(baseX, baseY, baseZ, tSec);
      const posX = baseX + curl.dx + p.wx;
      const posY = baseY + curl.dy + p.wy;
      const posZ = baseZ + curl.dz + p.wz;

      // 3. Camera 3D rotation (Yaw then Pitch)
      const xRot = posX * cosY + posZ * sinY;
      const zRot1 = -posX * sinY + posZ * cosY;

      const yRot = posY * cosP - zRot1 * sinP;
      const zRot = posY * sinP + zRot1 * cosP + cameraDollyZ;

      // 4. Perspective projection & near-plane clipping
      const depth = FOV + zRot;
      if (depth < 35) continue; // Behind camera plane

      const scale = FOV / depth;
      const screenX = centerX + xRot * scale;
      const screenY = centerY + yRot * scale;

      // Skip offscreen particles with margin
      if (screenX < -60 || screenX > W + 60 || screenY < -60 || screenY > H + 60) {
        continue;
      }

      // 5. Depth of Field (DoF) & Bokeh simulation
      const focalDist = Math.abs(zRot - FOCAL_DEPTH);
      const defocus = Math.min(1, focalDist / FOCAL_RANGE);

      // In-focus particles: crisp pinpoint radius and high luminance
      // Out-of-focus particles: expanded bokeh discs with soft falloff
      const renderedRadius = (BASE_RADIUS * p.size + defocus * 4.2) * scale;
      const alphaDefocusFactor = 1 - defocus * 0.52;

      // Twinkle calculation
      const twinkle = p.isHeroStar
        ? 0.7 + 0.3 * Math.sin(timeMs * p.twinkleSpeed + p.phase)
        : 0.85 + 0.15 * Math.sin(timeMs * 0.0016 + p.phase);

      const renderedAlpha = Math.max(
        0,
        Math.min(1, p.baseAlpha * alphaDefocusFactor * twinkle * globalFade),
      );

      if (renderedAlpha < 0.01) continue;

      // 6. Draw particle using cached offscreen sprite
      const sizeIndex = renderedRadius < 2.2 ? 0 : renderedRadius < 5.5 ? 1 : 2;
      const sprite = spriteCache[p.colorIndex]?.[sizeIndex];

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
        // Fallback for mock/test environments
        ctx2d.fillStyle = p.colorIndex === 0 ? "#ffffff" : "#38bdf8";
        ctx2d.beginPath();
        ctx2d.arc(screenX, screenY, Math.max(0.75, renderedRadius * 0.4), 0, Math.PI * 2);
        ctx2d.fill();
      }

      // 7. Micro-diffraction spikes for Hero Stars (OpenAI Astra visual cue)
      if (p.isHeroStar && defocus < 0.65 && renderedAlpha > 0.22) {
        const spikeLen = (12 + p.size * 5) * scale * (1 - defocus * 0.7);
        if (spikeLen > 3.5) {
          ctx2d.strokeStyle =
            p.colorIndex === 0
              ? `rgba(255, 255, 255, ${(renderedAlpha * 0.45).toFixed(3)})`
              : `rgba(186, 230, 253, ${(renderedAlpha * 0.4).toFixed(3)})`;
          ctx2d.lineWidth = 0.65;
          ctx2d.beginPath();
          ctx2d.moveTo(screenX - spikeLen, screenY);
          ctx2d.lineTo(screenX + spikeLen, screenY);
          ctx2d.moveTo(screenX, screenY - spikeLen);
          ctx2d.lineTo(screenX, screenY + spikeLen);
          ctx2d.stroke();
        }
      }

      // 8. Interactive Cursor Swirl Wake (tangential swirl + soft spring push)
      if (isPointerActive) {
        const dx = screenX - pointerX;
        const dy = screenY - pointerY;
        const distSq = dx * dx + dy * dy;

        if (distSq < swirlRadiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const f = Math.pow(1 - dist / swirlRadius, 1.8);
          // Tangential swirl vector
          const tx = (-dy / dist) * 2.4 * f * dt;
          const ty = (dx / dist) * 2.4 * f * dt;
          // Soft radial push
          const rx = (dx / dist) * 0.9 * f * dt;
          const ry = (dy / dist) * 0.9 * f * dt;

          p.wx += tx + rx;
          p.wy += ty + ry;
        }
      }

      // 9. Damping perturbation velocity back to equilibrium (spring return)
      p.wx *= Math.pow(0.93, dt);
      p.wy *= Math.pow(0.93, dt);
      p.wz *= Math.pow(0.93, dt);
    }

    // Schedule next frame
    if (!reducedMotion) {
      rafId = requestAnimationFrame(render);
    }
  }

  // Reduced motion: render single pristine static frame without RAF loop
  if (reducedMotion) {
    resize();
    render(1600);
    const onResizeReduced = () => {
      resize();
      render(1600);
    };
    window.addEventListener("resize", onResizeReduced, { passive: true });
    return () => {
      window.removeEventListener("resize", onResizeReduced);
    };
  }

  // Active interaction event listeners
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (hero) {
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  // Initialize and render first frame immediately
  resize();
  prevTime = performance.now();
  render(prevTime);
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
