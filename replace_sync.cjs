const fs = require('fs');
let content = fs.readFileSync('src/marketing/markup.ts', 'utf8');
content = content.replace('<span class="badge warn">Syncing</span>', '<span class="badge ok">Online</span>');
fs.writeFileSync('src/marketing/markup.ts', content);
