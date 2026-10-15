import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { MARKETING_STATE } from "./marketingState";
import { isReducedMotion } from "./motionTokens";
import { initApeironVortex } from "./apeironVortex";

export function initMarketing(): () => void {
  const ac = new AbortController();
  const $ = <T extends HTMLElement = HTMLElement>(
    s: string,
    r: Document | HTMLElement = document,
  ): T | null => r.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(
    s: string,
    r: Document | HTMLElement = document,
  ): T[] => [...r.querySelectorAll<T>(s)];
  const idr = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const qty = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let nextOrder = 1045;

  const reduce = isReducedMotion();

  /* ───────────── GSAP & LENIS SETUP ───────────── */
  gsap.registerPlugin(ScrollTrigger);

  const lenis =
    reduce || typeof window === "undefined" || typeof ResizeObserver === "undefined"
      ? null
      : new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.95 });
  let tickLenis: ((time: number) => void) | null = null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    tickLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
  }

  const ctx = gsap.context(() => {
    /* ───────────── NAV & FULL-WIDTH MEGA MENU ───────────── */
    const nav = $(".nav");
    const burger = $("#burger");
    const menu = $("#menu");
    const megaMenu = $("#megaMenu");
    const megaBackdrop = $("#megaBackdrop");
    const navItems = nav ? $$(".nav-item[data-menu]", nav) : [];
    const megaPanels = megaMenu ? $$(".mega-panel", megaMenu) : [];
    let closeMegaTimer: ReturnType<typeof setTimeout> | null = null;

    // Refined Nav Initial Entrance
    if (nav && !reduce) {
      gsap.fromTo(
        nav,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: "power3.out", delay: 0.1 },
      );
    }

    const openMegaPanel = (menuKey: string) => {
      if (!megaMenu || !megaBackdrop || !nav) return;
      if (closeMegaTimer) {
        clearTimeout(closeMegaTimer);
        closeMegaTimer = null;
      }

      const targetPanel = $(`#mega-${menuKey}`, megaMenu);
      if (!targetPanel) return;

      document.body.classList.add("mega-open");
      megaMenu.classList.add("active");
      megaMenu.setAttribute("aria-hidden", "false");
      megaBackdrop.classList.add("active");
      megaBackdrop.setAttribute("aria-hidden", "false");
      nav.classList.add("mega-open", "scrolled");

      navItems.forEach((item) => {
        const isCurrent = item.dataset["menu"] === menuKey;
        item.classList.toggle("active", isCurrent);
        const link = $("a", item);
        if (link) link.setAttribute("aria-expanded", String(isCurrent));
      });

      megaPanels.forEach((panel) => {
        panel.classList.toggle("active", panel === targetPanel);
      });
    };

    const closeMegaMenu = () => {
      if (closeMegaTimer) {
        clearTimeout(closeMegaTimer);
        closeMegaTimer = null;
      }
      document.body.classList.remove("mega-open");
      if (megaMenu) {
        megaMenu.classList.remove("active");
        megaMenu.setAttribute("aria-hidden", "true");
      }
      if (megaBackdrop) {
        megaBackdrop.classList.remove("active");
        megaBackdrop.setAttribute("aria-hidden", "true");
      }
      if (nav) {
        nav.classList.remove("mega-open");
        nav.classList.toggle("scrolled", window.scrollY > 12 || Boolean(menu && !menu.hidden));
      }
      navItems.forEach((item) => {
        item.classList.remove("active");
        const link = $("a", item);
        if (link) link.setAttribute("aria-expanded", "false");
      });
      megaPanels.forEach((panel) => {
        panel.classList.remove("active");
      });
    };

    const scheduleCloseMega = (delay = 140) => {
      if (closeMegaTimer) clearTimeout(closeMegaTimer);
      closeMegaTimer = setTimeout(() => {
        closeMegaMenu();
      }, delay);
    };

    if (navItems.length && megaMenu) {
      navItems.forEach((item) => {
        const key = item.dataset["menu"];
        if (!key) return;

        item.addEventListener("mouseenter", () => openMegaPanel(key), { signal: ac.signal });
        item.addEventListener("mouseleave", () => scheduleCloseMega(140), { signal: ac.signal });
        item.addEventListener("focusin", () => openMegaPanel(key), { signal: ac.signal });
      });

      megaMenu.addEventListener(
        "mouseenter",
        () => {
          if (closeMegaTimer) {
            clearTimeout(closeMegaTimer);
            closeMegaTimer = null;
          }
        },
        { signal: ac.signal },
      );

      megaMenu.addEventListener("mouseleave", () => scheduleCloseMega(140), { signal: ac.signal });

      if (megaBackdrop) {
        megaBackdrop.addEventListener("click", closeMegaMenu, { signal: ac.signal });
      }

      window.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "Escape") closeMegaMenu();
        },
        { signal: ac.signal },
      );
    }

    if (burger && menu && nav) {
      burger.addEventListener(
        "click",
        () => {
          closeMegaMenu();
          const open = menu.hidden;
          menu.hidden = !open;
          burger.setAttribute("aria-expanded", String(open));
          burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
          nav.classList.toggle("scrolled", open || window.scrollY > 12);
        },
        { signal: ac.signal },
      );

      $$("a", menu).forEach((a) =>
        a.addEventListener(
          "click",
          () => {
            menu.hidden = true;
            burger.setAttribute("aria-expanded", "false");
            burger.setAttribute("aria-label", "Open menu");
          },
          { signal: ac.signal },
        ),
      );

      // Smooth scroll for nav items and dropdown links
      $$('#nav a[href^="#"], #megaMenu a[href^="#"]').forEach((a) => {
        a.addEventListener(
          "click",
          (e) => {
            const href = a.getAttribute("href");
            if (href && href !== "#" && href.startsWith("#")) {
              const target = $(href);
              if (target) {
                e.preventDefault();
                closeMegaMenu();
                if (lenis) {
                  lenis.scrollTo(target, { offset: -70 });
                } else {
                  target.scrollIntoView({ behavior: "smooth" });
                }
                if (menu && !menu.hidden) {
                  menu.hidden = true;
                  burger.setAttribute("aria-expanded", "false");
                  burger.setAttribute("aria-label", "Open menu");
                }
              }
            }
          },
          { signal: ac.signal },
        );
      });
    }

    // Nav scroll state with ScrollTrigger
    if (nav) {
      ScrollTrigger.create({
        start: 1,
        end: "max",
        onUpdate: () => {
          const isMegaActive = megaMenu && megaMenu.classList.contains("active");
          nav.classList.toggle(
            "scrolled",
            window.scrollY > 12 || Boolean(menu && !menu.hidden) || Boolean(isMegaActive),
          );
        },
      });
    }

    /* ───────────── HERO LIVING CLOCK ───────────── */
    const hDate = document.getElementById("hero-date");
    const hTime = document.getElementById("hero-time");
    const bTime = document.getElementById("branch-time");

    if (hDate && hTime) {
      const updateTime = () => {
        const now = new Date();
        const dStr = now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const tStr = now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        hDate.innerHTML = dStr + " &middot; ";
        hTime.innerHTML = tStr + " &middot; ";

        if (bTime) {
          bTime.innerHTML = dStr + " &middot; " + tStr;
        }
      };
      updateTime();
      const clockIv = setInterval(updateTime, 1000);
      ac.signal.addEventListener("abort", () => clearInterval(clockIv));
    }

    /* ───────────── HERO CHART BARS INITIALIZATION ───────────── */
    const H = [2.1, 4.6, 5.4, 4.8, 6.3, 9.7, 8.2, 1.75];
    const MAX = 9.7;
    const barsEl = $("#bars");
    const blabelsEl = $("#blabels");
    if (barsEl) {
      barsEl.innerHTML = Array.from({ length: 15 }, (_, i) => {
        const v = H[i];
        const cls = i === 7 ? "now" : v ? "" : "ghost";
        const h = v ? Math.max(6, (v / MAX) * 100) : 3;
        return `<i class="${cls}" data-h="${h}"></i>`;
      }).join("");
    }
    if (blabelsEl) {
      blabelsEl.innerHTML = Array.from(
        { length: 15 },
        (_, i) => `<span>${i % 3 === 0 || i === 14 ? String(7 + i).padStart(2, "0") : ""}</span>`,
      ).join("");
    }

    /* ───────────── HERO CINEMATIC ENTRANCE ───────────── */
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const eyebrow = $(".hero .eyebrow");
    const headline = $(".hero h1.h-xl");
    const headlineLines = $$(".hero .h-line");
    const lead = $(".hero p.lead");
    const btnRow = $(".hero .btn-row");
    const stage = $("#stage");
    const tilt = $("#tilt");
    const kpiSales = $("#kpi-sales");
    const kpiTx = $("#kpi-tx");
    const fAlert = $("#f-alert");
    const fPos = $(".f-pos");
    const r1044 = $("#r-1044");
    const appMain = $(".app-main");

    if (!reduce && headline) {
      // 1. Initial pristine state
      if (eyebrow) gsap.set(eyebrow, { autoAlpha: 0, y: -16, scale: 0.95 });
      if (headlineLines.length) {
        gsap.set(headlineLines, { y: "110%", opacity: 0 });
      } else {
        gsap.set(headline, { autoAlpha: 0, y: 40 });
      }
      if (lead) gsap.set(lead, { autoAlpha: 0, y: 24 });
      if (btnRow) gsap.set(btnRow, { autoAlpha: 0, y: 18, scale: 0.96 });
      if (stage) gsap.set(stage, { autoAlpha: 0 });
      if (tilt) gsap.set(tilt, { y: 65, rotateX: 14, scale: 0.9, filter: "blur(6px)" });
      if (appMain) gsap.set(appMain, { autoAlpha: 0, scale: 0.98 });
      if (fPos) gsap.set(fPos, { autoAlpha: 0, x: -40, y: 20, scale: 0.94 });
      if (fAlert) gsap.set(fAlert, { autoAlpha: 0, x: 35, y: -16, scale: 0.94 });
      if (r1044) gsap.set(r1044, { opacity: 0, y: 8 });
      gsap.set("#bars i", { height: "0%" });

      // Zero text numbers synchronously
      const interp = { sales: 0, tx: 0 };
      if (kpiSales) kpiSales.textContent = "Rp 0.00M";
      if (kpiTx) kpiTx.textContent = "0";

      // 2. Coordinated Sequence
      if (eyebrow) {
        heroTl.to(
          eyebrow,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
          "+=0.08",
        );
      }

      if (headlineLines.length) {
        heroTl.to(
          headlineLines,
          {
            y: "0%",
            opacity: 1,
            duration: 1.1,
            stagger: 0.12,
            ease: "power4.out",
          },
          eyebrow ? "-=0.45" : "+=0.08",
        );
      } else {
        heroTl.to(
          headline,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.05,
            ease: "power4.out",
          },
          eyebrow ? "-=0.45" : "+=0.08",
        );
      }

      if (lead) {
        heroTl.to(
          lead,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          "-=0.75",
        );
      }

      if (btnRow) {
        heroTl.to(
          btnRow,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.25)",
          },
          "-=0.6",
        );
      }

      // Grand 3D Stage Landing
      if (stage && tilt) {
        heroTl.to(stage, { autoAlpha: 1, duration: 0.4 }, "-=0.5").to(
          tilt,
          {
            y: 0,
            rotateX: 6,
            scale: 0.96,
            filter: "blur(0px)",
            duration: 1.35,
            ease: "power3.out",
          },
          "<",
        );
      }

      if (appMain) {
        heroTl.to(appMain, { autoAlpha: 1, scale: 1, duration: 0.8 }, "-=0.8");
      }

      // Floating widgets arrival
      if (fPos) {
        heroTl.to(
          fPos,
          { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
          "-=0.6",
        );
      }
      if (fAlert) {
        heroTl.to(
          fAlert,
          { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.2)" },
          "-=0.7",
        );
      }

      // Chart equalizer bars rising
      heroTl.to(
        "#bars i",
        {
          height: (_: number, el: HTMLElement) => `${el.dataset["h"]}%`,
          duration: 0.9,
          stagger: 0.035,
          ease: "power2.out",
        },
        "-=0.65",
      );

      // Transaction ripple and KPI rollup
      if (r1044) {
        heroTl.to(r1044, { opacity: 1, y: 0, duration: 0.35 }, "-=0.45").to(r1044, {
          scale: 1.025,
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          borderColor: "rgba(56, 189, 248, 0.4)",
          boxShadow: "0 0 16px rgba(56, 189, 248, 0.25)",
          yoyo: true,
          repeat: 1,
          duration: 0.3,
        });
      }

      heroTl
        .to(
          interp,
          {
            sales: MARKETING_STATE.sales,
            duration: 1.35,
            ease: "power2.out",
            onUpdate: () => {
              if (kpiSales) kpiSales.textContent = `Rp ${interp.sales.toFixed(2)}M`;
            },
          },
          "-=0.35",
        )
        .to(
          interp,
          {
            tx: MARKETING_STATE.tx,
            duration: 1.35,
            ease: "power2.out",
            onUpdate: () => {
              if (kpiTx) kpiTx.textContent = Math.round(interp.tx).toString();
            },
          },
          "<",
        );

      // Continuous Zero-G breathing floating
      if (fPos && fAlert) {
        gsap.to(fPos, {
          y: "-=8",
          rotation: 0.5,
          duration: 3.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 2.2,
        });
        gsap.to(fAlert, {
          y: "+=7",
          rotation: -0.5,
          duration: 4.0,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 2.4,
        });
      }
    } else {
      // Reduced motion fallback
      gsap.set($$("[data-in], .app-main, .f-pos, #f-alert"), { autoAlpha: 1 });
      if (headlineLines.length) gsap.set(headlineLines, { y: "0%", opacity: 1 });
      $$("#bars i").forEach((el) => {
        el.style.height = `${el.dataset["h"]}%`;
      });
    }

    /* ───────────── HERO DESKTOP MOUSE PARALLAX TILT ───────────── */
    if (!reduce && stage && tilt && window.innerWidth > 960) {
      let targetRotX = 6;
      let targetRotY = 0;
      let currentRotX = 6;
      let currentRotY = 0;

      const heroEl = $("#hero");
      if (heroEl) {
        const onHeroPointerMove = (e: PointerEvent) => {
          const rect = heroEl.getBoundingClientRect();
          const normX = (e.clientX - rect.left) / rect.width - 0.5;
          const normY = (e.clientY - rect.top) / rect.height - 0.5;

          targetRotX = 6 + normY * -5;
          targetRotY = normX * 6;
        };

        const onHeroPointerLeave = () => {
          targetRotX = 6;
          targetRotY = 0;
        };

        heroEl.addEventListener("pointermove", onHeroPointerMove, {
          passive: true,
          signal: ac.signal,
        });
        heroEl.addEventListener("pointerleave", onHeroPointerLeave, {
          passive: true,
          signal: ac.signal,
        });

        const tiltRaf = () => {
          currentRotX += (targetRotX - currentRotX) * 0.08;
          currentRotY += (targetRotY - currentRotY) * 0.08;
          tilt.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(0.96)`;
        };
        gsap.ticker.add(tiltRaf);
        ac.signal.addEventListener("abort", () => gsap.ticker.remove(tiltRaf));
      }

      // Parallax scroll flatten
      gsap.fromTo(
        tilt,
        { rotateX: 6, scale: 0.96 },
        {
          rotateX: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top 90%",
            end: "top 20%",
            scrub: 1.2,
          },
        },
      );
    }

    /* ───────────── STORY — READING-PACED NARRATIVE ───────────── */
    const storyP = $$("#storyList p");
    if (!reduce && storyP.length) {
      storyP.forEach((p, i) => {
        const isLast = i === storyP.length - 1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: p,
            start: "top 82%",
            end: isLast ? "center 42%" : "bottom 28%",
            scrub: 0.8,
          },
        });

        tl.fromTo(p, { opacity: 0.16, y: 16 }, { opacity: 1, y: 0, duration: 1 });
        if (!isLast) {
          tl.to(p, { opacity: 0.16, duration: 0.6 }, "+=0.3");
        }
      });
    }

    /* ───────────── SECTION HEADS — STAGGER REVEAL ───────────── */
    if (!reduce) {
      $$(".sec, .kds, .integrity").forEach((sec) => {
        const head = sec.querySelector(".sec-head, .int-top");
        if (!head) return;
        const children = [...head.children];
        gsap.set(children, { autoAlpha: 0, y: 28 });
        gsap.to(children, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: head, start: "top 88%" },
        });
      });

      // Demo sheets scale & fade reveal
      $$(".sheet, .board, .br, .log, .inv").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 36, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          },
        );
      });
    }

    /* ───────────── SYSTEM DIAGRAM — PIPELINE DRAWING ───────────── */
    const diag = $(".diagram");
    if (diag) {
      const edges = $$(".edge", diag);
      const arrows = $$(".arrow", diag);
      const ties = $$(".tie", diag);

      if (!reduce) {
        const diagTl = gsap.timeline({
          scrollTrigger: {
            trigger: diag,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1.4,
          },
        });
        diagTl.fromTo(
          edges,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, stagger: 0.08, ease: "none" },
        );
        diagTl.fromTo(
          arrows,
          { autoAlpha: 0.4 },
          { autoAlpha: 1, duration: 0.3, stagger: 0.06 },
          "-=0.6",
        );
        diagTl.fromTo(
          ties,
          { autoAlpha: 0.4 },
          { autoAlpha: 1, duration: 0.5, stagger: 0.08 },
          "-=0.3",
        );
      } else {
        gsap.set(edges, { strokeDashoffset: 0 });
        gsap.set(arrows, { autoAlpha: 1 });
        gsap.set(ties, { autoAlpha: 0.8 });
      }
    }

    /* ───────────── BRANCHES DIAGRAM ───────────── */
    const brL = $(".br-l");
    if (brL) {
      const edges = $$(".edge", brL);
      const arrow = $(".arrow", brL);

      if (!reduce) {
        const brTl = gsap.timeline({
          scrollTrigger: { trigger: brL, start: "top 85%", end: "bottom 55%", scrub: 1 },
        });
        const branchEdges = edges.slice(0, 3);
        const hqEdge = edges[3];
        brTl.fromTo(
          branchEdges,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.7, stagger: 0.04, ease: "power1.out" },
        );
        if (hqEdge) {
          brTl.fromTo(
            hqEdge,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.4, ease: "power1.out" },
            "-=0.1",
          );
        }
        if (arrow)
          brTl.fromTo(arrow, { autoAlpha: 0.4 }, { autoAlpha: 1, duration: 0.25 }, "-=0.2");
      } else {
        gsap.set(edges, { strokeDashoffset: 0 });
        if (arrow) gsap.set(arrow, { autoAlpha: 1 });
      }
    }

    /* ───────────── INTEGRITY PILLARS & AUDIT LOG ───────────── */
    if (!reduce) {
      const pillars = $$(".pillar");
      if (pillars.length) {
        gsap.set(pillars, { autoAlpha: 0, y: 24 });
        gsap.to(pillars, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ".pillars", start: "top 88%" },
        });
      }

      const logItems = $$(".log li");
      if (logItems.length) {
        gsap.set(logItems, { autoAlpha: 0, x: -12 });
        gsap.to(logItems, {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".log", start: "top 82%" },
        });
      }
    }

    /* ───────────── PHILOSOPHY & AUDIENCE ───────────── */
    if (!reduce) {
      const philH2 = $(".phil h2");
      const philLead = $(".phil .lead");

      if (philH2) {
        gsap.fromTo(
          philH2,
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "power2.out",
            scrollTrigger: { trigger: ".phil", start: "top 80%" },
          },
        );
      }
      if (philLead) {
        gsap.fromTo(
          philLead,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: philLead, start: "top 90%" },
          },
        );
      }

      $$(".aud-row").forEach((row, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          row,
          { autoAlpha: 0, x: fromLeft ? -24 : 24 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          },
        );
      });
    }

    /* ───────────── STEPS, PLANS & CTA ───────────── */
    if (!reduce) {
      const steps = $$(".step");
      if (steps.length) {
        gsap.set(steps, { autoAlpha: 0, y: 24 });
        gsap.to(steps, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.16,
          ease: "power2.out",
          scrollTrigger: { trigger: ".steps", start: "top 88%" },
        });
      }

      const plans = $$(".plan");
      if (plans.length) {
        gsap.set(plans, { autoAlpha: 0, y: 28, scale: 0.98 });
        gsap.to(plans, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: ".plans", start: "top 88%" },
        });
      }

      const ctaSection = $(".cta");
      if (ctaSection) {
        const ctaChildren = $$(".cta .wrap > *");
        gsap.set(ctaChildren, { autoAlpha: 0, y: 28 });
        gsap.to(ctaChildren, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ctaSection, start: "top 82%" },
        });
      }

      const footCols = $$(".foot > div");
      if (footCols.length) {
        gsap.set(footCols, { autoAlpha: 0, y: 16 });
        gsap.to(footCols, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: "footer", start: "top 92%" },
        });
      }
    }
  }); // end gsap.context

  /* ───────────── POS INTERACTIVE DEMO ───────────── */
  const MENU: Record<string, [string, number][]> = {
    Coffee: [
      ["Espresso", 25000],
      ["Americano", 28000],
      ["Cafe Latte", 35000],
      ["Cappuccino", 35000],
      ["Mocha", 42000],
      ["Flat White", 38000],
    ],
    Pastry: [
      ["Butter Croissant", 25000],
      ["Pain au Chocolat", 32000],
      ["Cinnamon Roll", 30000],
      ["Banana Bread", 22000],
    ],
    Retail: [
      ["House Blend 250 g", 95000],
      ["Tumbler 350 ml", 150000],
      ["Drip Bags (5)", 60000],
    ],
  };
  let tab = "Coffee";
  let charging = false;
  let cart: { key: string; name: string; mods: string[]; unit: number; qty: number }[] = [
    {
      key: "Cafe Latte|oat|less",
      name: "Cafe Latte",
      mods: ["Oat milk (+10.000)", "Less sugar"],
      unit: 45000,
      qty: 2,
    },
    { key: "Butter Croissant", name: "Butter Croissant", mods: [], unit: 25000, qty: 1 },
  ];
  const ptabs = $("#ptabs");
  const items = $("#items");
  const lines = $("#cartLines");
  const foot = $("#cartFoot");

  function renderMenu() {
    if (ptabs) {
      ptabs.innerHTML = Object.keys(MENU)
        .map(
          (k) =>
            `<button class="ptab" role="tab" aria-selected="${k === tab}" data-tab="${k}">${k}</button>`,
        )
        .join("");
    }
    if (items) {
      const menuList = MENU[tab] ?? [];
      items.innerHTML = menuList
        .map(
          ([n, p]) =>
            `<button class="item" data-add="${n}" data-price="${p}"><b>${n}</b><span>${idr(p)}</span></button>`,
        )
        .join("");
    }
  }

  function totals() {
    const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0);
    const tax = Math.round(sub * 0.1);
    return { sub, tax, total: sub + tax };
  }

  function renderCart() {
    if (lines) {
      lines.innerHTML = cart.length
        ? cart
            .map(
              (l, i) => `
        <div class="cl">
          <div>
            <div class="cl-n">${l.qty}× ${l.name}</div>
            ${l.mods.map((m) => `<div class="cl-m">${m}</div>`).join("")}
            <div class="stepper">
              <button data-dec="${i}" aria-label="Remove one ${l.name}">−</button>
              <button data-inc="${i}" aria-label="Add one ${l.name}">+</button>
            </div>
          </div>
          <div class="cl-p">${idr(l.unit * l.qty)}</div>
        </div>`,
            )
            .join("")
        : '<p class="cart-empty">Select items to start an order.</p>';
    }
    const t = totals();
    if (foot) {
      foot.innerHTML = `
        <div class="tot"><span>Subtotal</span><span>${idr(t.sub)}</span></div>
        <div class="tot"><span>Tax (PB1, 10%)</span><span>${idr(t.tax)}</span></div>
        <div class="tot grand"><span>Total</span><span>Rp ${idr(t.total)}</span></div>
        <button class="charge${charging ? " paid" : ""}" data-charge ${!cart.length && !charging ? "disabled" : ""}>
          ${charging ? `✓ Paid · Order #${nextOrder - 1}` : `Charge Rp ${idr(t.total)}`}
        </button>`;
    }
  }

  document.addEventListener(
    "click",
    (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const t = target.closest<HTMLElement>(
        "[data-tab],[data-add],[data-inc],[data-dec],[data-charge]",
      );
      if (!t || (charging && !t.matches("[data-tab]"))) return;

      if (t.dataset["tab"]) {
        tab = t.dataset["tab"];
        renderMenu();
        const activeTabBtn = $(`[data-tab="${tab}"]`);
        if (activeTabBtn) activeTabBtn.focus();
        return;
      }
      if (t.dataset["add"]) {
        const key = t.dataset["add"];
        const ex = cart.find((l) => l.key === key);
        if (ex) ex.qty++;
        else cart.push({ key, name: key, mods: [], unit: Number(t.dataset["price"]), qty: 1 });
        t.classList.add("hit");
        setTimeout(() => t.classList.remove("hit"), 220);
        renderCart();
        if (lines) lines.scrollTop = lines.scrollHeight;
        return;
      }
      if (t.dataset["inc"]) {
        const item = cart[Number(t.dataset["inc"])];
        if (item) {
          item.qty++;
          renderCart();
        }
        return;
      }
      if (t.dataset["dec"]) {
        const idx = Number(t.dataset["dec"]);
        const l = cart[idx];
        if (l) {
          l.qty--;
          if (l.qty <= 0) cart.splice(idx, 1);
          renderCart();
        }
        return;
      }
      if (t.hasAttribute("data-charge")) {
        if (!cart.length) return;
        charging = true;
        nextOrder++;
        renderCart();
        setTimeout(() => {
          cart = [];
          charging = false;
          renderCart();
        }, 1800);
      }
    },
    { signal: ac.signal },
  );

  renderMenu();
  renderCart();

  /* ───────────── KDS INTERACTIVE DEMO ───────────── */
  const STAGES = ["New", "Preparing", "Ready", "Completed"];
  const ACT = ["Start preparing", "Mark ready", "Complete"];
  const nowMs = () => Date.now();

  type KDSTicketItem = [string, string, string[]];

  interface KDSTicket {
    id: number;
    age: number;
    stage: number;
    items: KDSTicketItem[];
    start: number;
    end: number | null;
  }

  interface RawKDSTicket {
    id: number;
    age: number;
    stage: number;
    items: KDSTicketItem[];
  }

  const rawTickets: RawKDSTicket[] = [
    {
      id: 1043,
      age: 42,
      stage: 0,
      items: [
        ["2×", "Cafe Latte", ["Oat milk", "Less sugar"]],
        ["1×", "Butter Croissant", ["!Warm up"]],
      ],
    },
    {
      id: 1044,
      age: 15,
      stage: 0,
      items: [
        ["1×", "Cappuccino", []],
        ["1×", "Banana Bread", []],
      ],
    },
    {
      id: 1042,
      age: 312,
      stage: 1,
      items: [
        ["3×", "Americano", []],
        ["1×", "Flat White", ["Extra shot"]],
      ],
    },
    {
      id: 1041,
      age: 525,
      stage: 1,
      items: [
        ["4×", "Americano", []],
        ["2×", "Butter Croissant", ["!Warm up"]],
      ],
    },
    { id: 1040, age: 150, stage: 2, items: [["1×", "Mocha", ["Less sugar"]]] },
    { id: 1039, age: 260, stage: 3, items: [["2×", "Espresso", []]] },
  ];

  const T: KDSTicket[] = rawTickets.map((t) => ({
    ...t,
    start: nowMs() - t.age * 1000,
    end: t.stage === 3 ? nowMs() - t.age * 1000 + t.age * 1000 : null,
  }));

  const board = $("#board");
  const el = (t: KDSTicket) => Math.floor(((t.end || nowMs()) - t.start) / 1000);
  const mmss = (s: number) =>
    String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const tcls = (t: KDSTicket) => {
    if (t.stage >= 2) return "";
    const s = el(t);
    return s > 480 ? "late" : s > 300 ? "warn" : "";
  };

  function ticket(t: KDSTicket, moved?: number) {
    return `<article class="tk ${tcls(t)}${moved === t.id ? " moved" : ""}" data-tk="${t.id}">
      <div class="tk-h"><b>#${t.id}</b><span class="t" data-t="${t.id}">${mmss(el(t))}</span></div>
      <ul>${t.items
        .map(
          ([q, n, m]) =>
            `<li><b>${q} ${n}</b>${m.map((x) => (x[0] === "!" ? `<div class="hot">${x.slice(1)}</div>` : `<div>— ${x}</div>`)).join("")}</li>`,
        )
        .join("")}</ul>
      ${t.stage < 3 ? `<button class="kbtn" data-adv="${t.id}">${ACT[t.stage]}</button>` : ""}
    </article>`;
  }

  function renderKDS(moved?: number) {
    if (board) {
      board.innerHTML = STAGES.map((s, i) => {
        const list = T.filter((t) => t.stage === i);
        const shown = i === 3 ? list.slice(-3) : list;
        return `<section class="kcol" aria-label="${s}">
          <h3 class="kh"><span>${s}</span><span class="kc">${list.length}</span></h3>
          ${shown.map((t) => ticket(t, moved)).join("") || '<p class="kempty">No tickets</p>'}
        </section>`;
      }).join("");
    }
  }

  if (board) {
    board.addEventListener(
      "click",
      (e: Event) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const b = target.closest<HTMLElement>("[data-adv]");
        if (!b) return;
        const t = T.find((x) => x.id === Number(b.dataset["adv"]));
        if (!t) return;
        t.stage++;
        if (t.stage === 3) t.end = nowMs();
        renderKDS(t.id);
        const nb = board.querySelector<HTMLElement>(`[data-adv="${t.id}"]`);
        if (nb) nb.focus();
      },
      { signal: ac.signal },
    );
  }

  const kdsIv = setInterval(() => {
    if (!board) return;
    $$("[data-t]", board).forEach((s) => {
      const t = T.find((x) => x.id === Number(s.dataset["t"]));
      if (!t || t.stage === 3) return;
      s.textContent = mmss(el(t));
      const a = s.closest<HTMLElement>(".tk");
      if (a) {
        const c = tcls(t);
        a.classList.toggle("late", c === "late");
        a.classList.toggle("warn", c === "warn");
      }
    });
  }, 1000);
  ac.signal.addEventListener("abort", () => clearInterval(kdsIv));
  renderKDS();

  /* ───────────── INVENTORY & RECIPES DEMO ───────────── */
  interface StockItem {
    n: string;
    v: number;
    u: string;
    low: number;
  }
  interface StockData {
    beans: StockItem;
    milk: StockItem;
    cup: StockItem;
    oat: StockItem;
  }

  const stock: StockData = {
    beans: { n: "Espresso beans (House Blend)", v: 4200, u: "g", low: 1000 },
    milk: { n: "Fresh milk", v: 9500, u: "ml", low: 2000 },
    cup: { n: "Paper cup 8 oz", v: 1240, u: "pcs", low: 200 },
    oat: { n: "Oat milk (Barista Ed)", v: 2500, u: "ml", low: 3000 },
  };
  const ledger: { t: string; ty: string; it: string; ch: string; ref: string; pos?: boolean }[] = [
    { t: "14:09", ty: "Adjustment", it: "Fresh milk", ch: "−500 ml", ref: "Spillage · Rina S." },
    { t: "14:02", ty: "Sale", it: "Paper cup 8 oz", ch: "−4 pcs", ref: "Order #1041" },
    {
      t: "13:52",
      ty: "Restock",
      it: "Espresso beans",
      ch: "+5,000 g",
      ref: "Shift 2 · Central Hub",
      pos: true,
    },
  ];
  let clock = 14 * 60 + 22;
  const sTb = $("#stockTbl tbody");
  const lTb = $("#ledgerTbl tbody");

  function renderStock(deltas?: Partial<Record<keyof StockData, number>>) {
    if (sTb) {
      sTb.innerHTML = (Object.entries(stock) as [keyof StockData, StockItem][])
        .map(([k, s]) => {
          const low = s.v < s.low;
          const deltaVal = deltas?.[k];
          const d = deltaVal ? `<span class="delta">−${deltaVal} ${s.u}</span>` : "";
          return `<tr>
            <td>${s.n}</td>
            <td class="r tnum">${qty(s.v)} ${s.u}${d}</td>
            <td><span class="status-text ${low ? "status-low" : "status-optimal"}">${low ? "Low stock" : "Optimal"}</span></td>
          </tr>`;
        })
        .join("");
    }
  }

  function renderLedger(fresh?: number) {
    if (lTb) {
      lTb.innerHTML = ledger
        .slice(0, 6)
        .map(
          (r, i) =>
            `<tr class="${fresh && i < fresh ? "new" : ""}">
              <td>${r.t}</td>
              <td>${r.ty}</td>
              <td>${r.it}</td>
              <td class="r tnum ${r.pos ? "pos-v" : "neg"}">${r.ch}</td>
              <td>${r.ref}</td>
            </tr>`,
        )
        .join("");
    }
  }

  const chain = $$("#chain li");
  const sell = $("#sellBtn") as HTMLButtonElement | null;
  let busy = false;
  if (sell) {
    sell.addEventListener(
      "click",
      () => {
        if (busy) return;
        busy = true;
        sell.disabled = true;
        sell.style.opacity = ".6";
        chain.forEach((li) => li.classList.remove("on"));
        const step = reduce ? 0 : 220;
        const order = nextOrder++;
        chain.forEach((li, i) =>
          setTimeout(() => {
            li.classList.add("on");
            if (i === 3) {
              stock.beans.v -= 18;
              stock.milk.v -= 150;
              stock.cup.v -= 1;
              renderStock({ beans: 18, milk: 150, cup: 1 });
            }
            if (i === 4) {
              clock++;
              const t = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, "0")}`;
              const ref = `Order #${order}`;
              ledger.unshift(
                { t, ty: "Sale", it: "Paper cup 8 oz", ch: "−1 pcs", ref },
                { t, ty: "Sale", it: "Fresh milk", ch: "−150 ml", ref },
                { t, ty: "Sale", it: "Espresso beans", ch: "−18 g", ref },
              );
              renderLedger(3);
              busy = false;
              sell.disabled = false;
              sell.style.opacity = "";
            }
          }, i * step),
        );
      },
      { signal: ac.signal },
    );
  }
  renderStock();
  renderLedger();

  /* ───────────── MULTI-BRANCH HQ TABS DEMO ───────────── */
  interface BranchTabData {
    h: string[];
    rows: (string | number)[][];
    f: (r: (string | number)[]) => string;
    al: number[];
  }

  const B: Record<string, BranchTabData> = {
    sales: {
      h: ["Branch", "Transactions", "Net sales", "Share of today"],
      rows: [
        ["Central Hub", "351", "Rp 18.45M", 43],
        ["North Outlet", "279", "Rp 14.10M", 33],
        ["South Kiosk", "212", "Rp 10.30M", 24],
      ],
      f: (r) =>
        `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td class="r tnum">${r[2]}</td><td><span class="share" style="width:${Number(r[3]) * 1.2}px"></span><span class="tnum">${r[3]}%</span></td>`,
      al: [0, 1, 1, 0],
    },
    inventory: {
      h: ["Branch", "Low-stock items", "Most urgent"],
      rows: [
        ["Central Hub", "5", "Oat milk (Barista Ed) · 2,500 ml"],
        ["North Outlet", "4", "Vanilla syrup · 400 ml"],
        ["South Kiosk", "3", "Paper cup 8 oz · 140 pcs"],
      ],
      f: (r) => `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td>`,
      al: [0, 1, 0],
    },
    cash: {
      h: ["Branch", "Open shifts", "Cashiers on shift", "Drawer expected"],
      rows: [
        ["Central Hub", "2", "Andi K., Maya P.", "Rp 6.18M"],
        ["North Outlet", "1", "Dewi A.", "Rp 3.40M"],
        ["South Kiosk", "1", "Raka S.", "Rp 2.15M"],
      ],
      f: (r) =>
        `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td><td class="r tnum">${r[3]}</td>`,
      al: [0, 1, 0, 1],
    },
    status: {
      h: ["Branch", "Connection", "Last sync"],
      rows: [
        ["Central Hub", '<span class="status-text status-online">Online</span>', "Just now"],
        ["North Outlet", '<span class="status-text status-online">Online</span>', "Just now"],
        [
          "South Kiosk",
          '<span class="status-text status-syncing">Syncing</span>',
          "2 min ago · 3 orders queued",
        ],
      ],
      f: (r) => `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`,
      al: [0, 0, 0],
    },
  };
  const bpanel = $("#bpanel");
  const btabs = $$("#btabs [data-bt]");

  function showB(k: string) {
    const d = B[k];
    if (!d) return;
    if (bpanel) {
      bpanel.innerHTML = `<table class="tbl">
        <thead><tr>${d.h.map((x, i) => `<th class="${d.al[i] ? "r" : ""}">${x}</th>`).join("")}</tr></thead>
        <tbody>${d.rows.map((r) => `<tr>${d.f(r)}</tr>`).join("")}</tbody>
      </table>`;
      bpanel.setAttribute("aria-labelledby", "bt-" + k);
    }
    btabs.forEach((b) => {
      const on = b.dataset["bt"] === k;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  btabs.forEach((b, i) => {
    b.addEventListener(
      "click",
      () => {
        const key = b.dataset["bt"];
        if (key) showB(key);
      },
      { signal: ac.signal },
    );
    b.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const nextIdx = (i + (e.key === "ArrowRight" ? 1 : btabs.length - 1)) % btabs.length;
        const n = btabs[nextIdx];
        if (!n) return;
        const nextKey = n.dataset["bt"];
        if (nextKey) {
          showB(nextKey);
          n.focus();
        }
      },
      { signal: ac.signal },
    );
  });
  showB("sales");

  /* ───────────── APEIRON BOUNDLESS VORTEX (3D COSMIC HERO ENGINE) ───────────── */
  let vortexCanvas = document.getElementById("apeiron-vortex-canvas") as HTMLCanvasElement | null;
  const heroCanvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
  if (heroCanvas) {
    if (
      !vortexCanvas ||
      (typeof HTMLCanvasElement !== "undefined" &&
        heroCanvas.getContext !== HTMLCanvasElement.prototype.getContext &&
        vortexCanvas.getContext === HTMLCanvasElement.prototype.getContext)
    ) {
      vortexCanvas = heroCanvas;
    }
  }

  const cleanupVortex = initApeironVortex(vortexCanvas, {
    reducedMotion: reduce,
  });

  /* ───────────── CLEANUP ON ROUTE UNMOUNT ───────────── */
  return () => {
    document.body.classList.remove("mega-open");
    ac.abort();
    cleanupVortex();
    ctx.revert();
    if (lenis && tickLenis) {
      gsap.ticker.remove(tickLenis);
      lenis.destroy();
    }
  };
}
