"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod,
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/marketing/interactions.ts
var interactions_exports = {};
__export(interactions_exports, {
  initMarketing: () => initMarketing,
});
module.exports = __toCommonJS(interactions_exports);
var import_gsap = __toESM(require("gsap"), 1);
var import_ScrollTrigger = require("gsap/ScrollTrigger");
var import_lenis = __toESM(require("lenis"), 1);
function initMarketing() {
  const ac = new AbortController();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const idr = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const qty = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let nextOrder = 1045;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  import_gsap.default.registerPlugin(import_ScrollTrigger.ScrollTrigger);
  const lenis = reduce
    ? null
    : new import_lenis.default({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  if (lenis) {
    lenis.on("scroll", import_ScrollTrigger.ScrollTrigger.update);
    const tickLenis2 = (time) => {
      lenis.raf(time * 1e3);
    };
    import_gsap.default.ticker.add(tickLenis2);
    import_gsap.default.ticker.lagSmoothing(0);
  }
  const ctx = import_gsap.default.context(() => {
    const nav = $("#nav"),
      burger = $("#burger"),
      menu = $("#menu");
    if (burger && menu && nav) {
      burger.addEventListener(
        "click",
        () => {
          const open = menu.hidden;
          menu.hidden = !open;
          burger.setAttribute("aria-expanded", String(open));
          burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
          nav.classList.toggle("scrolled", open || scrollY > 12);
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
    }
    import_ScrollTrigger.ScrollTrigger.create({
      start: 1,
      end: "max",
      onUpdate: () => {
        nav.classList.toggle("scrolled", window.scrollY > 12 || !menu.hidden);
      },
    });
    const heroTl = import_gsap.default.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    const inEls = $$("[data-in]");
    if (!reduce && inEls.length) {
      import_gsap.default.set(inEls, { autoAlpha: 0, y: 28 });
      heroTl.to(inEls, { autoAlpha: 1, y: 0, stagger: 0.1, delay: 0.15 });
    }
    const H = [2.1, 4.6, 5.4, 4.8, 6.3, 9.7, 8.2, 1.75],
      MAX = 9.7;
    const barsEl = $("#bars"),
      blabelsEl = $("#blabels");
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
    if (!reduce) {
      heroTl.fromTo(
        "#bars i",
        { height: "0%" },
        {
          height: (_, el2) => `${el2.dataset.h}%`,
          duration: 0.9,
          stagger: 0.035,
          ease: "power2.out",
        },
        "-=0.6",
      );
    } else {
      $$("#bars i").forEach((el2) => {
        el2.style.height = `${el2.dataset.h}%`;
      });
    }
    const stage = $("#stage"),
      tilt = $("#tilt");
    if (!reduce && stage && tilt) {
      import_gsap.default.fromTo(
        tilt,
        { rotateX: 8, scale: 0.95 },
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
      const fPos = $(".f-pos"),
        fAlert = $(".f-alert");
      if (fPos) {
        import_gsap.default.fromTo(
          fPos,
          { y: 20, autoAlpha: 0 },
          {
            y: -24,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top 80%", end: "top 10%", scrub: 1.5 },
          },
        );
      }
      if (fAlert) {
        import_gsap.default.fromTo(
          fAlert,
          { y: 30, autoAlpha: 0 },
          {
            y: -18,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: stage, start: "top 75%", end: "top 15%", scrub: 1.8 },
          },
        );
      }
      const heroText = $$(
        ".hero-in > .eyebrow, .hero-in > .h-xl, .hero-in > .lead, .hero-in > .btn-row",
      );
      if (heroText.length) {
        import_gsap.default.to(heroText, {
          y: -60,
          autoAlpha: 0,
          ease: "none",
          stagger: 0.02,
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "60% top",
            scrub: 1,
          },
        });
      }
    }
    const storyP = $$("#storyList p");
    if (!reduce && storyP.length) {
      storyP.forEach((p, i) => {
        const isLast = i === storyP.length - 1;
        const tl = import_gsap.default.timeline({
          scrollTrigger: {
            trigger: p,
            start: "top 85%",
            end: isLast ? "center 40%" : "bottom 30%",
            scrub: 0.8,
          },
        });
        tl.fromTo(p, { opacity: 0.12, y: 20 }, { opacity: 1, y: 0, duration: 1 });
        if (!isLast) {
          tl.to(p, { opacity: 0.12, duration: 0.6 }, "+=0.3");
        }
      });
    }
    if (!reduce) {
      $$(".sec, .kds, .integrity").forEach((sec) => {
        const head = sec.querySelector(".sec-head, .int-top");
        if (!head) return;
        const children = [...head.children];
        import_gsap.default.set(children, { autoAlpha: 0, y: 30 });
        import_gsap.default.to(children, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: head, start: "top 88%" },
        });
      });
      $$(".sheet, .board, .br, .log, .inv").forEach((el2) => {
        import_gsap.default.fromTo(
          el2,
          { autoAlpha: 0, y: 40, scale: 0.97 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: el2, start: "top 90%" },
          },
        );
      });
    }
    const diag = $(".diagram");
    if (diag) {
      const edges = $$(".edge", diag);
      const arrows = $$(".arrow", diag);
      const ties = $$(".tie", diag);
      if (!reduce) {
        const diagTl = import_gsap.default.timeline({
          scrollTrigger: {
            trigger: diag,
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1.5,
          },
        });
        diagTl.fromTo(
          edges,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, stagger: 0.08, ease: "none" },
        );
        diagTl.to(arrows, { autoAlpha: 1, duration: 0.3, stagger: 0.06 }, "-=0.6");
        diagTl.to(ties, { autoAlpha: 0.8, duration: 0.5, stagger: 0.08 }, "-=0.3");
      } else {
        import_gsap.default.set(edges, { strokeDashoffset: 0 });
        import_gsap.default.set(arrows, { autoAlpha: 1 });
        import_gsap.default.set(ties, { autoAlpha: 0.8 });
      }
    }
    const brL = $(".br-l");
    if (brL) {
      const edges = $$(".edge", brL);
      const arrow = $(".arrow", brL);
      if (!reduce) {
        const brTl = import_gsap.default.timeline({
          scrollTrigger: { trigger: brL, start: "top 80%", end: "bottom 50%", scrub: 1.2 },
        });
        brTl.fromTo(
          edges,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1, stagger: 0.12, ease: "none" },
        );
        if (arrow) brTl.to(arrow, { autoAlpha: 1, duration: 0.3 }, "-=0.3");
      } else {
        import_gsap.default.set(edges, { strokeDashoffset: 0 });
        if (arrow) import_gsap.default.set(arrow, { autoAlpha: 1 });
      }
    }
    if (!reduce) {
      const pillars = $$(".pillar");
      if (pillars.length) {
        import_gsap.default.set(pillars, { autoAlpha: 0, y: 24 });
        import_gsap.default.to(pillars, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ".pillars", start: "top 88%" },
        });
      }
      const logItems = $$(".log li");
      if (logItems.length) {
        import_gsap.default.set(logItems, { autoAlpha: 0, x: -12 });
        import_gsap.default.to(logItems, {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".log", start: "top 82%" },
        });
      }
    }
    if (!reduce) {
      const philH2 = $(".phil h2");
      const philSerif = $(".phil .serif");
      const philLead = $(".phil .lead");
      if (philH2) {
        import_gsap.default.fromTo(
          philH2,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: ".phil", start: "top 80%" },
          },
        );
      }
      if (philSerif) {
        import_gsap.default.fromTo(
          philSerif,
          { autoAlpha: 0, x: -30 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: ".phil", start: "top 72%" },
          },
        );
      }
      if (philLead) {
        import_gsap.default.fromTo(
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
    }
    if (!reduce) {
      $$(".aud-row").forEach((row, i) => {
        const fromLeft = i % 2 === 0;
        import_gsap.default.fromTo(
          row,
          { autoAlpha: 0, x: fromLeft ? -30 : 30 },
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
    if (!reduce) {
      const steps = $$(".step");
      if (steps.length) {
        import_gsap.default.set(steps, { autoAlpha: 0, y: 24 });
        import_gsap.default.to(steps, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.18,
          ease: "power2.out",
          scrollTrigger: { trigger: ".steps", start: "top 88%" },
        });
      }
    }
    if (!reduce) {
      const plans = $$(".plan");
      if (plans.length) {
        import_gsap.default.set(plans, { autoAlpha: 0, y: 30, scale: 0.97 });
        import_gsap.default.to(plans, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: ".plans", start: "top 88%" },
        });
      }
    }
    if (!reduce) {
      const ctaSection = $(".cta");
      if (ctaSection) {
        const ctaChildren = $$(".cta .wrap > *");
        import_gsap.default.set(ctaChildren, { autoAlpha: 0, y: 30 });
        import_gsap.default.to(ctaChildren, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ctaSection, start: "top 82%" },
        });
      }
    }
    if (!reduce) {
      const footCols = $$(".foot > div");
      if (footCols.length) {
        import_gsap.default.set(footCols, { autoAlpha: 0, y: 16 });
        import_gsap.default.to(footCols, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: "footer", start: "top 92%" },
        });
      }
    }
  });
  const MENU = {
    Coffee: [
      ["Espresso", 25e3],
      ["Americano", 28e3],
      ["Cafe Latte", 35e3],
      ["Cappuccino", 35e3],
      ["Mocha", 42e3],
      ["Flat White", 38e3],
    ],
    Pastry: [
      ["Butter Croissant", 25e3],
      ["Pain au Chocolat", 32e3],
      ["Cinnamon Roll", 3e4],
      ["Banana Bread", 22e3],
    ],
    Retail: [
      ["House Blend 250 g", 95e3],
      ["Tumbler 350 ml", 15e4],
      ["Drip Bags (5)", 6e4],
    ],
  };
  let tab = "Coffee",
    charging = false;
  let cart = [
    {
      key: "Cafe Latte|oat|less",
      name: "Cafe Latte",
      mods: ["Oat milk (+10.000)", "Less sugar"],
      unit: 45e3,
      qty: 2,
    },
    { key: "Butter Croissant", name: "Butter Croissant", mods: [], unit: 25e3, qty: 1 },
  ];
  const ptabs = $("#ptabs"),
    items = $("#items"),
    lines = $("#cartLines"),
    foot = $("#cartFoot");
  function renderMenu() {
    if (ptabs)
      ptabs.innerHTML = Object.keys(MENU)
        .map(
          (k) =>
            `<button class="ptab" role="tab" aria-selected="${k === tab}" data-tab="${k}">${k}</button>`,
        )
        .join("");
    if (items)
      items.innerHTML = MENU[tab]
        .map(
          ([n, p]) =>
            `<button class="item" data-add="${n}" data-price="${p}"><b>${n}</b><span>${idr(p)}</span></button>`,
        )
        .join("");
  }
  function totals() {
    const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0);
    const tax = Math.round(sub * 0.1);
    return { sub, tax, total: sub + tax };
  }
  function renderCart() {
    if (lines)
      lines.innerHTML = cart.length
        ? cart
            .map(
              (l, i) => `
      <div class="cl"><div><div class="cl-n">${l.qty}\xD7 ${l.name}</div>${l.mods.map((m) => `<div class="cl-m">${m}</div>`).join("")}
        <div class="stepper"><button data-dec="${i}" aria-label="Remove one ${l.name}">\u2212</button><button data-inc="${i}" aria-label="Add one ${l.name}">+</button></div></div>
        <div class="cl-p">${idr(l.unit * l.qty)}</div></div>`,
            )
            .join("")
        : '<p class="cart-empty">Select items to start an order.</p>';
    const t = totals();
    if (foot)
      foot.innerHTML = `<div class="tot"><span>Subtotal</span><span>${idr(t.sub)}</span></div>
      <div class="tot"><span>Tax (PB1, 10%)</span><span>${idr(t.tax)}</span></div>
      <div class="tot grand"><span>Total</span><span>Rp ${idr(t.total)}</span></div>
      <button class="charge${charging ? " paid" : ""}" data-charge ${!cart.length && !charging ? "disabled" : ""}>${charging ? `Paid \xB7 Order #${nextOrder - 1}` : `Charge Rp ${idr(t.total)}`}</button>`;
  }
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target.closest("[data-tab],[data-add],[data-inc],[data-dec],[data-charge]");
      if (!t || (charging && !t.matches("[data-tab]"))) return;
      if (t.dataset.tab) {
        tab = t.dataset.tab;
        renderMenu();
        $(`[data-tab="${tab}"]`).focus();
        return;
      }
      if (t.dataset.add) {
        const key = t.dataset.add;
        const ex = cart.find((l) => l.key === key);
        if (ex) ex.qty++;
        else cart.push({ key, name: key, mods: [], unit: +t.dataset.price, qty: 1 });
        t.classList.add("hit");
        setTimeout(() => t.classList.remove("hit"), 260);
        renderCart();
        lines.scrollTop = lines.scrollHeight;
        return;
      }
      if (t.dataset.inc) {
        cart[+t.dataset.inc].qty++;
        renderCart();
        return;
      }
      if (t.dataset.dec) {
        const l = cart[+t.dataset.dec];
        l.qty--;
        if (l.qty <= 0) cart.splice(+t.dataset.dec, 1);
        renderCart();
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
  const STAGES = ["New", "Preparing", "Ready", "Completed"],
    ACT = ["Start preparing", "Mark ready", "Complete"];
  const nowMs = () => Date.now();
  const T = [
    {
      id: 1043,
      age: 42,
      stage: 0,
      items: [
        ["2\xD7", "Cafe Latte", ["Oat milk", "Less sugar"]],
        ["1\xD7", "Butter Croissant", ["!Warm up"]],
      ],
    },
    {
      id: 1044,
      age: 15,
      stage: 0,
      items: [
        ["1\xD7", "Cappuccino", []],
        ["1\xD7", "Banana Bread", []],
      ],
    },
    {
      id: 1042,
      age: 312,
      stage: 1,
      items: [
        ["3\xD7", "Americano", []],
        ["1\xD7", "Flat White", ["Extra shot"]],
      ],
    },
    {
      id: 1041,
      age: 525,
      stage: 1,
      items: [
        ["4\xD7", "Americano", []],
        ["2\xD7", "Butter Croissant", ["!Warm up"]],
      ],
    },
    { id: 1040, age: 150, stage: 2, items: [["1\xD7", "Mocha", ["Less sugar"]]] },
    { id: 1039, age: 260, stage: 3, items: [["2\xD7", "Espresso", []]] },
  ].map((t) => ({
    ...t,
    start: nowMs() - t.age * 1e3,
    end: t.stage === 3 ? nowMs() - t.age * 1e3 + t.age * 1e3 : null,
  }));
  const board = $("#board");
  const el = (t) => Math.floor(((t.end || nowMs()) - t.start) / 1e3);
  const mmss = (s) =>
    String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  const tcls = (t) => {
    if (t.stage >= 2) return "";
    const s = el(t);
    return s > 480 ? "late" : s > 300 ? "warn" : "";
  };
  function ticket(t, moved) {
    return `<article class="tk ${tcls(t)}${moved === t.id ? " moved" : ""}" data-tk="${t.id}">
      <div class="tk-h"><b>#${t.id}</b><span class="t" data-t="${t.id}">${mmss(el(t))}</span></div>
      <ul>${t.items.map(([q, n, m]) => `<li><b>${q} ${n}</b>${m.map((x) => (x[0] === "!" ? `<div class="hot">${x.slice(1)}</div>` : `<div>\u2014 ${x}</div>`)).join("")}</li>`).join("")}</ul>
      ${t.stage < 3 ? `<button class="kbtn" data-adv="${t.id}">${ACT[t.stage]}</button>` : ""}</article>`;
  }
  function renderKDS(moved) {
    if (board)
      board.innerHTML = STAGES.map((s, i) => {
        const list = T.filter((t) => t.stage === i);
        const shown = i === 3 ? list.slice(-3) : list;
        return `<section class="kcol" aria-label="${s}"><h3 class="kh"><span>${s}</span><span class="kc">${list.length}</span></h3>${shown.map((t) => ticket(t, moved)).join("") || '<p class="kempty">No tickets</p>'}</section>`;
      }).join("");
  }
  if (board) {
    board.addEventListener(
      "click",
      (e) => {
        const b = e.target.closest("[data-adv]");
        if (!b) return;
        const t = T.find((x) => x.id === +b.dataset.adv);
        t.stage++;
        if (t.stage === 3) t.end = nowMs();
        renderKDS(t.id);
        const nb = board.querySelector(`[data-adv="${t.id}"]`);
        if (nb) nb.focus();
      },
      { signal: ac.signal },
    );
  }
  const iv = setInterval(() => {
    $$("[data-t]", board).forEach((s) => {
      const t = T.find((x) => x.id === +s.dataset.t);
      if (!t || t.stage === 3) return;
      s.textContent = mmss(el(t));
      const a = s.closest(".tk");
      const c = tcls(t);
      a.classList.toggle("late", c === "late");
      a.classList.toggle("warn", c === "warn");
    });
  }, 1e3);
  renderKDS();
  const stock = {
    beans: { n: "Espresso beans (House Blend)", v: 4200, u: "g", low: 1e3 },
    milk: { n: "Fresh milk", v: 9500, u: "ml", low: 2e3 },
    cup: { n: "Paper cup 8 oz", v: 1240, u: "pcs", low: 200 },
    oat: { n: "Oat milk (Barista Ed)", v: 2500, u: "ml", low: 3e3 },
  };
  const ledger = [
    {
      t: "14:09",
      ty: "Adjustment",
      it: "Fresh milk",
      ch: "\u2212500 ml",
      ref: "Spillage \xB7 Rina S.",
    },
    { t: "14:02", ty: "Sale", it: "Paper cup 8 oz", ch: "\u22124 pcs", ref: "Order #1041" },
    {
      t: "13:52",
      ty: "Restock",
      it: "Espresso beans",
      ch: "+5,000 g",
      ref: "Shift 2 \xB7 Central Hub",
      pos: true,
    },
  ];
  let clock = 14 * 60 + 22;
  const sTb = $("#stockTbl tbody"),
    lTb = $("#ledgerTbl tbody");
  function renderStock(deltas) {
    if (sTb)
      sTb.innerHTML = Object.entries(stock)
        .map(([k, s]) => {
          const low = s.v < s.low;
          const d =
            deltas && deltas[k] ? `<span class="delta">\u2212${deltas[k]} ${s.u}</span>` : "";
          return `<tr><td>${s.n}</td><td class="r tnum">${qty(s.v)} ${s.u}${d}</td><td><span class="badge ${low ? "warn" : "ok"}">${low ? "Low" : "Optimal"}</span></td></tr>`;
        })
        .join("");
  }
  function renderLedger(fresh) {
    if (lTb)
      lTb.innerHTML = ledger
        .slice(0, 6)
        .map(
          (r, i) =>
            `<tr class="${fresh && i < fresh ? "new" : ""}"><td>${r.t}</td><td>${r.ty}</td><td>${r.it}</td><td class="r tnum ${r.pos ? "pos-v" : "neg"}">${r.ch}</td><td>${r.ref}</td></tr>`,
        )
        .join("");
  }
  const chain = $$("#chain li"),
    sell = $("#sellBtn");
  let busy = false;
  if (sell)
    sell.addEventListener(
      "click",
      () => {
        if (busy) return;
        busy = true;
        sell.disabled = true;
        sell.style.opacity = ".6";
        chain.forEach((li) => li.classList.remove("on"));
        const step = reduce ? 0 : 240,
          order = nextOrder++;
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
                { t, ty: "Sale", it: "Paper cup 8 oz", ch: "\u22121 pcs", ref },
                { t, ty: "Sale", it: "Fresh milk", ch: "\u2212150 ml", ref },
                { t, ty: "Sale", it: "Espresso beans", ch: "\u221218 g", ref },
              );
              renderLedger(3);
            }
            if (i === 4) {
              busy = false;
              sell.disabled = false;
              sell.style.opacity = "";
            }
          }, i * step),
        );
      },
      { signal: ac.signal },
    );
  renderStock();
  renderLedger();
  const B = {
    sales: {
      h: ["Branch", "Transactions", "Net sales", "Share of today"],
      rows: [
        ["Central Hub", "351", "Rp 18.45M", 43],
        ["North Outlet", "279", "Rp 14.10M", 33],
        ["South Kiosk", "212", "Rp 10.30M", 24],
      ],
      f: (r) =>
        `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td class="r tnum">${r[2]}</td><td><span class="share" style="width:${r[3] * 1.2}px"></span><span class="tnum">${r[3]}%</span></td>`,
      al: [0, 1, 1, 0],
    },
    inventory: {
      h: ["Branch", "Low-stock items", "Most urgent"],
      rows: [
        ["Central Hub", "5", "Oat milk (Barista Ed) \xB7 2,500 ml"],
        ["North Outlet", "4", "Vanilla syrup \xB7 400 ml"],
        ["South Kiosk", "3", "Paper cup 8 oz \xB7 140 pcs"],
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
        ["Central Hub", '<span class="badge ok">Online</span>', "Just now"],
        ["North Outlet", '<span class="badge ok">Online</span>', "Just now"],
        [
          "South Kiosk",
          '<span class="badge warn">Syncing</span>',
          "2 min ago \xB7 3 orders queued",
        ],
      ],
      f: (r) => `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`,
      al: [0, 0, 0],
    },
  };
  const bpanel = $("#bpanel"),
    btabs = $$("#btabs [data-bt]");
  function showB(k) {
    const d = B[k];
    if (bpanel)
      bpanel.innerHTML = `<table class="tbl"><thead><tr>${d.h.map((x, i) => `<th class="${d.al[i] ? "r" : ""}">${x}</th>`).join("")}</tr></thead><tbody>${d.rows.map((r) => `<tr>${d.f(r)}</tr>`).join("")}</tbody></table>`;
    btabs.forEach((b) => {
      const on = b.dataset.bt === k;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    if (bpanel) bpanel.setAttribute("aria-labelledby", "bt-" + k);
  }
  btabs.forEach((b, i) => {
    b.addEventListener("click", () => showB(b.dataset.bt), { signal: ac.signal });
    b.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const n = btabs[(i + (e.key === "ArrowRight" ? 1 : btabs.length - 1)) % btabs.length];
        showB(n.dataset.bt);
        n.focus();
      },
      { signal: ac.signal },
    );
  });
  showB("sales");
  function initParticles() {
    if (reduce) return () => {};
    const canvas = document.getElementById("hero-canvas");
    const hero = document.getElementById("hero");
    if (!canvas || !hero) return () => {};
    const c2d = canvas.getContext("2d", { alpha: true });
    if (!c2d) return () => {};
    const isMobile = window.innerWidth < 760;
    const isLowPower = isMobile || navigator.hardwareConcurrency <= 4;
    const BASE_COUNT = isLowPower ? 120 : Math.min(Math.floor(window.innerWidth / 6), 250);
    const INFLUENCE_R = isMobile ? 100 : 220;
    const CONN_DIST = isMobile ? 0 : 90;
    const CONN_MAX = 3;
    let W = 0,
      H = 0,
      dpr = 1;
    let pointerX = -9999,
      pointerY = -9999;
    let pointerVx = 0,
      pointerVy = 0;
    let prevPointerX = -9999,
      prevPointerY = -9999;
    let pointerInside = false;
    let isVisible = true;
    let rafId = 0;
    let prevT = 0;
    let isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");
    const onDarkChange = (e) => {
      isDark = e.matches;
    };
    mqDark.addEventListener("change", onDarkChange);
    let px, py;
    let vx, vy;
    let bvx, bvy;
    let sz, al;
    let layer;
    let ctype;
    let count = 0;
    function spawnParticles() {
      count = BASE_COUNT;
      px = new Float32Array(count);
      py = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      bvx = new Float32Array(count);
      bvy = new Float32Array(count);
      sz = new Float32Array(count);
      al = new Float32Array(count);
      layer = new Float32Array(count);
      ctype = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        px[i] = Math.random() * W;
        py[i] = Math.random() * H;
        const depth = Math.random();
        layer[i] = depth;
        bvx[i] = (Math.random() - 0.5) * 0.25;
        bvy[i] = -0.08 - Math.random() * 0.18;
        vx[i] = bvx[i];
        vy[i] = bvy[i];
        const r = Math.random();
        if (r > 0.98) sz[i] = 2.5 + Math.random() * 2;
        else if (r > 0.85) sz[i] = 1.2 + Math.random() * 1;
        else sz[i] = 0.5 + Math.random() * 0.7;
        al[i] = 0.15 + depth * 0.45;
        const cRand = Math.random();
        if (cRand > 0.9) ctype[i] = 3;
        else if (cRand > 0.7) ctype[i] = 2;
        else if (cRand > 0.4) ctype[i] = 1;
        else ctype[i] = 0;
      }
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth || window.innerWidth;
      H = hero.clientHeight || window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      if (count === 0) spawnParticles();
    }
    function onPointerMove(e) {
      const rect = hero.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      if (!pointerInside) {
        prevPointerX = pointerX;
        prevPointerY = pointerY;
      }
      pointerInside = true;
    }
    function onPointerLeave() {
      pointerInside = false;
    }
    const visObs = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    function tick(t) {
      rafId = requestAnimationFrame(tick);
      if (!isVisible || count === 0) {
        prevT = t;
        return;
      }
      const rawDt = (t - prevT) / 16.667;
      const dt = Math.min(rawDt || 1, 3);
      prevT = t;
      if (pointerInside) {
        const rawVx = pointerX - prevPointerX;
        const rawVy = pointerY - prevPointerY;
        pointerVx += (rawVx - pointerVx) * 0.3;
        pointerVy += (rawVy - pointerVy) * 0.3;
        prevPointerX = pointerX;
        prevPointerY = pointerY;
      } else {
        pointerVx *= 0.92;
        pointerVy *= 0.92;
      }
      const rSq = INFLUENCE_R * INFLUENCE_R;
      for (let i = 0; i < count; i++) {
        const depthFactor = 0.5 + layer[i] * 0.5;
        vx[i] += (bvx[i] - vx[i]) * 0.03 * dt;
        vy[i] += (bvy[i] - vy[i]) * 0.03 * dt;
        if (pointerInside) {
          const dx = px[i] - pointerX;
          const dy = py[i] - pointerY;
          const dSq = dx * dx + dy * dy;
          if (dSq < rSq && dSq > 1) {
            const dist = Math.sqrt(dSq);
            const falloff = 1 - dist / INFLUENCE_R;
            const strength = falloff * falloff * depthFactor;
            const repel = 0.6 * strength;
            vx[i] += (dx / dist) * repel * dt;
            vy[i] += (dy / dist) * repel * dt;
            const wake = 0.08 * strength;
            vx[i] += pointerVx * wake * dt;
            vy[i] += pointerVy * wake * dt;
          }
        }
        const spd = vx[i] * vx[i] + vy[i] * vy[i];
        if (spd > 36) {
          const s = 6 / Math.sqrt(spd);
          vx[i] *= s;
          vy[i] *= s;
        }
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        if (px[i] < -10) px[i] += W + 20;
        else if (px[i] > W + 10) px[i] -= W + 20;
        if (py[i] < -10) py[i] += H + 20;
        else if (py[i] > H + 10) py[i] -= H + 20;
      }
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      c2d.clearRect(0, 0, W, H);
      if (CONN_DIST > 0) {
        const connSq = CONN_DIST * CONN_DIST;
        const lineColor = isDark ? "255,255,255" : "0,0,0";
        c2d.lineWidth = 0.5;
        for (let i = 0; i < count; i++) {
          let drawn = 0;
          for (let j = i + 1; j < count && drawn < CONN_MAX; j++) {
            const dx = px[i] - px[j];
            const dy = py[i] - py[j];
            const dSq = dx * dx + dy * dy;
            if (dSq < connSq) {
              const alpha = (1 - Math.sqrt(dSq) / CONN_DIST) * 0.08;
              c2d.strokeStyle = `rgba(${lineColor},${alpha})`;
              c2d.beginPath();
              c2d.moveTo(px[i], py[i]);
              c2d.lineTo(px[j], py[j]);
              c2d.stroke();
              drawn++;
            }
          }
        }
      }
      const colorsDark = ["255,255,255", "220,235,255", "255,230,200", "255,200,180"];
      const colorsLight = ["0,0,0", "20,40,100", "100,70,20", "100,30,30"];
      const palette = isDark ? colorsDark : colorsLight;
      for (let i = 0; i < count; i++) {
        let edgeFade = 1;
        const m = 60;
        if (py[i] < m) edgeFade = py[i] / m;
        else if (py[i] > H - m) edgeFade = (H - py[i]) / m;
        const a = al[i] * Math.max(edgeFade, 0);
        if (a < 5e-3) continue;
        c2d.fillStyle = `rgba(${palette[ctype[i]]},${a})`;
        c2d.beginPath();
        c2d.arc(px[i], py[i], sz[i], 0, 6.2832);
        c2d.fill();
      }
    }
    window.addEventListener("resize", resize);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    visObs.observe(hero);
    resize();
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      visObs.disconnect();
      mqDark.removeEventListener("change", onDarkChange);
    };
  }
  const cleanupParticles = initParticles();
  return () => {
    ac.abort();
    clearInterval(iv);
    cleanupParticles();
    ctx.revert();
    if (lenis) {
      import_gsap.default.ticker.remove(tickLenis);
      lenis.destroy();
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    initMarketing,
  });
