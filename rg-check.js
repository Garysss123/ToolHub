const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, 'random-color-generator', 'index.html'), 'utf8');
const match = html.match(/App Engine -->\s*<script>([\s\S]*?)<\/script>/);
const js = match[1];

let parens = 0, braces = 0, brackets = 0;
let inStr = null, inTmpl = false, esc = false;

for (let i = 0; i < js.length; i++) {
  const c = js[i];
  if (esc) { esc = false; continue; }
  if (c === '\\' && (inStr || inTmpl)) { esc = true; continue; }
  if (c === "'" && !inTmpl && inStr === null) { inStr = "'"; continue; }
  if (c === '"' && !inTmpl && inStr === null) { inStr = '"'; continue; }
  if (inStr) { if (c === inStr) inStr = null; continue; }
  if (c === '`' && inStr === null) { inTmpl = !inTmpl; continue; }
  if (inTmpl) continue;
  if (c === '(') parens++;
  if (c === ')') parens--;
  if (c === '{') braces++;
  if (c === '}') braces--;
  if (c === '[') brackets++;
  if (c === ']') brackets--;
}

console.log('parens=' + parens + ' braces=' + braces + ' brackets=' + brackets);
if (parens === 0 && braces === 0 && brackets === 0) console.log('BALANCED');
else console.log('IMBALANCED - ' + (parens ? 'parens ' : '') + (braces ? 'braces ' : '') + (brackets ? 'brackets ' : ''));
