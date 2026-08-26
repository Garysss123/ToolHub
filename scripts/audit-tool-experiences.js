const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
global.window = {};
global.document = { addEventListener() {} };
const loadedBatches = [200, 250, 300, 350, 400, 450].filter(batch => fs.existsSync(path.join(root, 'components', `tool-expansion-${batch}.js`)));
for (const batch of loadedBatches) require(`../components/tool-expansion-${batch}.js`);
require('../components/tool-expansion.js');

function pages(base) {
  return fs.readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({ slug: entry.name, file: path.join(base, entry.name, 'index.html') }))
    .filter(item => fs.existsSync(item.file) && fs.readFileSync(item.file, 'utf8').includes('data-expansion-tool'));
}

const zh = pages(root);
const en = pages(path.join(root, 'en'));
const model = window.ToolHubExperienceProfiles;
const workspaces = window.ToolHubWorkspaceProfiles;
const errors = [];
const experienceCounts = new Map();
const structureCounts = new Map();
const layouts = new Map();
const palettes = new Map();
const expectedTools = Number(process.env.TOOLHUB_TOTAL_TOOLS || Math.max(...loadedBatches));
const expectedExpansionPages = expectedTools - 111;

if (zh.length !== expectedExpansionPages || en.length !== expectedExpansionPages) errors.push(`Expected ${expectedExpansionPages} pages per locale, found zh=${zh.length}, en=${en.length}`);
if (new Set(zh.map(item => item.slug)).size !== expectedExpansionPages) errors.push('Traditional Chinese page inventory contains duplicate slugs');
if (zh.some(item => !en.some(candidate => candidate.slug === item.slug))) errors.push('English expansion page inventory is incomplete');

for (const item of zh) {
  const html = fs.readFileSync(item.file, 'utf8');
  const english = fs.readFileSync(path.join(root, 'en', item.slug, 'index.html'), 'utf8');
  const profile = workspaces.bySlug[item.slug] || '';
  const experience = model.forSlug(item.slug, profile);
  const structure = model.structures[experience];
  experienceCounts.set(experience, (experienceCounts.get(experience) || 0) + 1);
  structureCounts.set(structure, (structureCounts.get(structure) || 0) + 1);
  const layout = html.match(/data-layout="([^"]+)"/)?.[1] || 'missing';
  const palette = html.match(/data-palette="([^"]+)"/)?.[1] || 'missing';
  layouts.set(layout, (layouts.get(layout) || 0) + 1);
  palettes.set(palette, (palettes.get(palette) || 0) + 1);
  for (const [locale, source] of [['zh', html], ['en', english]]) {
    if ((source.match(/tool-experience\.css/g) || []).length !== 1) errors.push(`${locale}/${item.slug}: experience stylesheet must load exactly once`);
    if (!source.includes('/components/tool-expansion.js?v=20260823-experiences-2')) errors.push(`${locale}/${item.slug}: experience runtime version is missing`);
  }
  if (!experience || !structure) errors.push(`${item.slug}: no semantic experience or structure assigned`);
}

const expected = Object.keys(model.structures);
for (const experience of expected) if (!experienceCounts.has(experience)) errors.push(`Experience has no assigned tool: ${experience}`);
if (experienceCounts.size < 24) errors.push(`Expected at least 24 experiences, found ${experienceCounts.size}`);
if (structureCounts.size < 24) errors.push(`Expected at least 24 structures, found ${structureCounts.size}`);
if (Math.max(...experienceCounts.values()) > 30) errors.push(`One experience is used by more than 30 tools`);
if (layouts.size !== 8) errors.push(`Expected 8 hero layouts, found ${layouts.size}`);
if (palettes.size !== 8) errors.push(`Expected 8 palettes, found ${palettes.size}`);

if (errors.length) {
  console.error(`EXPERIENCE_AUDIT_FAILED=${errors.length}`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log('EXPERIENCE_AUDIT_OK');
console.log(`EXPERIENCE_PAGES=${zh.length}`);
console.log(`EXPERIENCE_TYPES=${experienceCounts.size}`);
console.log(`EXPERIENCE_STRUCTURES=${structureCounts.size}`);
console.log(`EXPERIENCE_COUNTS=${JSON.stringify(Object.fromEntries([...experienceCounts].sort()))}`);
console.log(`STRUCTURE_COUNTS=${JSON.stringify(Object.fromEntries([...structureCounts].sort()))}`);
console.log(`HERO_LAYOUTS=${JSON.stringify(Object.fromEntries([...layouts].sort()))}`);
console.log(`PALETTES=${JSON.stringify(Object.fromEntries([...palettes].sort()))}`);
