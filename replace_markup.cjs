const fs = require('fs');
let content = fs.readFileSync('src/marketing/markup.ts', 'utf8');

// Replace hero date/time fallback
content = content.replace(/<span id="hero-date">Oct 6, 2026<\/span> &middot; <span id="hero-time"><\/span> &middot; Simulated dashboard/, '<span id="hero-date"></span><span id="hero-time"></span>Simulated dashboard');

// Replace branch date/time fallback
content = content.replace(/<span class="when">Oct 6, 2026 \u00b7 14:22<\/span>/, '<span class="when" id="branch-time">Simulated HQ View</span>');

fs.writeFileSync('src/marketing/markup.ts', content);
