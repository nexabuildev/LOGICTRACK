const fs = require('fs');
const path = require('path');

const dir = 'src/features/inventory/pages';
const files = ['ProductsPage.jsx', 'AuditLogsPage.jsx', 'StoresPage.jsx', 'UsersPage.jsx'];

const replacements = [
  // Remove Navbar
  { match: /import \{ Navbar \} from '\.\.\/\.\.\/\.\.\/components\/Navbar';\r?\n/g, replace: '' },
  { match: /<Navbar \/>\r?\n/g, replace: '' },
  
  // Backgrounds
  { match: /bg-\[#f5f5f7\]/g, replace: 'bg-light-base' },
  { match: /dark:bg-nord-bg/g, replace: 'dark:bg-dark-base' },
  { match: /dark:bg-nord-surface\/40/g, replace: 'dark:bg-dark-elevated\/40' },
  { match: /dark:bg-nord-surface\/50/g, replace: 'dark:bg-dark-elevated\/50' },
  { match: /dark:bg-nord-surface\/60/g, replace: 'dark:bg-dark-elevated\/60' },
  { match: /dark:bg-nord-surface/g, replace: 'dark:bg-dark-elevated' },
  { match: /bg-white/g, replace: 'bg-light-elevated' },
  
  // Borders
  { match: /dark:border-nord-border\/60/g, replace: 'dark:border-white\/5' },
  { match: /dark:border-nord-border\/50/g, replace: 'dark:border-white\/5' },
  { match: /dark:border-nord-border/g, replace: 'dark:border-white\/5' },
  { match: /border-gray-100/g, replace: 'border-black\/5' },
  { match: /border-gray-150/g, replace: 'border-black\/5' },
  { match: /border-gray-200/g, replace: 'border-black\/5' },
  { match: /border-gray-250/g, replace: 'border-black\/5' },
  { match: /border-gray-255/g, replace: 'border-black\/5' },
  { match: /border-slate-800/g, replace: 'border-white\/5' },
  { match: /dark:border-slate-800/g, replace: 'dark:border-white\/5' },
  
  // Text
  { match: /dark:text-nord-text-muted/g, replace: 'dark:text-ghost\/60' },
  { match: /dark:text-nord-text/g, replace: 'dark:text-ghost' },
  { match: /dark:text-white/g, replace: 'dark:text-ghost' },
  { match: /dark:text-neutral-100/g, replace: 'dark:text-ghost' },
  { match: /dark:text-neutral-300/g, replace: 'dark:text-ghost\/80' },
  { match: /dark:text-neutral-400/g, replace: 'dark:text-ghost\/60' },
  { match: /dark:text-neutral-500/g, replace: 'dark:text-ghost\/40' },
  { match: /text-slate-800/g, replace: 'text-ink' },
  { match: /text-slate-850/g, replace: 'text-ink' },
  { match: /text-slate-900/g, replace: 'text-ink' },
  { match: /text-slate-950/g, replace: 'text-ink' },
  { match: /text-slate-700/g, replace: 'text-ink\/80' },
  { match: /text-slate-705/g, replace: 'text-ink\/80' },
  { match: /text-slate-600/g, replace: 'text-ink\/70' },
  { match: /text-slate-500/g, replace: 'text-ink\/60' },
  { match: /text-slate-505/g, replace: 'text-ink\/60' },
  { match: /text-slate-400/g, replace: 'text-ink\/40' },
  { match: /text-slate-450/g, replace: 'text-ink\/40' },
  { match: /text-slate-455/g, replace: 'text-ink\/40' },
  
  // Dividers
  { match: /divide-gray-150/g, replace: 'divide-black\/5' },
  
  // Remove min-h-screen from the main wrappers
  { match: /className=\"min-h-screen/g, replace: 'className=\"animate-fade-in w-full flex flex-col gap-6' }
];

files.forEach(file => {
  const filepath = path.join(dir, file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.match, r.replace);
    });
    fs.writeFileSync(filepath, content);
    console.log('Processed ' + file);
  }
});
