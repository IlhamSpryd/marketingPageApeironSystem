const { JSDOM } = require("jsdom");
const dom = new JSDOM('<!DOCTYPE html><div id=\"root\"></div>');
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

// POS Menu
const MENU = {
  Coffee: [
    ["Americano", 28000],
    ["Cafe Latte", 34000],
    ["Cappuccino", 34000],
    ["Flat White", 34000],
  ],
  NonCoffee: [
    ["Matcha Latte", 36000],
    ["Chocolate", 32000],
  ],
  Food: [
    ["Butter Croissant", 24000],
    ["Banana Bread", 22000],
  ],
};
let tab = "Coffee";
const idr = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ptabsHTML = Object.keys(MENU)
  .map(
    (k) =>
      `<button class="ptab" role="tab" aria-selected="${k === tab}" data-tab="${k}">${k}</button>`,
  )
  .join("");

const itemsHTML = MENU[tab]
  .map(
    ([n, p]) =>
      `<button class="item" data-add="${n}" data-price="${p}"><b>${n}</b><span>${idr(p)}</span></button>`,
  )
  .join("");

const cartLinesHTML = `<div class="empty"><b>No items added</b><span>Tap items to build order</span></div>`;
const cartFootHTML = `<div class="sub"><span>Subtotal</span><span>0</span></div><div class="tax"><span>Tax (10%)</span><span>0</span></div><div class="tot"><span>Total</span><b>Rp 0</b></div><button class="btn btn-primary" style="width:100%;margin-top:12px" data-charge="1" disabled>Charge Rp 0</button>`;

// KDS
const STAGES = ["New", "Preparing", "Ready", "Completed"];
const T = [
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
];
function ticket(t, moved) {
  const cl = t.id === moved ? "ticket moved" : "ticket";
  const time = t.end
    ? `<span class="time">${Math.floor((t.end - t.start) / 1000)}s</span>`
    : `<span class="time">${Math.floor(t.age / 60)}:${String(t.age % 60).padStart(2, "0")}</span>`;
  const its = t.items
    .map(
      (i) =>
        `<div class="it"><span><b>${i[0]}</b> ${i[1]}</span>${i[2].map((m) => `<em>${m}</em>`).join("")}</div>`,
    )
    .join("");
  return `<button class="${cl}" data-adv="${t.id}">
    <div class="t-h"><b>#${t.id}</b>${time}</div>${its}
    ${t.stage < 3 ? `<div class="t-a">Advance</div>` : ""}
  </button>`;
}
const boardHTML = STAGES.map((s, i) => {
  const list = T.filter((t) => t.stage === i);
  const shown = i === 3 ? list.slice(-3) : list;
  return `<section class="kcol" aria-label="${s}"><h3 class="kh"><span>${s}</span><span class="kc">${list.length}</span></h3>${shown.map((t) => ticket(t)).join("") || '<p class="kempty">No tickets</p>'}</section>`;
}).join("");

// Inventory
const stock = {
  beans: { n: "Espresso beans", v: 2450, u: "g" },
  milk: { n: "Fresh milk", v: 6400, u: "ml" },
  cup: { n: "Paper cup 8 oz", v: 142, u: "pcs" },
  syr: { n: "Vanilla syrup", v: 850, u: "ml" },
};
const qty = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const stockTblHTML = Object.values(stock)
  .map((s) => {
    const st =
      s.v < 500 && s.u !== "pcs"
        ? '<span class="badge warn">Low</span>'
        : '<span class="badge ok">Good</span>';
    return `<tr><td>${s.n}</td><td class="r">${qty(s.v)} ${s.u}</td><td>${st}</td></tr>`;
  })
  .join("");

const ledger = [
  { t: "14:21", ty: "Sale", it: "Paper cup 8 oz", ch: "−1 pcs", ref: "Order #1041" },
  { t: "14:21", ty: "Sale", it: "Fresh milk", ch: "−150 ml", ref: "Order #1041" },
  { t: "14:21", ty: "Sale", it: "Espresso beans", ch: "−18 g", ref: "Order #1041" },
  { t: "14:16", ty: "Waste", it: "Fresh milk", ch: "−500 ml", ref: "Spillage" },
];
const ledgerTblHTML = ledger
  .map(
    (l) =>
      `<tr><td>${l.t}</td><td>${l.ty}</td><td>${l.it}</td><td class="r num">${l.ch}</td><td>${l.ref}</td></tr>`,
  )
  .join("");

