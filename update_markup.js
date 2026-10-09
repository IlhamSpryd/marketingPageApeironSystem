const fs = require('fs');
let content = fs.readFileSync('src/marketing/markup.ts', 'utf8');

// Add IDs to KPIs
content = content.replace('<b>Rp 42.85M</b>', '<b id="kpi-sales">Rp 42.85M</b>');
content = content.replace('<b>842</b>', '<b id="kpi-tx">842</b>');

// Add ID to the alert and the receipt
content = content.replace('<div class="float f-alert" aria-hidden="true">', '<div class="float f-alert" id="f-alert" aria-hidden="true">');
content = content.replace('<div class="f-row"><span>#1044', '<div class="f-row" id="r-1044"><span>#1044');

fs.writeFileSync('src/marketing/markup.ts', content);
