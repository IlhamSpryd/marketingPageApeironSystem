// @ts-nocheck
/* eslint-disable */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function initMarketing(): () => void {
  const ac = new AbortController();
  const $ = (s: string, r: any = document) => r.querySelector(s);
  const $$ = (s: string, r: any = document) => [...r.querySelectorAll(s)];
  const idr = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const qty = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let nextOrder = 1045;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════════
     GSAP + LENIS SETUP
     ═══════════════════════════════════════════════════════════════ */
  gsap.registerPlugin(ScrollTrigger);

  const lenis = reduce ? null : new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  const ctx = gsap.context(() => {

    /* ═══════════════════════════════════════════════════════════════
       NAV
       ═══════════════════════════════════════════════════════════════ */
    const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
    burger.addEventListener('click', () => {
      const open = menu.hidden; menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('scrolled', open || scrollY > 12);
    });
    $$('a', menu).forEach((a: HTMLElement) => a.addEventListener('click', () => {
      menu.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }));

    // Nav scroll state
    ScrollTrigger.create({
      start: 1,
      end: 'max',
      onUpdate: () => {
        nav.classList.toggle('scrolled', window.scrollY > 12 || !menu.hidden);
      }
    });

    /* ═══════════════════════════════════════════════════════════════
       HERO ENTRANCE — Orchestrated timeline
       ═══════════════════════════════════════════════════════════════ */
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });
    const inEls = $$('[data-in]');

    if (!reduce && inEls.length) {
      gsap.set(inEls, { autoAlpha: 0, y: 28 });
      heroTl.to(inEls, { autoAlpha: 1, y: 0, stagger: 0.1, delay: 0.15 });
    }

    /* ═══════════════════════════════════════════════════════════════
       HERO CHART — Bars grow as part of entrance
       ═══════════════════════════════════════════════════════════════ */
    const H = [2.1, 4.6, 5.4, 4.8, 6.3, 9.7, 8.2, 1.75], MAX = 9.7;
    const barsEl = $('#bars'), blabelsEl = $('#blabels');
    if (barsEl) {
      barsEl.innerHTML = Array.from({ length: 15 }, (_, i) => {
        const v = H[i]; const cls = i === 7 ? 'now' : (v ? '' : 'ghost');
        const h = v ? Math.max(6, v / MAX * 100) : 3;
        return `<i class="${cls}" data-h="${h}"></i>`;
      }).join('');
    }
    if (blabelsEl) {
      blabelsEl.innerHTML = Array.from({ length: 15 }, (_, i) =>
        `<span>${(i % 3 === 0 || i === 14) ? String(7 + i).padStart(2, '0') : ''}</span>`
      ).join('');
    }

    if (!reduce) {
      heroTl.fromTo('#bars i',
        { height: '0%' },
        { height: (_: number, el: HTMLElement) => `${el.dataset.h}%`, duration: 0.9, stagger: 0.035, ease: 'power2.out' },
        '-=0.6'
      );
    } else {
      $$('#bars i').forEach((el: HTMLElement) => { el.style.height = `${el.dataset.h}%`; });
    }

    /* ═══════════════════════════════════════════════════════════════
       HERO — Scroll-driven tilt & parallax floats (desktop only)
       ═══════════════════════════════════════════════════════════════ */
    const stage = $('#stage'), tilt = $('#tilt');

    if (!reduce && stage && tilt) {
      // Scrubbed perspective flatten
      gsap.fromTo(tilt,
        { rotateX: 8, scale: 0.95 },
        {
          rotateX: 0, scale: 1, ease: 'none',
          scrollTrigger: {
            trigger: stage, start: 'top 90%', end: 'top 20%', scrub: 1.2
          }
        }
      );

      // Float cards parallax with scroll
      const fPos = $('.f-pos'), fAlert = $('.f-alert');
      if (fPos) {
        gsap.fromTo(fPos,
          { y: 20, autoAlpha: 0 },
          {
            y: -24, autoAlpha: 1, ease: 'none',
            scrollTrigger: { trigger: stage, start: 'top 80%', end: 'top 10%', scrub: 1.5 }
          }
        );
      }
      if (fAlert) {
        gsap.fromTo(fAlert,
          { y: 30, autoAlpha: 0 },
          {
            y: -18, autoAlpha: 1, ease: 'none',
            scrollTrigger: { trigger: stage, start: 'top 75%', end: 'top 15%', scrub: 1.8 }
          }
        );
      }

      // Hero text parallax on scroll-out
      const heroText = $$('.hero-in > .eyebrow, .hero-in > .h-xl, .hero-in > .lead, .hero-in > .btn-row');
      if (heroText.length) {
        gsap.to(heroText, {
          y: -60, autoAlpha: 0, ease: 'none',
          stagger: 0.02,
          scrollTrigger: {
            trigger: '.hero', start: 'top top', end: '60% top', scrub: 1
          }
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       STORY — Pinned scroll-driven text focus (desktop)
       Each paragraph fades in and out as the user scrolls through,
       creating a reading-pace-controlled narrative.
       ═══════════════════════════════════════════════════════════════ */
    const storyP = $$('#storyList p');
    if (!reduce && storyP.length) {
      // Each paragraph gets its own scrubbed opacity timeline
      storyP.forEach((p: HTMLElement, i: number) => {
        const isLast = i === storyP.length - 1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: p,
            start: 'top 85%',
            end: isLast ? 'center 40%' : 'bottom 30%',
            scrub: 0.8
          }
        });

        tl.fromTo(p, { opacity: 0.12, y: 20 }, { opacity: 1, y: 0, duration: 1 });
        if (!isLast) {
          tl.to(p, { opacity: 0.12, duration: 0.6 }, '+=0.3');
        }
      });
    }

    /* ═══════════════════════════════════════════════════════════════
       SECTION HEADS — Scroll-triggered stagger reveals
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      $$('.sec, .kds, .integrity').forEach((sec: HTMLElement) => {
        const head = sec.querySelector('.sec-head, .int-top');
        if (!head) return;
        const children = [...head.children];
        gsap.set(children, { autoAlpha: 0, y: 30 });
        gsap.to(children, {
          autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: head, start: 'top 88%' }
        });
      });

      // Product demo sheets — scale/fade reveal
      $$('.sheet, .board, .br, .log, .inv').forEach((el: HTMLElement) => {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 40, scale: 0.97 },
          {
            autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' }
          }
        );
      });
    }

    /* ═══════════════════════════════════════════════════════════════
       SYSTEM DIAGRAM — Scrubbed edge drawing
       ═══════════════════════════════════════════════════════════════ */
    const diag = $('.diagram');
    if (diag) {
      const edges = $$('.edge', diag);
      const arrows = $$('.arrow', diag);
      const ties = $$('.tie', diag);

      if (!reduce) {
        const diagTl = gsap.timeline({
          scrollTrigger: {
            trigger: diag, start: 'top 80%', end: 'bottom 60%', scrub: 1.5
          }
        });
        diagTl.fromTo(edges, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.08, ease: 'none' });
        diagTl.to(arrows, { autoAlpha: 1, duration: 0.3, stagger: 0.06 }, '-=0.6');
        diagTl.to(ties, { autoAlpha: 0.8, duration: 0.5, stagger: 0.08 }, '-=0.3');
      } else {
        gsap.set(edges, { strokeDashoffset: 0 });
        gsap.set(arrows, { autoAlpha: 1 });
        gsap.set(ties, { autoAlpha: 0.8 });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       BRANCHES DIAGRAM — Scrubbed edge drawing
       ═══════════════════════════════════════════════════════════════ */
    const brL = $('.br-l');
    if (brL) {
      const edges = $$('.edge', brL);
      const arrow = $('.arrow', brL);

      if (!reduce) {
        const brTl = gsap.timeline({
          scrollTrigger: { trigger: brL, start: 'top 80%', end: 'bottom 50%', scrub: 1.2 }
        });
        brTl.fromTo(edges, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.12, ease: 'none' });
        if (arrow) brTl.to(arrow, { autoAlpha: 1, duration: 0.3 }, '-=0.3');
      } else {
        gsap.set(edges, { strokeDashoffset: 0 });
        if (arrow) gsap.set(arrow, { autoAlpha: 1 });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       INTEGRITY — Scrubbed pillar reveal
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const pillars = $$('.pillar');
      if (pillars.length) {
        gsap.set(pillars, { autoAlpha: 0, y: 24 });
        gsap.to(pillars, {
          autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '.pillars', start: 'top 88%' }
        });
      }

      // Audit log rows stagger
      const logItems = $$('.log li');
      if (logItems.length) {
        gsap.set(logItems, { autoAlpha: 0, x: -12 });
        gsap.to(logItems, {
          autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.log', start: 'top 82%' }
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       PHILOSOPHY — Scrubbed typography emphasis
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const philH2 = $('.phil h2');
      const philSerif = $('.phil .serif');
      const philLead = $('.phil .lead');

      if (philH2) {
        gsap.fromTo(philH2,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: '.phil', start: 'top 80%' }
          }
        );
      }
      if (philSerif) {
        gsap.fromTo(philSerif,
          { autoAlpha: 0, x: -30 },
          {
            autoAlpha: 1, x: 0, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: '.phil', start: 'top 72%' }
          }
        );
      }
      if (philLead) {
        gsap.fromTo(philLead,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: philLead, start: 'top 90%' }
          }
        );
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       AUDIENCE — Rows slide in from alternating sides
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      $$('.aud-row').forEach((row: HTMLElement, i: number) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(row,
          { autoAlpha: 0, x: fromLeft ? -30 : 30 },
          {
            autoAlpha: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: row, start: 'top 88%' }
          }
        );
      });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEPS — Sequential count-in
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const steps = $$('.step');
      if (steps.length) {
        gsap.set(steps, { autoAlpha: 0, y: 24 });
        gsap.to(steps, {
          autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18, ease: 'power2.out',
          scrollTrigger: { trigger: '.steps', start: 'top 88%' }
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       PLANS — Cards rise
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const plans = $$('.plan');
      if (plans.length) {
        gsap.set(plans, { autoAlpha: 0, y: 30, scale: 0.97 });
        gsap.to(plans, {
          autoAlpha: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: '.plans', start: 'top 88%' }
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       CTA — Entrance with scale
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const ctaSection = $('.cta');
      if (ctaSection) {
        const ctaChildren = $$('.cta .wrap > *');
        gsap.set(ctaChildren, { autoAlpha: 0, y: 30 });
        gsap.to(ctaChildren, {
          autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: ctaSection, start: 'top 82%' }
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════════
       FOOTER — Gentle fade
       ═══════════════════════════════════════════════════════════════ */
    if (!reduce) {
      const footCols = $$('.foot > div');
      if (footCols.length) {
        gsap.set(footCols, { autoAlpha: 0, y: 16 });
        gsap.to(footCols, {
          autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: 'footer', start: 'top 92%' }
        });
      }
    }

  }); // end gsap.context

  /* ═══════════════════════════════════════════════════════════════
     POS DEMO — interactive (preserved from original)
     ═══════════════════════════════════════════════════════════════ */
  const MENU: Record<string, [string, number][]> = {
    Coffee: [['Espresso', 25000], ['Americano', 28000], ['Cafe Latte', 35000], ['Cappuccino', 35000], ['Mocha', 42000], ['Flat White', 38000]],
    Pastry: [['Butter Croissant', 25000], ['Pain au Chocolat', 32000], ['Cinnamon Roll', 30000], ['Banana Bread', 22000]],
    Retail: [['House Blend 250 g', 95000], ['Tumbler 350 ml', 150000], ['Drip Bags (5)', 60000]]
  };
  let tab = 'Coffee', charging = false;
  let cart: { key: string; name: string; mods: string[]; unit: number; qty: number }[] = [
    { key: 'Cafe Latte|oat|less', name: 'Cafe Latte', mods: ['Oat milk (+10.000)', 'Less sugar'], unit: 45000, qty: 2 },
    { key: 'Butter Croissant', name: 'Butter Croissant', mods: [], unit: 25000, qty: 1 }
  ];
  const ptabs = $('#ptabs'), items = $('#items'), lines = $('#cartLines'), foot = $('#cartFoot');

  function renderMenu() {
    ptabs.innerHTML = Object.keys(MENU).map(k =>
      `<button class="ptab" role="tab" aria-selected="${k === tab}" data-tab="${k}">${k}</button>`
    ).join('');
    items.innerHTML = MENU[tab].map(([n, p]) =>
      `<button class="item" data-add="${n}" data-price="${p}"><b>${n}</b><span>${idr(p)}</span></button>`
    ).join('');
  }

  function totals() {
    const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0);
    const tax = Math.round(sub * .1);
    return { sub, tax, total: sub + tax };
  }

  function renderCart() {
    lines.innerHTML = cart.length ? cart.map((l, i) => `
      <div class="cl"><div><div class="cl-n">${l.qty}× ${l.name}</div>${l.mods.map(m => `<div class="cl-m">${m}</div>`).join('')}
        <div class="stepper"><button data-dec="${i}" aria-label="Remove one ${l.name}">−</button><button data-inc="${i}" aria-label="Add one ${l.name}">+</button></div></div>
        <div class="cl-p">${idr(l.unit * l.qty)}</div></div>`).join('')
      : '<p class="cart-empty">Select items to start an order.</p>';
    const t = totals();
    foot.innerHTML = `<div class="tot"><span>Subtotal</span><span>${idr(t.sub)}</span></div>
      <div class="tot"><span>Tax (PB1, 10%)</span><span>${idr(t.tax)}</span></div>
      <div class="tot grand"><span>Total</span><span>Rp ${idr(t.total)}</span></div>
      <button class="charge${charging ? ' paid' : ''}" data-charge ${(!cart.length && !charging) ? 'disabled' : ''}>${charging ? `Paid · Order #${nextOrder - 1}` : `Charge Rp ${idr(t.total)}`}</button>`;
  }

  document.addEventListener('click', (e: Event) => {
    const t = (e.target as HTMLElement).closest('[data-tab],[data-add],[data-inc],[data-dec],[data-charge]') as HTMLElement;
    if (!t || (charging && !t.matches('[data-tab]'))) return;
    if (t.dataset.tab) { tab = t.dataset.tab; renderMenu(); ($(`[data-tab="${tab}"]`) as HTMLElement).focus(); return; }
    if (t.dataset.add) {
      const key = t.dataset.add; const ex = cart.find(l => l.key === key);
      if (ex) ex.qty++; else cart.push({ key, name: key, mods: [], unit: +t.dataset.price!, qty: 1 });
      t.classList.add('hit'); setTimeout(() => t.classList.remove('hit'), 260);
      renderCart(); lines.scrollTop = lines.scrollHeight; return;
    }
    if (t.dataset.inc) { cart[+t.dataset.inc].qty++; renderCart(); return; }
    if (t.dataset.dec) { const l = cart[+t.dataset.dec]; l.qty--; if (l.qty <= 0) cart.splice(+t.dataset.dec, 1); renderCart(); return; }
    if (t.hasAttribute('data-charge')) {
      if (!cart.length) return; charging = true; nextOrder++; renderCart();
      setTimeout(() => { cart = []; charging = false; renderCart(); }, 1800);
    }
  }, { signal: ac.signal });
  renderMenu(); renderCart();

  /* ═══════════════════════════════════════════════════════════════
     KDS DEMO — interactive (preserved)
     ═══════════════════════════════════════════════════════════════ */
  const STAGES = ['New', 'Preparing', 'Ready', 'Completed'], ACT = ['Start preparing', 'Mark ready', 'Complete'];
  const nowMs = () => Date.now();
  const T = [
    { id: 1043, age: 42, stage: 0, items: [['2×', 'Cafe Latte', ['Oat milk', 'Less sugar']], ['1×', 'Butter Croissant', ['!Warm up']]] },
    { id: 1044, age: 15, stage: 0, items: [['1×', 'Cappuccino', []], ['1×', 'Banana Bread', []]] },
    { id: 1042, age: 312, stage: 1, items: [['3×', 'Americano', []], ['1×', 'Flat White', ['Extra shot']]] },
    { id: 1041, age: 525, stage: 1, items: [['4×', 'Americano', []], ['2×', 'Butter Croissant', ['!Warm up']]] },
    { id: 1040, age: 150, stage: 2, items: [['1×', 'Mocha', ['Less sugar']]] },
    { id: 1039, age: 260, stage: 3, items: [['2×', 'Espresso', []]] }
  ].map(t => ({ ...t, start: nowMs() - t.age * 1000, end: t.stage === 3 ? nowMs() - t.age * 1000 + t.age * 1000 : null }));
  const board = $('#board');
  const el = (t: any) => Math.floor(((t.end || nowMs()) - t.start) / 1000);
  const mmss = (s: number) => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const tcls = (t: any) => { if (t.stage >= 2) return ''; const s = el(t); return s > 480 ? 'late' : s > 300 ? 'warn' : ''; };

  function ticket(t: any, moved?: number) {
    return `<article class="tk ${tcls(t)}${moved === t.id ? ' moved' : ''}" data-tk="${t.id}">
      <div class="tk-h"><b>#${t.id}</b><span class="t" data-t="${t.id}">${mmss(el(t))}</span></div>
      <ul>${t.items.map(([q, n, m]: [string, string, string[]]) => `<li><b>${q} ${n}</b>${m.map((x: string) => x[0] === '!' ? `<div class="hot">${x.slice(1)}</div>` : `<div>— ${x}</div>`).join('')}</li>`).join('')}</ul>
      ${t.stage < 3 ? `<button class="kbtn" data-adv="${t.id}">${ACT[t.stage]}</button>` : ''}</article>`;
  }

  function renderKDS(moved?: number) {
    board.innerHTML = STAGES.map((s, i) => {
      const list = T.filter(t => t.stage === i); const shown = i === 3 ? list.slice(-3) : list;
      return `<section class="kcol" aria-label="${s}"><h3 class="kh"><span>${s}</span><span class="kc">${list.length}</span></h3>${shown.map(t => ticket(t, moved)).join('') || '<p class="kempty">No tickets</p>'}</section>`;
    }).join('');
  }

  board.addEventListener('click', (e: Event) => {
    const b = (e.target as HTMLElement).closest('[data-adv]') as HTMLElement; if (!b) return;
    const t = T.find(x => x.id === +b.dataset.adv!); t!.stage++; if (t!.stage === 3) t!.end = nowMs();
    renderKDS(t!.id);
    const nb = board.querySelector(`[data-adv="${t!.id}"]`) as HTMLElement; if (nb) nb.focus();
  });

  const iv = setInterval(() => {
    $$('[data-t]', board).forEach((s: HTMLElement) => {
      const t = T.find(x => x.id === +s.dataset.t!); if (!t || t.stage === 3) return;
      s.textContent = mmss(el(t)); const a = s.closest('.tk') as HTMLElement; const c = tcls(t);
      a.classList.toggle('late', c === 'late'); a.classList.toggle('warn', c === 'warn');
    });
  }, 1000);
  renderKDS();

  /* ═══════════════════════════════════════════════════════════════
     INVENTORY DEMO — interactive (preserved)
     ═══════════════════════════════════════════════════════════════ */
  const stock: Record<string, { n: string; v: number; u: string; low: number }> = {
    beans: { n: 'Espresso beans (House Blend)', v: 4200, u: 'g', low: 1000 },
    milk: { n: 'Fresh milk', v: 9500, u: 'ml', low: 2000 },
    cup: { n: 'Paper cup 8 oz', v: 1240, u: 'pcs', low: 200 },
    oat: { n: 'Oat milk (Barista Ed)', v: 2500, u: 'ml', low: 3000 }
  };
  const ledger: { t: string; ty: string; it: string; ch: string; ref: string; pos?: boolean }[] = [
    { t: '14:09', ty: 'Adjustment', it: 'Fresh milk', ch: '−500 ml', ref: 'Spillage · Rina S.' },
    { t: '14:02', ty: 'Sale', it: 'Paper cup 8 oz', ch: '−4 pcs', ref: 'Order #1041' },
    { t: '13:52', ty: 'Restock', it: 'Espresso beans', ch: '+5,000 g', ref: 'Shift 2 · Central Hub', pos: true }
  ];
  let clock = 14 * 60 + 22;
  const sTb = $('#stockTbl tbody'), lTb = $('#ledgerTbl tbody');

  function renderStock(deltas?: Record<string, number>) {
    sTb.innerHTML = Object.entries(stock).map(([k, s]) => {
      const low = s.v < s.low;
      const d = deltas && deltas[k] ? `<span class="delta">−${deltas[k]} ${s.u}</span>` : '';
      return `<tr><td>${s.n}</td><td class="r tnum">${qty(s.v)} ${s.u}${d}</td><td><span class="badge ${low ? 'warn' : 'ok'}">${low ? 'Low' : 'Optimal'}</span></td></tr>`;
    }).join('');
  }

  function renderLedger(fresh?: number) {
    lTb.innerHTML = ledger.slice(0, 6).map((r, i) =>
      `<tr class="${fresh && i < fresh ? 'new' : ''}"><td>${r.t}</td><td>${r.ty}</td><td>${r.it}</td><td class="r tnum ${r.pos ? 'pos-v' : 'neg'}">${r.ch}</td><td>${r.ref}</td></tr>`
    ).join('');
  }

  const chain = $$('#chain li'), sell = $('#sellBtn');
  let busy = false;
  sell.addEventListener('click', () => {
    if (busy) return; busy = true; sell.disabled = true; sell.style.opacity = '.6';
    chain.forEach((li: HTMLElement) => li.classList.remove('on'));
    const step = reduce ? 0 : 240, order = nextOrder++;
    chain.forEach((li: HTMLElement, i: number) => setTimeout(() => {
      li.classList.add('on');
      if (i === 3) { stock.beans.v -= 18; stock.milk.v -= 150; stock.cup.v -= 1; renderStock({ beans: 18, milk: 150, cup: 1 }); }
      if (i === 4) {
        clock++;
        const t = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, '0')}`;
        const ref = `Order #${order}`;
        ledger.unshift(
          { t, ty: 'Sale', it: 'Paper cup 8 oz', ch: '−1 pcs', ref },
          { t, ty: 'Sale', it: 'Fresh milk', ch: '−150 ml', ref },
          { t, ty: 'Sale', it: 'Espresso beans', ch: '−18 g', ref }
        );
        renderLedger(3);
      }
      if (i === 4) { busy = false; sell.disabled = false; sell.style.opacity = ''; }
    }, i * step));
  });
  renderStock(); renderLedger();

  /* ═══════════════════════════════════════════════════════════════
     BRANCH HQ TABS — interactive (preserved)
     ═══════════════════════════════════════════════════════════════ */
  const B: Record<string, any> = {
    sales: {
      h: ['Branch', 'Transactions', 'Net sales', 'Share of today'],
      rows: [['Central Hub', '351', 'Rp 18.45M', 43], ['North Outlet', '279', 'Rp 14.10M', 33], ['South Kiosk', '212', 'Rp 10.30M', 24]],
      f: (r: any[]) => `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td class="r tnum">${r[2]}</td><td><span class="share" style="width:${r[3] * 1.2}px"></span><span class="tnum">${r[3]}%</span></td>`,
      al: [0, 1, 1, 0]
    },
    inventory: {
      h: ['Branch', 'Low-stock items', 'Most urgent'],
      rows: [['Central Hub', '5', 'Oat milk (Barista Ed) · 2,500 ml'], ['North Outlet', '4', 'Vanilla syrup · 400 ml'], ['South Kiosk', '3', 'Paper cup 8 oz · 140 pcs']],
      f: (r: any[]) => `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td>`,
      al: [0, 1, 0]
    },
    cash: {
      h: ['Branch', 'Open shifts', 'Cashiers on shift', 'Drawer expected'],
      rows: [['Central Hub', '2', 'Andi K., Maya P.', 'Rp 6.18M'], ['North Outlet', '1', 'Dewi A.', 'Rp 3.40M'], ['South Kiosk', '1', 'Raka S.', 'Rp 2.15M']],
      f: (r: any[]) => `<td>${r[0]}</td><td class="r tnum">${r[1]}</td><td>${r[2]}</td><td class="r tnum">${r[3]}</td>`,
      al: [0, 1, 0, 1]
    },
    status: {
      h: ['Branch', 'Connection', 'Last sync'],
      rows: [['Central Hub', '<span class="badge ok">Online</span>', 'Just now'], ['North Outlet', '<span class="badge ok">Online</span>', 'Just now'], ['South Kiosk', '<span class="badge warn">Syncing</span>', '2 min ago · 3 orders queued']],
      f: (r: any[]) => `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`,
      al: [0, 0, 0]
    }
  };
  const bpanel = $('#bpanel'), btabs = $$('#btabs [data-bt]');

  function showB(k: string) {
    const d = B[k];
    bpanel.innerHTML = `<table class="tbl"><thead><tr>${d.h.map((x: string, i: number) => `<th class="${d.al[i] ? 'r' : ''}">${x}</th>`).join('')}</tr></thead><tbody>${d.rows.map((r: any[]) => `<tr>${d.f(r)}</tr>`).join('')}</tbody></table>`;
    btabs.forEach((b: HTMLElement) => { const on = (b as any).dataset.bt === k; b.setAttribute('aria-selected', String(on)); (b as HTMLElement).tabIndex = on ? 0 : -1; });
    bpanel.setAttribute('aria-labelledby', 'bt-' + k);
  }

  btabs.forEach((b: HTMLElement, i: number) => {
    b.addEventListener('click', () => showB((b as any).dataset.bt));
    b.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = btabs[(i + (e.key === 'ArrowRight' ? 1 : btabs.length - 1)) % btabs.length] as HTMLElement;
      showB((n as any).dataset.bt); n.focus();
    });
  });
  showB('sales');

  /* ═══════════════════════════════════════════════════════════════
     PARTICLE FIELD — Operational Intelligence Field
     Canvas 2D, cursor-reactive, scroll-aware, dark/light adaptive
     ═══════════════════════════════════════════════════════════════ */
  function initParticles() {
    if (reduce) return () => { };
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
    const hero = document.getElementById('hero') as HTMLElement | null;
    if (!canvas || !hero) return () => { };

    const c2d = canvas.getContext('2d', { alpha: true });
    if (!c2d) return () => { };

    /* ── Adaptive configuration ── */
    const isMobile = window.innerWidth < 760;
    const isLowPower = isMobile || navigator.hardwareConcurrency <= 4;
    const BASE_COUNT = isLowPower ? 120 : Math.min(Math.floor(window.innerWidth / 6), 250);
    const INFLUENCE_R = isMobile ? 100 : 220;
    const CONN_DIST = isMobile ? 0 : 90;   // connection distance (0 = disabled on mobile)
    const CONN_MAX = 3;                      // max connections per particle

    /* ── State ── */
    let W = 0, H = 0, dpr = 1;
    let pointerX = -9999, pointerY = -9999;
    let pointerVx = 0, pointerVy = 0;
    let prevPointerX = -9999, prevPointerY = -9999;
    let pointerInside = false;
    let isVisible = true;
    let rafId = 0;
    let prevT = 0;

    /* ── Color ── */
    let isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const onDarkChange = (e: MediaQueryListEvent) => { isDark = e.matches; };
    mqDark.addEventListener('change', onDarkChange);

    /* ── Particle structure (flat arrays for cache perf) ── */
    let px: Float32Array, py: Float32Array;     // position
    let vx: Float32Array, vy: Float32Array;     // velocity
    let bvx: Float32Array, bvy: Float32Array;   // base (idle) velocity
    let sz: Float32Array, al: Float32Array;     // size, alpha
    let layer: Float32Array;                     // depth layer 0..1
    let ctype: Uint8Array;                       // color type (0-3)
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
        
        // Celestial sizing
        const r = Math.random();
        if (r > 0.98) sz[i] = 2.5 + Math.random() * 2;       // rare large bodies
        else if (r > 0.85) sz[i] = 1.2 + Math.random() * 1;  // medium stars
        else sz[i] = 0.5 + Math.random() * 0.7;              // distant stars/dust
        
        al[i] = 0.15 + depth * 0.45;         // slightly higher opacity
        
        // Celestial color types
        const cRand = Math.random();
        if (cRand > 0.9) ctype[i] = 3;       // Reddish
        else if (cRand > 0.7) ctype[i] = 2;  // Yellowish
        else if (cRand > 0.4) ctype[i] = 1;  // Blue-white
        else ctype[i] = 0;                   // Pure white
      }
    }

    /* ── Resize ── */
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth || window.innerWidth;
      H = hero.clientHeight || window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';

      if (count === 0) spawnParticles();
    }

    /* ── Pointer ── */
    function onPointerMove(e: PointerEvent) {
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

    /* ── Visibility ── */
    const visObs = new IntersectionObserver(entries => {
      isVisible = entries[0]?.isIntersecting ?? true;
    }, { threshold: 0.05 });

    /* ── Render loop ── */
    function tick(t: number) {
      rafId = requestAnimationFrame(tick);
      if (!isVisible || count === 0) { prevT = t; return; }

      const rawDt = (t - prevT) / 16.667;
      const dt = Math.min(rawDt || 1, 3);
      prevT = t;

      // Pointer velocity (smoothed)
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

      // Update particles
      const rSq = INFLUENCE_R * INFLUENCE_R;

      for (let i = 0; i < count; i++) {
        // Spring back to idle velocity
        const depthFactor = 0.5 + layer[i] * 0.5;  // foreground reacts more
        vx[i] += (bvx[i] - vx[i]) * 0.03 * dt;
        vy[i] += (bvy[i] - vy[i]) * 0.03 * dt;

        // Cursor influence
        if (pointerInside) {
          const dx = px[i] - pointerX;
          const dy = py[i] - pointerY;
          const dSq = dx * dx + dy * dy;

          if (dSq < rSq && dSq > 1) {
            const dist = Math.sqrt(dSq);
            const falloff = 1 - dist / INFLUENCE_R;
            const strength = falloff * falloff * depthFactor;  // quadratic falloff

            // Repulsion from cursor
            const repel = 0.6 * strength;
            vx[i] += (dx / dist) * repel * dt;
            vy[i] += (dy / dist) * repel * dt;

            // Wake: inherit cursor momentum
            const wake = 0.08 * strength;
            vx[i] += pointerVx * wake * dt;
            vy[i] += pointerVy * wake * dt;
          }
        }

        // Speed cap
        const spd = vx[i] * vx[i] + vy[i] * vy[i];
        if (spd > 36) {
          const s = 6 / Math.sqrt(spd);
          vx[i] *= s;
          vy[i] *= s;
        }

        // Integrate
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;

        // Wrap
        if (px[i] < -10) px[i] += W + 20;
        else if (px[i] > W + 10) px[i] -= W + 20;
        if (py[i] < -10) py[i] += H + 20;
        else if (py[i] > H + 10) py[i] -= H + 20;
      }

      // ── Draw ──
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);  // reset transform each frame
      c2d.clearRect(0, 0, W, H);

      // Connection lines (desktop only)
      if (CONN_DIST > 0) {
        const connSq = CONN_DIST * CONN_DIST;
        const lineColor = isDark ? '255,255,255' : '0,0,0';

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

      // Particles
      const colorsDark = ['255,255,255', '220,235,255', '255,230,200', '255,200,180'];
      const colorsLight = ['0,0,0', '20,40,100', '100,70,20', '100,30,30'];
      const palette = isDark ? colorsDark : colorsLight;

      for (let i = 0; i < count; i++) {
        // Edge fade
        let edgeFade = 1;
        const m = 60;
        if (py[i] < m) edgeFade = py[i] / m;
        else if (py[i] > H - m) edgeFade = (H - py[i]) / m;

        const a = al[i] * Math.max(edgeFade, 0);
        if (a < 0.005) continue;

        c2d.fillStyle = `rgba(${palette[ctype[i]]},${a})`;
        c2d.beginPath();
        c2d.arc(px[i], py[i], sz[i], 0, 6.2832);
        c2d.fill();
      }
    }

    /* ── Init ── */
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
    visObs.observe(hero);
    resize();
    rafId = requestAnimationFrame(tick);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      visObs.disconnect();
      mqDark.removeEventListener('change', onDarkChange);
    };
  }
  const cleanupParticles = initParticles();

  /* ═══════════════════════════════════════════════════════════════
     CLEANUP
     ═══════════════════════════════════════════════════════════════ */
  return () => {
    ac.abort();
    clearInterval(iv);
    cleanupParticles();
    ctx.revert();
    if (lenis) lenis.destroy();
  };
}