// Branch HQ
const BRANCHES = {
  sales: `
    <table class="tbl">
      <thead><tr><th>Branch</th><th class="r">Transactions</th><th class="r">Avg Order</th><th class="r">Gross Sales</th></tr></thead>
      <tbody>
        <tr><td>Central Hub</td><td class="r">342</td><td class="r">Rp 53K</td><td class="r num">Rp 18.450.000</td></tr>
        <tr><td>North Outlet</td><td class="r">284</td><td class="r">Rp 49K</td><td class="r num">Rp 14.100.000</td></tr>
        <tr><td>South Kiosk</td><td class="r">195</td><td class="r">Rp 52K</td><td class="r num">Rp 10.300.000</td></tr>
      </tbody>
      <tfoot><tr><td><b>Total</b></td><td class="r"><b>821</b></td><td class="r"><b>Rp 52K</b></td><td class="r num"><b>Rp 42.850.000</b></td></tr></tfoot>
    </table>
  `,
  inventory: `
    <table class="tbl">
      <thead><tr><th>Key Item</th><th class="r">Central Hub</th><th class="r">North Outlet</th><th class="r">South Kiosk</th><th class="r">Total</th></tr></thead>
      <tbody>
        <tr><td>Espresso beans</td><td class="r">2.4 kg <span class="badge warn">Low</span></td><td class="r">4.1 kg <span class="badge ok">Ok</span></td><td class="r">1.8 kg <span class="badge warn">Low</span></td><td class="r">8.3 kg</td></tr>
        <tr><td>Fresh milk</td><td class="r">6.4 L <span class="badge ok">Ok</span></td><td class="r">8.2 L <span class="badge ok">Ok</span></td><td class="r">3.5 L <span class="badge warn">Low</span></td><td class="r">18.1 L</td></tr>
        <tr><td>Paper cups</td><td class="r">142 <span class="badge warn">Low</span></td><td class="r">450 <span class="badge ok">Ok</span></td><td class="r">220 <span class="badge ok">Ok</span></td><td class="r">812</td></tr>
      </tbody>
    </table>
  `,
  cash: `
    <table class="tbl">
      <thead><tr><th>Branch</th><th>Active Shift</th><th class="r">Starting Cash</th><th class="r">Cash Sales</th><th class="r">Expected Drawer</th></tr></thead>
      <tbody>
        <tr><td>Central Hub</td><td>Reg 01 (Andi K.)</td><td class="r">Rp 1.000.000</td><td class="r num">Rp 4.250.000</td><td class="r num"><b>Rp 5.250.000</b></td></tr>
        <tr><td>North Outlet</td><td>Reg 01 (Budi S.)</td><td class="r">Rp 1.000.000</td><td class="r num">Rp 3.100.000</td><td class="r num"><b>Rp 4.100.000</b></td></tr>
        <tr><td>South Kiosk</td><td>Reg 01 (Siti N.)</td><td class="r">Rp 500.000</td><td class="r num">Rp 2.800.000</td><td class="r num"><b>Rp 3.300.000</b></td></tr>
      </tbody>
    </table>
  `,
  status: `
    <table class="tbl">
      <thead><tr><th>Branch</th><th>Network Status</th><th>Last Sync</th><th>Pending Receipts</th></tr></thead>
      <tbody>
        <tr><td>Central Hub</td><td><span class="badge ok">Online</span></td><td>Live</td><td class="r">0</td></tr>
        <tr><td>North Outlet</td><td><span class="badge ok">Online</span></td><td>Live</td><td class="r">0</td></tr>
        <tr><td>South Kiosk</td><td><span class="badge warn">Syncing</span></td><td>2 mins ago</td><td class="r">12</td></tr>
      </tbody>
    </table>
  `,
};
const bpanelHTML = BRANCHES.sales;

const fs = require("fs");
let markup = fs.readFileSync("src/marketing/markup.ts", "utf8");

markup = markup.replace(
  '<div class="ptabs" role="tablist" aria-label="Menu categories" id="ptabs"></div>',
  `<div class="ptabs" role="tablist" aria-label="Menu categories" id="ptabs">${ptabsHTML}</div>`,
);
markup = markup.replace(
  '<div class="items" id="items"></div>',
  `<div class="items" id="items">${itemsHTML}</div>`,
);
markup = markup.replace(
  '<div class="cart-lines" id="cartLines" aria-live="polite"></div>',
  `<div class="cart-lines" id="cartLines" aria-live="polite">${cartLinesHTML}</div>`,
);
markup = markup.replace(
  '<div class="cart-foot" id="cartFoot"></div>',
  `<div class="cart-foot" id="cartFoot">${cartFootHTML}</div>`,
);

markup = markup.replace(
  '<div class="board" id="board"></div>',
  `<div class="board" id="board">${boardHTML}</div>`,
);

markup = markup.replace("<tbody></tbody>", `<tbody>${stockTblHTML}</tbody>`);
markup = markup.replace("<tbody></tbody>", `<tbody>${ledgerTblHTML}</tbody>`);

markup = markup.replace(
  '<div class="scroll-x" id="bpanel" role="tabpanel" aria-labelledby="bt-sales" tabindex="0"></div>',
  `<div class="scroll-x" id="bpanel" role="tabpanel" aria-labelledby="bt-sales" tabindex="0">${bpanelHTML}</div>`,
);

fs.writeFileSync("src/marketing/markup.ts", markup);
console.log("Injected static content into markup.ts");
