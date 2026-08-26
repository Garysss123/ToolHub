const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const chrome = process.env.TOOLHUB_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const locale = process.env.TOOLHUB_EXPERIENCE_LOCALE === 'en' ? 'en' : 'zh';
const urlPrefix = locale === 'en' ? '/en' : '';
const reviewAll = process.env.TOOLHUB_EXPERIENCE_ALL === '1';
const strictEnglish = process.env.TOOLHUB_STRICT_ENGLISH === '1';
const selectedBatch = process.env.TOOLHUB_EXPERIENCE_BATCH || '';
const sitePort = Number(process.env.TOOLHUB_EXPERIENCE_PORT || (locale === 'en' ? 4217 : 4216));
const debugPort = Number(process.env.TOOLHUB_EXPERIENCE_DEBUG_PORT || (locale === 'en' ? 9277 : 9276));
const outputDir = path.join(os.tmpdir(), `toolhub-experience-review${selectedBatch ? `-${selectedBatch}` : ''}${locale === 'en' ? '-en' : ''}`);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

global.window = {};
global.document = { addEventListener() {} };
for (const batch of [200, 250, 300, 350, 400, 450]) {
  if (fs.existsSync(path.join(root, 'components', `tool-expansion-${batch}.js`))) require(`../components/tool-expansion-${batch}.js`);
}
require('../components/tool-expansion.js');
const experienceModel = window.ToolHubExperienceProfiles;
const workspaceModel = window.ToolHubWorkspaceProfiles;

const pages = fs.readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => ({ slug: entry.name, file: path.join(root, entry.name, 'index.html') }))
  .filter(item => fs.existsSync(item.file))
  .map(item => ({ ...item, html: fs.readFileSync(item.file, 'utf8') }))
  .filter(item => item.html.includes('data-expansion-tool') && (!selectedBatch || item.html.includes(`data-expansion-${selectedBatch}`)))
  .map(item => {
    const profile = workspaceModel.bySlug[item.slug] || '';
    return { ...item, experience: experienceModel.forSlug(item.slug, profile) };
  });

const representatives = [...pages.reduce((map, item) => map.has(item.experience) ? map : map.set(item.experience, item), new Map()).values()];
const targets = reviewAll ? pages : representatives;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://localhost:${sitePort}`).pathname);
  let file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root)) return response.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return response.writeHead(404).end('Not found');
  response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});

