import { MARKETING_STATE } from "./marketingState";

export const markup = `
<a class="skip" href="#product">Skip to content</a>

<!-- ───────────── NAV ───────────── -->
<nav class="nav" id="nav" aria-label="Primary">
  <div class="wrap nav-in">
    <div class="nav-l">
      <a class="logo" href="#top" aria-label="Apeiron Systems — home">
        <span>Apeiron <small>Systems</small></span>
      </a>
      <ul class="links" id="nav-links">
        <li class="nav-item" data-menu="product">
          <a class="nav-link" href="#product" aria-expanded="false" aria-controls="mega-product">
            <span>Product</span>
            <svg class="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </li>
        <li class="nav-item" data-menu="solutions">
          <a class="nav-link" href="#solutions" aria-expanded="false" aria-controls="mega-solutions">
            <span>Solutions</span>
            <svg class="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </li>
        <li class="nav-item" data-menu="resources">
          <a class="nav-link" href="#how" aria-expanded="false" aria-controls="mega-resources">
            <span>Resources</span>
            <svg class="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </li>
        <li class="nav-item" data-menu="pricing">
          <a class="nav-link" href="#pricing" aria-expanded="false" aria-controls="mega-pricing">
            <span>Pricing</span>
            <svg class="chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </li>
      </ul>
    </div>
    <div class="nav-r">
      <a class="login" href="#start">Log in</a>
      <a class="btn btn-primary btn-sm" href="/register">Get Started</a>
      <button class="burger" id="burger" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
      </button>
    </div>
  </div>

  <!-- FULL-WIDTH MEGA MENU (CLEAN MINIMALIST OPENAI STYLE) -->
  <div class="mega-menu" id="megaMenu" aria-hidden="true">
    <div class="wrap mega-wrap">
      <!-- PANEL 1: PRODUCT -->
      <div class="mega-panel" id="mega-product" data-panel="product">
        <div class="mega-grid">
          <div class="mega-col">
            <span class="mega-col-title">Operations</span>
            <a href="#product" class="mega-link">
              <span class="mega-link-title">Point of Sale (POS)</span>
              <span class="mega-link-desc">Counter registers, fast modifier grids &amp; shift cash control</span>
            </a>
            <a href="#kitchen" class="mega-link">
              <span class="mega-link-title">Kitchen Display System</span>
              <span class="mega-link-desc">Real-time ticket pacing, prep timers &amp; station routing</span>
            </a>
            <a href="#inventory" class="mega-link">
              <span class="mega-link-title">Live Inventory &amp; Recipes</span>
              <span class="mega-link-desc">Automated recipe deductions &amp; stock movement ledger</span>
            </a>
          </div>
          <div class="mega-col">
            <span class="mega-col-title">Scale &amp; Governance</span>
            <a href="#branches" class="mega-link">
              <span class="mega-link-title">Multi-Branch HQ</span>
              <span class="mega-link-desc">Unified sales, stock levels &amp; live outlet telemetry</span>
            </a>
            <a href="#integrity" class="mega-link">
              <span class="mega-link-title">Audit Trails &amp; Security</span>
              <span class="mega-link-desc">Immutable ledger, item void approvals &amp; drawer logs</span>
            </a>
            <a href="#system" class="mega-link">
              <span class="mega-link-title">System Architecture</span>
              <span class="mega-link-desc">Connected flow from counter to inventory &amp; reporting</span>
            </a>
          </div>
          <div class="mega-col mega-col-spotlight">
            <div class="mega-spotlight">
              <span class="mega-spotlight-label">Architecture</span>
              <h3 class="mega-spotlight-title">Zero-Latency Live Sync</h3>
              <p class="mega-spotlight-text">Continuous event stream keeping counter registers, kitchen lines, and central HQ in real-time lockstep.</p>
              <a href="#system" class="mega-spotlight-link">Explore architecture</a>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL 2: SOLUTIONS -->
      <div class="mega-panel" id="mega-solutions" data-panel="solutions">
        <div class="mega-grid">
          <div class="mega-col">
            <span class="mega-col-title">By Concept</span>
            <a href="#solutions" class="mega-link">
              <span class="mega-link-title">Coffee Shops &amp; Cafes</span>
              <span class="mega-link-desc">Rush hour speed, milk modifiers &amp; barista tickets</span>
            </a>
            <a href="#solutions" class="mega-link">
              <span class="mega-link-title">Quick Service &amp; Fast Food</span>
              <span class="mega-link-desc">High transaction volume, queue busting &amp; dual-screen flows</span>
            </a>
            <a href="#solutions" class="mega-link">
              <span class="mega-link-title">Bakeries &amp; Central Kitchens</span>
              <span class="mega-link-desc">Batch recipe scaling, ingredient variance &amp; shrinkage logs</span>
            </a>
          </div>
          <div class="mega-col">
            <span class="mega-col-title">By Organization</span>
            <a href="#branches" class="mega-link">
              <span class="mega-link-title">Multi-Location Chains</span>
              <span class="mega-link-desc">Cross-outlet transfers, unified pricing &amp; consolidated views</span>
            </a>
            <a href="#pricing" class="mega-link">
              <span class="mega-link-title">Single Outlets</span>
              <span class="mega-link-desc">Structured operational control from register open to cash close</span>
            </a>
            <a href="#how" class="mega-link">
              <span class="mega-link-title">Scaling Outlets</span>
              <span class="mega-link-desc">Expand from 1 to 10+ locations without operational friction</span>
            </a>
          </div>
          <div class="mega-col mega-col-spotlight">
            <div class="mega-spotlight">
              <span class="mega-spotlight-label">Multi-Branch Governance</span>
              <h3 class="mega-spotlight-title">Scale with Clarity</h3>
              <p class="mega-spotlight-text">Maintain complete operational oversight and team accountability without micromanaging daily branch shifts.</p>
              <a href="#branches" class="mega-spotlight-link">See multi-branch HQ</a>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL 3: RESOURCES -->
      <div class="mega-panel" id="mega-resources" data-panel="resources">
        <div class="mega-grid">
          <div class="mega-col">
            <span class="mega-col-title">Documentation &amp; Flow</span>
            <a href="#system" class="mega-link">
              <span class="mega-link-title">The Operating System</span>
              <span class="mega-link-desc">How counter, kitchen, cash drawer, and stock work as one</span>
            </a>
            <a href="#how" class="mega-link">
              <span class="mega-link-title">Setup Roadmap</span>
              <span class="mega-link-desc">Three-step onboarding for outlets, catalog, teams &amp; recipes</span>
            </a>
          </div>
          <div class="mega-col">
            <span class="mega-col-title">Operational Trust</span>
            <a href="#integrity" class="mega-link">
              <span class="mega-link-title">Audit Ledger Standards</span>
              <span class="mega-link-desc">Immutable event logging, item void approvals &amp; drawer logs</span>
            </a>
            <a href="#integrity" class="mega-link">
              <span class="mega-link-title">Permission Matrix</span>
              <span class="mega-link-desc">Supervised voids, cash corrections &amp; role security sign-off</span>
            </a>
          </div>
          <div class="mega-col mega-col-spotlight">
            <div class="mega-spotlight">
              <span class="mega-spotlight-label">Integrity</span>
              <h3 class="mega-spotlight-title">Operational Records</h3>
              <p class="mega-spotlight-text">Completed transactions are durable records. Corrections go through reversals, not silent edits.</p>
              <a href="#integrity" class="mega-spotlight-link">View security architecture</a>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL 4: PRICING -->
      <div class="mega-panel" id="mega-pricing" data-panel="pricing">
        <div class="mega-grid">
          <div class="mega-col">
            <span class="mega-col-title">Operational Plans</span>
            <a href="#pricing" class="mega-link">
              <span class="mega-link-title">Single Outlet</span>
              <span class="mega-link-desc">POS, KDS, recipes &amp; shift cash control for one location</span>
            </a>
            <a href="#pricing" class="mega-link">
              <span class="mega-link-title">Multi-Branch HQ</span>
              <span class="mega-link-desc">HQ view, cross-branch inventory, audit trail &amp; roles</span>
            </a>
          </div>
          <div class="mega-col">
            <span class="mega-col-title">Deployment</span>
            <a href="#start" class="mega-link">
              <span class="mega-link-title">Instant Onboarding</span>
              <span class="mega-link-desc">Cloud sync setup ready in minutes with your existing hardware</span>
            </a>
            <a href="#start" class="mega-link">
              <span class="mega-link-title">Hardware Guidelines</span>
              <span class="mega-link-desc">Recommended thermal printers, tablets &amp; cash drawers</span>
            </a>
          </div>
          <div class="mega-col mega-col-spotlight">
            <div class="mega-spotlight">
              <span class="mega-spotlight-label">Instant Access</span>
              <h3 class="mega-spotlight-title">Interactive Live POS</h3>
              <p class="mega-spotlight-text">Try real-time orders, recipe deductions, and kitchen tickets right in your browser.</p>
              <a href="#product" class="mega-spotlight-link">Try interactive demo</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="menu" id="menu" hidden>
    <div class="menu-grp">
      <span class="menu-grp-title">Product</span>
      <a href="#product">Point of Sale (POS)</a>
      <a href="#kitchen">Kitchen Display (KDS)</a>
      <a href="#inventory">Live Inventory &amp; Recipes</a>
      <a href="#branches">Multi-Branch HQ</a>
    </div>
    <div class="menu-grp">
      <span class="menu-grp-title">Solutions</span>
      <a href="#solutions">Coffee Shops &amp; Cafes</a>
      <a href="#solutions">Quick Service &amp; Fast Food</a>
      <a href="#solutions">Bakeries &amp; Central Kitchens</a>
    </div>
    <div class="menu-grp">
      <span class="menu-grp-title">Company &amp; Resources</span>
      <a href="#system">System Architecture</a>
      <a href="#integrity">Audit Trails &amp; Integrity</a>
      <a href="#how">Setup Roadmap</a>
      <a href="#pricing">Pricing Plans</a>
    </div>
    <div class="menu-foot">
      <a class="btn btn-primary" href="/register" style="width:100%;text-align:center">Get Started</a>
    </div>
  </div>
</nav>

<div class="mega-backdrop" id="megaBackdrop" aria-hidden="true"></div>

<main id="top">
<!-- ───────────── HERO ───────────── -->
<header class="hero" id="hero">
  <div class="apeiron-vortex-wrap" id="apeiron-vortex-wrap" aria-hidden="true">
    <canvas id="apeiron-vortex-canvas" class="hero-canvas apeiron-vortex-canvas" aria-hidden="true"></canvas>
    <canvas id="hero-canvas" class="hero-canvas hero-canvas-fallback" aria-hidden="true" style="display:none"></canvas>
    <div class="apeiron-vortex-vignette" aria-hidden="true"></div>
  </div>
  <div class="wrap hero-in">
    <h1 class="h-xl" data-in style="--d:120ms">
      <span class="h-mask"><span class="h-line">Run every branch</span></span><br>
      <span class="h-mask"><span class="h-line">with <em class="serif">clarity.</em></span></span>
    </h1>
    <p class="lead" data-in style="--d:220ms">Sales, inventory, cash, kitchen operations, and reporting — connected in one system built for growing F&amp;B businesses.</p>
    <div class="btn-row" data-in style="--d:320ms">
      <a class="btn btn-primary" href="/register">Get Started</a>
      <a class="btn btn-secondary" href="#product">Explore the Product</a>
    </div>

    <div class="stage" id="stage" data-in style="--d:440ms">
      <div class="stage-tilt" id="tilt">
        <div class="dash" role="img" aria-label="Apeiron dashboard showing today's sales across three branches, sample data">
          <div class="dash-glare" aria-hidden="true"></div>
          <div class="app">
            <aside class="app-side" aria-hidden="true">
              <div class="org">
                <span>Apeiron</span>
              </div>
              <div class="grp">HQ operations</div>
              <a class="on">Dashboard</a><a>Reports</a><a>Inventory</a><a>Recipes</a><a>Shifts &amp; cash</a><a>Branches</a>
              <div class="grp">Account</div>
              <a>Settings</a>
            </aside>
            <div class="app-main" aria-hidden="true">
              <div class="app-top">
                <div>
                  <h3>Today’s performance</h3>
                  <p><span id="hero-date"></span><span id="hero-time"></span>Simulated dashboard</p>
                </div>
                <span class="pill">
                  <span class="pill-dot"></span>
                  All branches
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                </span>
              </div>
              <div class="kpis">
                <div class="kpi">
                  <span>Net sales</span>
                  <b id="kpi-sales">Rp ${MARKETING_STATE.sales.toFixed(2)}M</b>
                </div>
                <div class="kpi">
                  <span>Transactions</span>
                  <b id="kpi-tx">${MARKETING_STATE.tx}</b>
                </div>
                <div class="kpi">
                  <span>Average order</span>
                  <b>Rp 50.9K</b>
                </div>
                <div class="kpi">
                  <span>Open shifts</span>
                  <b>4</b>
                </div>
              </div>
              <div class="row2">
                <div class="card">
                  <h4>Sales by hour <span>Rp M</span></h4>
                  <div class="bars" id="bars"></div>
                  <div class="blabels" id="blabels"></div>
                </div>
                <div class="card">
                  <h4>Branches <span>Net sales</span></h4>
                  <ul class="brl">
                    <li><b>Central Hub</b><span class="status-text status-online">Online</span><span class="v">Rp 18.45M</span></li>
                    <li><b>North Outlet</b><span class="status-text status-online">Online</span><span class="v">Rp 14.10M</span></li>
                    <li><b>South Kiosk</b><span class="status-text status-online">Online</span><span class="v">Rp 10.30M</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="float f-pos" aria-hidden="true">
          <div class="f-h"><span>Register 01 · Central Hub</span><span class="live"></span></div>
          <div class="f-row" id="r-1044"><span>#1044 · Cappuccino, Banana Bread</span><b>Rp 62.700</b></div>
          <div class="f-row"><span>#1043 · 2× Cafe Latte, Croissant</span><b>Rp 126.500</b></div>
          <div class="f-row"><span>#1042 · 3× Americano, Flat White</span><b>Rp 134.200</b></div>
        </div>
        <div class="float f-alert" id="f-alert" aria-hidden="true">
          <div class="t"><i></i>Low stock · Central Hub</div>
          <p>Oat milk (Barista Ed)<small>2,500 ml remaining</small></p>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-pad"></div>
</header>

<!-- ───────────── STORY ───────────── -->
<section class="story" aria-label="Why Apeiron">
  <div class="wrap" id="storyList">
    <p>Running one location is manageable.</p>
    <p>Then you open another. Stock moves between kitchens, cash sits in more drawers, and yesterday’s numbers arrive today.</p>
    <p>Every branch adds a place where something can go wrong without anyone noticing.</p>
    <p>Apeiron connects the operation. Sales, stock, cash, and kitchen become one record.</p>
    <p><span>The owner sees every branch.</span><span>The team works inside clear structure.</span><span class="soft">The business stays in control.</span></p>
  </div>
</section>

<!-- ───────────── SALES / POS ───────────── -->
<section class="sec" id="product" style="padding-top:clamp(40px,6vw,80px)">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">Built for the speed of the counter.</h2>
      <p class="lead">Modifiers, notes, and totals stay in view while the line moves. Every sale is recorded against a cashier and an open shift, and goes straight to the kitchen.</p>
    </div>
    <div class="sheet">
      <div class="win pos-win">
        <div class="win-bar">
          <div class="win-bar-l">
            <span class="win-dot red"></span><span class="win-dot yellow"></span><span class="win-dot green"></span>
            <b>Register 01 · Central Hub</b>
          </div>
          <span class="who">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Andi K. · <span class="status-shift">Shift open</span>
          </span>
        </div>
        <div class="pos">
          <div class="pos-menu">
            <div class="ptabs" role="tablist" aria-label="Menu categories" id="ptabs"><button class="ptab" role="tab" aria-selected="true" data-tab="Coffee">Coffee</button><button class="ptab" role="tab" aria-selected="false" data-tab="Pastry">Pastry</button><button class="ptab" role="tab" aria-selected="false" data-tab="Retail">Retail</button></div>
            <div class="items" id="items"><button class="item" data-add="Americano" data-price="28000"><b>Americano</b><span>28.000</span></button><button class="item" data-add="Cafe Latte" data-price="35000"><b>Cafe Latte</b><span>35.000</span></button><button class="item" data-add="Cappuccino" data-price="35000"><b>Cappuccino</b><span>35.000</span></button><button class="item" data-add="Flat White" data-price="38000"><b>Flat White</b><span>38.000</span></button></div>
          </div>
          <div class="cart">
            <div class="cart-lines" id="cartLines" aria-live="polite"><div class="empty"><b>No items added</b><span>Tap items to build order</span></div></div>
            <div class="cart-foot" id="cartFoot"><div class="sub"><span>Subtotal</span><span>0</span></div><div class="tax"><span>Tax (10%)</span><span>0</span></div><div class="tot"><span>Total</span><b>Rp 0</b></div><button class="btn btn-primary" style="width:100%;margin-top:12px" data-charge="1" disabled>Charge Rp 0</button></div>
          </div>
        </div>
      </div>
    </div>
    <p class="cap">Interactive sample. Tap items to build an order.</p>
  </div>
</section>

<!-- ───────────── KDS ───────────── -->
<section class="kds" id="kitchen">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">From order to kitchen, without losing the thread.</h2>
      <p class="lead">Each ticket carries its modifiers and its age. The kitchen moves it forward; the counter sees the same status.</p>
    </div>
    <div class="board" id="board"><section class="kcol" aria-label="New"><h3 class="kh"><span>New</span><span class="kc">2</span></h3><button class="ticket" data-adv="1043">
    <div class="t-h"><b>#1043</b><span class="time">0:42</span></div><div class="it"><span><b>2×</b> Cafe Latte</span><em>Oat milk</em><em>Less sugar</em></div><div class="it"><span><b>1×</b> Butter Croissant</span><em>!Warm up</em></div>
    <div class="t-a">Advance</div>
  </button><button class="ticket" data-adv="1044">
    <div class="t-h"><b>#1044</b><span class="time">0:15</span></div><div class="it"><span><b>1×</b> Cappuccino</span></div><div class="it"><span><b>1×</b> Banana Bread</span></div>
    <div class="t-a">Advance</div>
  </button></section><section class="kcol" aria-label="Preparing"><h3 class="kh"><span>Preparing</span><span class="kc">1</span></h3><button class="ticket" data-adv="1042">
    <div class="t-h"><b>#1042</b><span class="time">5:12</span></div><div class="it"><span><b>3×</b> Americano</span></div><div class="it"><span><b>1×</b> Flat White</span><em>Extra shot</em></div>
    <div class="t-a">Advance</div>
  </button></section><section class="kcol" aria-label="Ready"><h3 class="kh"><span>Ready</span><span class="kc">0</span></h3><p class="kempty">No tickets</p></section><section class="kcol" aria-label="Completed"><h3 class="kh"><span>Completed</span><span class="kc">0</span></h3><p class="kempty">No tickets</p></section></div>
    <p class="cap">Interactive sample. Advance a ticket to move it along the line.</p>
  </div>
</section>

<!-- ───────────── INVENTORY ───────────── -->
<section class="sec" id="inventory">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">Know where every movement comes from.</h2>
      <p class="lead">A sale triggers its recipe. The recipe deducts ingredients. The ledger records the movement. Follow one latte through the system.</p>
    </div>
    <div class="inv">
      <div class="chain-wrap">
        <button class="btn btn-primary" id="sellBtn">
          <span>Sell one Cafe Latte</span>
        </button>
        <ol class="chain" id="chain">
          <li><i></i><b>Product</b><small>1 × Cafe Latte, Register 01</small></li>
          <li><i></i><b>Recipe</b><small>18 g espresso beans · 150 ml fresh milk · 1 paper cup</small></li>
          <li><i></i><b>Ingredients</b><small>Three items deducted using the recipe quantities</small></li>
          <li><i></i><b>Stock</b><small>Central Hub balances update. Other branches are untouched.</small></li>
          <li><i></i><b>Movement</b><small>Written to the ledger and linked to the order and open shift</small></li>
        </ol>
      </div>
      <div class="sheet" style="padding:clamp(12px,2vw,24px)">
        <div class="win">
          <div class="stock-h"><b>Ingredient stock</b><span>Central Hub</span></div>
          <div class="scroll-x">
            <table class="tbl" id="stockTbl">
              <thead><tr><th>Item</th><th class="r">In stock</th><th>Status</th></tr></thead>
              <tbody><tr><td>Espresso beans</td><td class="r">2,450 g</td><td><span class="status-text status-optimal">Optimal</span></td></tr><tr><td>Fresh milk</td><td class="r">6,400 ml</td><td><span class="status-text status-optimal">Optimal</span></td></tr><tr><td>Paper cup 8 oz</td><td class="r">142 pcs</td><td><span class="status-text status-optimal">Optimal</span></td></tr><tr><td>Vanilla syrup</td><td class="r">850 ml</td><td><span class="status-text status-optimal">Optimal</span></td></tr></tbody>
            </table>
          </div>
          <div class="ledger-h">Stock ledger</div>
          <div class="ledger scroll-x" aria-live="polite">
            <table class="tbl" id="ledgerTbl">
              <thead><tr><th>Time</th><th>Type</th><th>Item</th><th class="r">Change</th><th>Reference</th></tr></thead>
              <tbody><tr><td>14:21</td><td>Sale</td><td>Paper cup 8 oz</td><td class="r num">−1 pcs</td><td>Order #1041</td></tr><tr><td>14:21</td><td>Sale</td><td>Fresh milk</td><td class="r num">−150 ml</td><td>Order #1041</td></tr><tr><td>14:21</td><td>Sale</td><td>Espresso beans</td><td class="r num">−18 g</td><td>Order #1041</td></tr><tr><td>14:16</td><td>Waste</td><td>Fresh milk</td><td class="r num">−500 ml</td><td>Spillage</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <p class="cap">Interactive sample with sample quantities.</p>
  </div>
</section>

<!-- ───────────── SYSTEM ───────────── -->
<section class="sec grid-bg" id="system">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">One operation. Connected end to end.</h2>
      <p class="lead">Each step feeds the next, and every step runs per branch. Reporting reads from all of it.</p>
    </div>
    <div class="diagram" data-reveal>
      <svg class="desk" viewBox="0 0 1200 500" role="img" aria-label="System diagram. Sales feed orders, orders feed recipes and cash, recipes feed ingredients, ingredients feed inventory, purchasing replenishes inventory, cash feeds reporting. All steps run per branch and roll up to HQ.">
        <!-- row 1 -->
        <g class="diag-node"><rect class="n-rect" x="60" y="60" width="170" height="64" rx="12"/><text class="n-t" x="80" y="88">Sales</text><text class="n-s" x="80" y="108">Counter + modifiers</text></g>
        <g class="diag-node"><rect class="n-rect" x="360" y="60" width="170" height="64" rx="12"/><text class="n-t" x="380" y="88">Orders</text><text class="n-s" x="380" y="108">Tickets + payments</text></g>
        <g class="diag-node"><rect class="n-rect" x="660" y="60" width="170" height="64" rx="12"/><text class="n-t" x="680" y="88">Recipes</text><text class="n-s" x="680" y="108">Per-item formulas</text></g>
        <g class="diag-node"><rect class="n-rect" x="960" y="60" width="170" height="64" rx="12"/><text class="n-t" x="980" y="88">Ingredients</text><text class="n-s" x="980" y="108">Raw materials</text></g>
        <!-- row 2 -->
        <g class="diag-node"><rect class="n-rect out" x="60" y="230" width="170" height="64" rx="12"/><text class="n-t out" x="80" y="258">Reporting</text><text class="n-s out" x="80" y="278">Per branch + HQ</text></g>
        <g class="diag-node"><rect class="n-rect" x="360" y="230" width="170" height="64" rx="12"/><text class="n-t" x="380" y="258">Cash</text><text class="n-s" x="380" y="278">Shifts + drawer</text></g>
        <g class="diag-node"><rect class="n-rect" x="660" y="230" width="170" height="64" rx="12"/><text class="n-t" x="680" y="258">Purchasing</text><text class="n-s" x="680" y="278">Supplier orders</text></g>
        <g class="diag-node"><rect class="n-rect" x="960" y="230" width="170" height="64" rx="12"/><text class="n-t" x="980" y="258">Inventory</text><text class="n-s" x="980" y="278">Stock + movements</text></g>
        <!-- edges -->
        <path class="edge e1" pathLength="1" d="M230 92H360"/><path class="arrow" d="M353 87.5 360 92 353 96.5"/>
        <path class="edge e2" pathLength="1" d="M530 92H660"/><path class="arrow" d="M653 87.5 660 92 653 96.5"/>
        <path class="edge e3" pathLength="1" d="M830 92H960"/><path class="arrow" d="M953 87.5 960 92 953 96.5"/>
        <path class="edge e4" pathLength="1" d="M1045 124V230"/><path class="arrow" d="M1040.5 223 1045 230 1049.5 223"/>
        <path class="edge e5" pathLength="1" d="M830 262H960"/><path class="arrow" d="M953 257.5 960 262 953 266.5"/>
        <path class="edge e6" pathLength="1" d="M445 124V230"/><path class="arrow" d="M440.5 223 445 230 449.5 223"/>
        <path class="edge e7" pathLength="1" d="M360 262H230"/><path class="arrow" d="M237 257.5 230 262 237 266.5"/>
        <!-- branch ties -->
        <path class="tie" d="M145 294V372"/><path class="tie" d="M445 294V372"/><path class="tie" d="M745 294V372"/><path class="tie" d="M1045 294V372"/>
        <!-- branch band -->
        <rect class="band" x="60" y="372" width="1070" height="96" rx="16"/>
        <text class="b-l" x="86" y="402">Every step above runs per branch, then rolls up to HQ</text>
        <g class="diag-chip"><rect class="chip" x="86" y="418" width="132" height="34" rx="17"/><text class="b-t" x="152" y="440" text-anchor="middle">Central Hub</text></g>
        <g class="diag-chip"><rect class="chip" x="230" y="418" width="132" height="34" rx="17"/><text class="b-t" x="296" y="440" text-anchor="middle">North Outlet</text></g>
        <g class="diag-chip"><rect class="chip" x="374" y="418" width="132" height="34" rx="17"/><text class="b-t" x="440" y="440" text-anchor="middle">South Kiosk</text></g>
        <g class="diag-chip"><rect class="chip hq" x="984" y="418" width="120" height="34" rx="17"/><text class="b-t hq" x="1044" y="440" text-anchor="middle">HQ view</text></g>
      </svg>
      <ol class="chain-m" aria-label="System flow">
        <li><i></i><b>Sales</b><small>Counter + modifiers</small></li>
        <li><i></i><b>Orders</b><small>Tickets + payments</small></li>
        <li><i></i><b>Recipes</b><small>Per-item formulas</small></li>
        <li><i></i><b>Ingredients</b><small>Raw materials</small></li>
        <li><i></i><b>Inventory</b><small>Stock + movements</small></li>
        <li><i></i><b>Purchasing</b><small>Supplier orders</small></li>
        <li><i></i><b>Cash</b><small>Shifts + drawer</small></li>
        <li><i></i><b>Reporting</b><small>Per branch + HQ</small></li>
        <li class="note">Every step runs per branch, then rolls up to HQ.</li>
      </ol>
    </div>
  </div>
</section>

<!-- ───────────── BRANCHES ───────────── -->
<section class="sec" id="branches">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">One business. Every branch.</h2>
      <p class="lead">Each branch keeps working on its own. HQ sees sales, stock, cash, and status for all of them in one view.</p>
    </div>
    <div class="br">
      <div class="br-l" data-reveal>
        <svg viewBox="0 0 320 360" role="img" aria-label="Three branches converge into Apeiron, which feeds the HQ view">
          <g><rect class="chip" x="6" y="16" width="98" height="36" rx="10"/><circle cx="18" cy="34" r="3" fill="rgba(255,255,255,0.4)"/><text class="b-t" x="28" y="34" dominant-baseline="central" style="font-size:10.5px;font-weight:500;letter-spacing:0.01em">Central Hub</text></g>
          <g><rect class="chip" x="109" y="16" width="102" height="36" rx="10"/><circle cx="121" cy="34" r="3" fill="rgba(255,255,255,0.4)"/><text class="b-t" x="131" y="34" dominant-baseline="central" style="font-size:10.5px;font-weight:500;letter-spacing:0.01em">North Outlet</text></g>
          <g><rect class="chip" x="216" y="16" width="98" height="36" rx="10"/><circle cx="228" cy="34" r="3" fill="rgba(255,255,255,0.4)"/><text class="b-t" x="238" y="34" dominant-baseline="central" style="font-size:10.5px;font-weight:500;letter-spacing:0.01em">South Kiosk</text></g>
          <path class="edge bl" pathLength="1" d="M55 52C55 125 160 115 160 192"/>
          <path class="edge bl" pathLength="1" d="M160 52V192" style="transition-delay:80ms"/>
          <path class="edge bl" pathLength="1" d="M265 52C265 125 160 115 160 192" style="transition-delay:160ms"/>
          <g><rect class="n-rect out" x="95" y="192" width="130" height="48" rx="14"/><text class="n-t out" x="160" y="221" text-anchor="middle" style="font-size:15px;font-weight:600">Apeiron</text></g>
          <path class="edge bl" pathLength="1" d="M160 240V294" style="transition-delay:360ms"/>
          <path class="arrow" d="M155.5 287 160 294 164.5 287"/>
          <g><rect class="chip" x="105" y="294" width="110" height="40" rx="14"/><text class="b-t" x="160" y="319" text-anchor="middle" style="font-weight:600">HQ view</text></g>
          <text class="b-l" x="160" y="272" text-anchor="middle" style="font-size:11.5px">sales · stock · cash · status</text>
        </svg>
      </div>
      <div class="br-r">
        <div class="btabs" role="tablist" aria-label="HQ view" id="btabs">
          <button class="ptab" role="tab" data-bt="sales" id="bt-sales" aria-selected="true" aria-controls="bpanel">Sales</button>
          <button class="ptab" role="tab" data-bt="inventory" id="bt-inventory" aria-selected="false" aria-controls="bpanel" tabindex="-1">Inventory</button>
          <button class="ptab" role="tab" data-bt="cash" id="bt-cash" aria-selected="false" aria-controls="bpanel" tabindex="-1">Cash</button>
          <button class="ptab" role="tab" data-bt="status" id="bt-status" aria-selected="false" aria-controls="bpanel" tabindex="-1">Status</button>
          <span class="sp"></span><span class="when" id="branch-time">Oct 6, 2026 · 14:22</span>
        </div>
        <div class="scroll-x" id="bpanel" role="tabpanel" aria-labelledby="bt-sales" tabindex="0">
          <table class="tbl">
            <thead><tr><th>Branch</th><th class="r">Transactions</th><th class="r">Avg Order</th><th class="r">Gross Sales</th></tr></thead>
            <tbody>
              <tr><td>Central Hub</td><td class="r">342</td><td class="r">Rp 53K</td><td class="r num">Rp 18.450.000</td></tr>
              <tr><td>North Outlet</td><td class="r">284</td><td class="r">Rp 49K</td><td class="r num">Rp 14.100.000</td></tr>
              <tr><td>South Kiosk</td><td class="r">195</td><td class="r">Rp 52K</td><td class="r num">Rp 10.300.000</td></tr>
            </tbody>
            <tfoot><tr><td><b>Total</b></td><td class="r"><b>821</b></td><td class="r"><b>Rp 52K</b></td><td class="r num"><b>Rp 42.850.000</b></td></tr></tfoot>
          </table>
        </div>
      </div>
    </div>
    <p class="cap">Sample data for three branches.</p>
  </div>
</section>

<!-- ───────────── INTEGRITY ───────────── -->
<section class="integrity" id="integrity">
  <div class="wrap">
    <div class="int-top">
      <div>
        <h2 class="h-lg">Built for operations you can trust.</h2>
        <p class="lead" style="margin-top:28px">When something changes, you should be able to see what changed, who changed it, and when.</p>
      </div>
      <div class="log" role="img" aria-label="Sample audit trail with four entries">
        <div class="log-h">
          <div class="log-h-title">
            <span class="log-beacon"></span>
            <span>Tamper-Evident Ledger</span>
          </div>
          <span>Immutable Record Sample</span>
        </div>
        <ul>
          <li><time>14:21:08</time><div><b>Item voided</b> · Cafe Latte × 1<em>Andi K. · approved by Rina S. · Order #1041</em></div></li>
          <li><time>14:16:44</time><div><b>Stock adjusted</b> · Fresh milk −500 ml<em>Rina S. · reason: spillage · Central Hub</em></div></li>
          <li><time>14:02:31</time><div><b>Cash drawer opened</b> · Shift 2<em>Maya P. · Register 01</em></div></li>
          <li><time>13:48:12</time><div><b>Reversal posted</b> · Order #1037<em>Rina S. · original record unchanged</em></div></li>
        </ul>
      </div>
    </div>
    <div class="pillars">
      <div class="pillar">
        <div class="pillar-num">01</div>
        <h3>Immutable transactions</h3>
        <p>Completed transactions are treated as durable operational records. Corrections go through a reversal, not a silent edit.</p>
      </div>
      <div class="pillar">
        <div class="pillar-num">02</div>
        <h3>Traceable inventory</h3>
        <p>Stock movements keep an operational trail. Deductions, adjustments, and restocks link back to a shift.</p>
      </div>
      <div class="pillar">
        <div class="pillar-num">03</div>
        <h3>Controlled access</h3>
        <p>Sensitive actions, like voiding an item or opening the cash drawer, are permission-controlled.</p>
      </div>
      <div class="pillar">
        <div class="pillar-num">04</div>
        <h3>Auditability</h3>
        <p>Important operational actions can be traced to a user and a time.</p>
      </div>
    </div>
  </div>
</section>

<!-- ───────────── PHILOSOPHY ───────────── -->
<section class="phil">
  <div class="wrap">
    <h2>Simple for the cashier.<span class="serif">Powerful for the operator.</span></h2>
    <p class="lead">Apeiron keeps everyday workflows focused while giving the business the operational structure it needs underneath.</p>
  </div>
</section>

<!-- ───────────── AUDIENCE ───────────── -->
<section class="sec" id="solutions" style="padding-top:0">
  <div class="wrap">
    <h2 class="h-md" style="margin-bottom:40px">Made for kitchens and counters that are growing.</h2>
    <div class="aud">
      <div class="aud-row">
        <h3 class="serif">Coffee shops</h3>
        <p><span>Fast service.</span><span>Consistent recipes.</span><span>Controlled stock.</span></p>
      </div>
      <div class="aud-row">
        <h3 class="serif">Fast food</h3>
        <p><span>High transaction volume.</span><span>Clear kitchen flow.</span></p>
      </div>
      <div class="aud-row">
        <h3 class="serif">Bakeries</h3>
        <p><span>Ingredient-heavy operations.</span><span>Production visibility.</span></p>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="how" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">From setup to clarity.</h2>
      <p class="lead">Three steps, the same for one outlet or ten.</p>
    </div>
    <div class="steps">
      <div class="step">
        <span class="n">01</span>
        <h3>Set up</h3>
        <p>Add branches, products, recipes, ingredients, and your team with the right permissions.</p>
      </div>
      <div class="step">
        <span class="n">02</span>
        <h3>Run</h3>
        <p>Cashiers sell, the kitchen prepares, and stock moves with every order — per branch.</p>
      </div>
      <div class="step">
        <span class="n">03</span>
        <h3>Understand</h3>
        <p>Sales, cash, and inventory roll up into one view, traceable back to every record.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec" id="pricing" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="h-lg">Pricing that grows with your branches.</h2>
      <p class="lead">Start with one outlet. Add branches when you are ready.</p>
    </div>
    <div class="plans">
      <div class="plan">
        <h3>Single outlet</h3>
        <p class="pp">For one location getting its operation in order.</p>
        <ul>
          <li>Point of sale and kitchen display</li>
          <li>Recipes and ingredient stock</li>
          <li>Shifts and cash control</li>
          <li>Sales reporting</li>
        </ul>
        <a class="btn btn-secondary" href="/register">Contact sales</a>
      </div>
      <div class="plan dk">
        <div class="plan-tag">Recommended for Chains</div>
        <h3>Multi-branch</h3>
        <p class="pp">For businesses running more than one location.</p>
        <ul>
          <li>Everything in Single outlet</li>
          <li>HQ view across every branch</li>
          <li>Per-branch stock and cash</li>
          <li>Audit trail and access control</li>
        </ul>
        <a class="btn btn-primary" href="/register">Contact sales</a>
      </div>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="cta" id="start">
  <div class="wrap">
    <h2 class="h-xl" style="font-size:clamp(2.5rem,6.4vw,5.5rem)">Bring your operation<br>into one system.</h2>
    <p class="lead">Build a clearer, more controlled way to run your F&amp;B business.</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="/register">Get Started</a>
      <a class="btn btn-secondary" href="#product">Explore Apeiron</a>
    </div>
  </div>
</section>
</main>

<footer>
  <div class="wrap">
    <div class="foot">
      <div class="foot-brand-col">
        <a class="foot-brand-link" href="#top" aria-label="Apeiron Systems — back to top">
          <img src="__FOOTER_LOGO__" alt="Apeiron Systems" class="foot-brand-img" width="135" height="135" />
        </a>
        <p>Operational software for growing F&amp;B businesses. One system for sales, inventory, cash, kitchen operations, and branches.</p>
      </div>
      <div>
        <h4>Product</h4>
        <ul>
          <li><a href="#product">Point of sale</a></li>
          <li><a href="#kitchen">Kitchen display</a></li>
          <li><a href="#inventory">Inventory</a></li>
          <li><a href="#branches">Multi-branch</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="#solutions">Who it’s for</a></li>
          <li><a href="#start">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul>
          <li><a href="#start">Privacy policy</a></li>
          <li><a href="#start">Terms of service</a></li>
        </ul>
      </div>
    </div>
    <div class="legal">
      <span>&copy; 2026 Apeiron Systems</span>
      <span>Product interfaces are shown with sample data.</span>
    </div>
  </div>
</footer>
`;
