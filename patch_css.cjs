const fs = require("fs");
let css = fs.readFileSync("src/marketing/marketing.css", "utf8");

css = css.replace(
  "[data-in]{opacity:0;visibility:hidden;transform:translateY(28px)}",
  ".js-enabled [data-in]{opacity:0;visibility:hidden;transform:translateY(28px)}",
);

css = css.replace(
  ".story p{font-size:clamp(1.85rem,4.3vw,3.75rem);line-height:1.12;letter-spacing:-.034em;font-weight:600;color:var(--ink-strong);max-width:19em;margin-bottom:clamp(120px,24vh,260px);opacity:.12;text-wrap:balance;will-change:opacity,transform}",
  ".story p{font-size:clamp(1.85rem,4.3vw,3.75rem);line-height:1.12;letter-spacing:-.034em;font-weight:600;color:var(--ink-strong);max-width:19em;margin-bottom:clamp(120px,24vh,260px);text-wrap:balance;will-change:opacity,transform}\n.js-enabled .story p{opacity:.12}",
);

css = css.replace(
  ".arrow{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;opacity:0}",
  ".arrow{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}\n.js-enabled .arrow{opacity:0}",
);

css = css.replace(
  ".tie{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:2 5;opacity:0}",
  ".tie{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:2 5}\n.js-enabled .tie{opacity:0}",
);

fs.writeFileSync("src/marketing/marketing.css", css);
console.log("CSS patched.");