async function endpoint() {
  for (let index = 0; index < 100; index += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
      const page = list.find(item => item.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (_) {}
    await wait(100);
  }
  throw new Error('Chrome DevTools endpoint unavailable');
}

function client(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let id = 0;
  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if (!data.id || !pending.has(data.id)) return;
    const job = pending.get(data.id);
    pending.delete(data.id);
    data.error ? job.reject(new Error(data.error.message)) : job.resolve(data.result);
  };
  const ready = new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  return {
    ready,
    call: async (method, params = {}) => {
      await ready;
      return new Promise((resolve, reject) => {
        const callId = ++id;
        pending.set(callId, { resolve, reject });
        ws.send(JSON.stringify({ id: callId, method, params }));
      });
    },
    close: () => ws.close(),
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  await new Promise(resolve => server.listen(sitePort, '127.0.0.1', resolve));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), `toolhub-experience-${locale}-profile-`));
  const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  const failures = [];
  try {
    const c = client(await endpoint());
    await c.ready;
    await c.call('Runtime.enable');
    await c.call('Page.enable');
    const evaluate = async expression => {
      const response = await c.call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      return response.result.value;
    };
    const waitFor = async expression => {
      for (let index = 0; index < 120; index += 1) {
        if (await evaluate(expression)) return;
        await wait(100);
      }
      throw new Error(`Timed out waiting for ${expression}`);
    };

    for (let index = 0; index < targets.length; index += 1) {
      const item = targets[index];
      const mobile = index % 2 === 1;
      const width = mobile ? 390 : 1280;
      const height = mobile ? 844 : 900;
      await c.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
      await c.call('Page.navigate', { url: `http://127.0.0.1:${sitePort}${urlPrefix}/${item.slug}/` });
      await waitFor(`!!document.querySelector('#expansion-app .exp-xp') && !!document.querySelector('#component-header header')`);
      await evaluate(`window.ToolHubLanguage?.closePrompt();localStorage.setItem('toolhub-language','${locale === 'en' ? 'en' : 'zh-Hant'}');sessionStorage.setItem('toolhub-language-prompt-dismissed','1');document.getElementById('exp-run')?.click()`);
      await wait(120);
      await evaluate(`document.documentElement.style.scrollBehavior='auto';document.querySelector('#expansion-app .exp-xp').scrollIntoView({block:'start',behavior:'instant'});window.scrollBy(0,-72)`);
      await wait(80);
      const state = await evaluate(`(()=>{const ids=['exp-run','exp-reset','exp-copy','exp-download','exp-output','exp-status'],xp=document.querySelector('.exp-xp'),host=document.getElementById('expansion-app'),header=document.querySelector('#component-header header'),search=document.querySelector('#tool-search-trigger'),theme=document.querySelector('#theme-trigger-btn'),rect=element=>{if(!element)return null;const r=element.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};return{experience:document.body.dataset.experience,structure:document.body.dataset.structure,lang:document.documentElement.lang,path:location.pathname,cjk:(document.body.innerText.match(/[一-龥]/g)||[]).length,cjkLines:document.body.innerText.split(/\\n+/).map(line=>line.trim()).filter(line=>/[一-龥]/.test(line)).slice(0,16),duplicate:ids.filter(id=>document.querySelectorAll('#'+id).length!==1),fields:document.querySelectorAll('[data-field]').length,error:document.querySelector('#exp-status.error')?.textContent||'',overflow:document.documentElement.scrollWidth-innerWidth,xp:rect(xp),host:rect(host),header:rect(header),search:rect(search),theme:rect(theme),css:getComputedStyle(xp).backgroundColor,output:document.getElementById('exp-output')?.textContent?.length||0}})()`);
      if (state.experience !== item.experience) failures.push(`${item.slug}: expected experience ${item.experience}, found ${state.experience}`);
      if (state.structure !== experienceModel.structures[item.experience]) failures.push(`${item.slug}: incorrect structure ${state.structure}`);
      if (state.duplicate.length) failures.push(`${item.slug}: missing or duplicate IDs ${state.duplicate.join(',')}`);
      if (!state.fields) failures.push(`${item.slug}: no interactive fields`);
      if (state.error) failures.push(`${item.slug}: default run failed: ${state.error}`);
      if (locale === 'en' && (state.lang !== 'en' || !state.path.startsWith('/en/') || strictEnglish && state.cjk)) failures.push(`${item.slug}: English locale mismatch (lang=${state.lang}, path=${state.path}, cjk=${state.cjk}, text=${JSON.stringify(state.cjkLines)})`);
      if (state.overflow > 1) failures.push(`${item.slug}: horizontal overflow ${state.overflow}px at ${width}px`);
      if (!state.xp || state.xp.width < Math.min(340, width - 30) || state.output < 1) failures.push(`${item.slug}: workspace did not render correctly`);
      for (const control of ['search', 'theme']) {
        const child = state[control];
        if (!child || !state.header || child.top < state.header.top - 2 || child.bottom > state.header.bottom + 2) failures.push(`${item.slug}: header ${control} control is out of bounds`);
      }
      if (!reviewAll) {
        const shot = await c.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        fs.writeFileSync(path.join(outputDir, `${String(index + 1).padStart(2, '0')}-${item.experience}-${item.slug}-${width}.png`), Buffer.from(shot.data, 'base64'));
        console.log(`EXPERIENCE_VISUAL_PASS ${item.experience} ${item.slug} ${width}px`);
      }
    }
    c.close();
  } finally {
    browser.kill();
    await Promise.race([new Promise(resolve => browser.once('close', resolve)), wait(1200)]);
    server.close();
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  console.log(`EXPERIENCE_VISUAL_BATCH=${selectedBatch || 'all'}`);
  console.log(`EXPERIENCE_VISUAL_PAGES=${targets.length}`);
  console.log(`EXPERIENCE_VISUAL_DIR=${outputDir}`);
  console.log(`EXPERIENCE_VISUAL_FAILURES=${failures.length}`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
