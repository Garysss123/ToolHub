const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const totalTools = Number(process.env.TOOLHUB_TOTAL_TOOLS || 450);
const expectedExpansionPages = totalTools - 111;
const cssHref = '/components/tool-experience.css?v=20260823-1';
const jsHref = '/components/tool-expansion.js?v=20260823-experiences-2';

function expansionPages(base) {
  return fs.readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(base, entry.name, 'index.html'))
    .filter(file => fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('data-expansion-tool'));
}

function update(file) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/\s*<link\b[^>]*href=["']\/components\/tool-experience\.css[^"']*["'][^>]*>/gi, '');
  const expansionCss = /(<link\b[^>]*href=["']\/components\/tool-expansion\.css[^"']*["'][^>]*>)/i;
  if (!expansionCss.test(html)) throw new Error(`${file} is missing tool-expansion.css`);
  html = html.replace(expansionCss, `$1\n<link rel="stylesheet" href="${cssHref}">`);
  html = html.replace(/\/components\/tool-expansion\.js(?:\?[^"']*)?/g, jsHref);
  fs.writeFileSync(file, html, 'utf8');
}

const zh = expansionPages(root);
const en = expansionPages(path.join(root, 'en'));
if (zh.length !== expectedExpansionPages || en.length !== expectedExpansionPages) throw new Error(`Expected ${expectedExpansionPages} pages per language, found zh=${zh.length}, en=${en.length}`);
[...zh, ...en].forEach(update);
console.log(`EXPERIENCE_PAGES_ZH=${zh.length}`);
console.log(`EXPERIENCE_PAGES_EN=${en.length}`);
console.log(`EXPERIENCE_PAGES_UPDATED=${zh.length + en.length}`);
