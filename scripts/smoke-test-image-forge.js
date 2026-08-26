const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const chrome = process.env.TOOLHUB_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sitePort = 4210;
const debugPort = 9270;
const outputDir = path.join(os.tmpdir(), 'toolhub-image-forge-smoke');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
      const pages = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(response => response.json());
      const page = pages.find(item => item.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (_) {}
    await wait(100);
  }
  throw new Error('Chrome DevTools endpoint was not available.');
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
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'toolhub-image-forge-profile-'));
  const browser = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  const failures = [];

  try {
    const c = client(await endpoint());
    await c.ready;
    await c.call('Runtime.enable');
    await c.call('Page.enable');
    const evaluate = async expression => {
      const response = await c.call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      return response.result.value;
    };
    const waitFor = async expression => {
      for (let index = 0; index < 150; index += 1) {
        if (await evaluate(expression)) return;
        await wait(100);
      }
      throw new Error(`Timed out waiting for ${expression}`);
    };
    const loadImage = async (language = 'zh-Hant') => {
      await evaluate(`(async()=>{window.ToolHubLanguage?.closePrompt();localStorage.setItem('toolhub-language','${language}');sessionStorage.setItem('toolhub-language-prompt-dismissed','1');const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=800;const context=canvas.getContext('2d');const gradient=context.createLinearGradient(0,0,1200,800);gradient.addColorStop(0,'#0ea5e9');gradient.addColorStop(1,'#f43f5e');context.fillStyle=gradient;context.fillRect(0,0,1200,800);context.fillStyle='#fff';context.font='700 96px sans-serif';context.fillText('IMAGE FORGE',190,430);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const file=new File([blob],'touch-test.png',{type:'image/png'});const transfer=new DataTransfer();transfer.items.add(file);const input=document.getElementById('file-input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await waitFor(`!!document.querySelector('.cropper-container') && document.querySelector('.cropper-crop-box')?.offsetWidth > 40`);
      await wait(250);
    };
    const state = async () => evaluate(`(()=>{const box=document.querySelector('.cropper-crop-box'),face=document.querySelector('.cropper-face'),point=document.querySelector('.cropper-point.point-se'),container=document.querySelector('.cropper-container'),cropper=document.getElementById('image-workspace').cropper,rect=element=>{const r=element.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,left:r.left,top:r.top,right:r.right,bottom:r.bottom,cx:r.left+r.width/2,cy:r.top+r.height/2}};return{box:rect(box),face:rect(face),point:rect(point),container:rect(container),scrollY,ratio:cropper?.getCanvasData().width||0,touchAction:getComputedStyle(container).touchAction,faceTouchAction:getComputedStyle(face).touchAction,hit:document.elementFromPoint(rect(face).cx,rect(face).cy)?.className||''}})()`);
    const touchDrag = async (from, to) => {
      await c.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, radiusX: 8, radiusY: 8, force: 1, id: 1 }] });
      for (let step = 1; step <= 6; step += 1) {
        await c.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 6, y: from.y + (to.y - from.y) * step / 6, radiusX: 8, radiusY: 8, force: 1, id: 1 }] });
      }
      await c.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await wait(150);
    };
    const mouseDrag = async (from, to) => {
      await c.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 });
      for (let step = 1; step <= 6; step += 1) {
        await c.call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + (to.x - from.x) * step / 6, y: from.y + (to.y - from.y) * step / 6, button: 'left', buttons: 1 });
      }
      await c.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 });
      await wait(150);
    };
    const pinchZoom = async center => {
      const start = 22;
      const end = 52;
      await c.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
        { x: center.x - start, y: center.y, radiusX: 8, radiusY: 8, force: 1, id: 1 },
        { x: center.x + start, y: center.y, radiusX: 8, radiusY: 8, force: 1, id: 2 },
      ] });
      for (let step = 1; step <= 6; step += 1) {
        const distance = start + (end - start) * step / 6;
        await c.call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [
          { x: center.x - distance, y: center.y, radiusX: 8, radiusY: 8, force: 1, id: 1 },
          { x: center.x + distance, y: center.y, radiusX: 8, radiusY: 8, force: 1, id: 2 },
        ] });
      }
      await c.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await wait(150);
    };

    for (const mode of ['mobile', 'desktop']) {
      const mobile = mode === 'mobile';
      await c.call('Emulation.setDeviceMetricsOverride', { width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: mobile ? 3 : 1, mobile });
      await c.call('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: 5 });
      await c.call('Page.navigate', { url: `http://127.0.0.1:${sitePort}/image-forge/` });
      await waitFor(`document.readyState === 'complete' && typeof Cropper === 'function' && !!document.getElementById('file-input')`);
      await loadImage();
      await evaluate(`document.documentElement.style.scrollBehavior='auto';document.querySelector('.cropper-container').scrollIntoView({block:'center',behavior:'instant'});`);
      await wait(100);
      const beforeMove = await state();
      const moveFrom = { x: beforeMove.face.cx, y: beforeMove.face.cy };
      const moveTo = { x: moveFrom.x + (mobile ? 24 : 45), y: moveFrom.y + (mobile ? 18 : 30) };
      mobile ? await touchDrag(moveFrom, moveTo) : await mouseDrag(moveFrom, moveTo);
      const afterMove = await state();
      const moved = Math.hypot(afterMove.box.x - beforeMove.box.x, afterMove.box.y - beforeMove.box.y);
      if (moved < 8) failures.push(`${mode}: crop box did not move (${moved.toFixed(1)}px)`);
      if (Math.abs(afterMove.scrollY - beforeMove.scrollY) > 1) failures.push(`${mode}: page scrolled during crop movement`);

      const resizeFrom = { x: afterMove.point.cx, y: afterMove.point.cy };
      const resizeTo = { x: resizeFrom.x - (mobile ? 24 : 40), y: resizeFrom.y - (mobile ? 18 : 30) };
      mobile ? await touchDrag(resizeFrom, resizeTo) : await mouseDrag(resizeFrom, resizeTo);
      const afterResize = await state();
      const resized = Math.abs(afterResize.box.width - afterMove.box.width) + Math.abs(afterResize.box.height - afterMove.box.height);
      if (resized < 8) failures.push(`${mode}: crop box did not resize (${resized.toFixed(1)}px)`);
      if (afterResize.box.left < afterResize.container.left - 1 || afterResize.box.right > afterResize.container.right + 1) failures.push(`${mode}: crop box escaped its workspace`);

      if (mobile) {
        const ratioBeforePinch = afterResize.ratio;
        await pinchZoom({ x: afterResize.face.cx, y: afterResize.face.cy });
        const ratioAfterPinch = (await state()).ratio;
        if (Math.abs(ratioAfterPinch - ratioBeforePinch) < 0.01) failures.push('mobile: two-finger zoom did not change image scale');
      }

      const output = await evaluate(`(async()=>{const image=document.getElementById('image-workspace'),square=document.querySelector('input[name="aspect-ratio"][value="1"]');square.click();await new Promise(resolve=>setTimeout(resolve,80));const data=image.cropper.getData();const canvas=image.cropper.getCroppedCanvas({width:200,height:200,imageSmoothingEnabled:true,imageSmoothingQuality:'high'});window.__imageForgeDownload=null;const createObjectURL=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.__imageForgeDownload={size:blob.size,type:blob.type};return createObjectURL(blob)};document.getElementById('btn-export').click();for(let index=0;index<50&&!window.__imageForgeDownload;index+=1)await new Promise(resolve=>setTimeout(resolve,50));return{ratio:data.width/data.height,width:canvas.width,height:canvas.height,dataLength:canvas.toDataURL('image/png').length,download:window.__imageForgeDownload}})()`);
      if (Math.abs(output.ratio - 1) > 0.02) failures.push(`${mode}: 1:1 aspect ratio was not applied`);
      if (output.width !== 200 || output.height !== 200 || output.dataLength < 500) failures.push(`${mode}: cropped canvas export was invalid`);
      if (!output.download || output.download.size < 100 || output.download.type !== 'image/webp') failures.push(`${mode}: export button did not produce a WebP download`);

      const shot = await c.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(outputDir, `${mode}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`${mode.toUpperCase()}_MOVE_PX=${moved.toFixed(1)}`);
      console.log(`${mode.toUpperCase()}_RESIZE_DELTA_PX=${resized.toFixed(1)}`);
      console.log(`${mode.toUpperCase()}_TOUCH_ACTION=${afterResize.touchAction}`);
      console.log(`${mode.toUpperCase()}_HIT_TARGET=${afterResize.hit}`);
      console.log(`${mode.toUpperCase()}_HANDLE_CSS_PX=${afterResize.point.width.toFixed(1)}`);
      console.log(`${mode.toUpperCase()}_EXPORT_BYTES=${output.download?.size || 0}`);
    }
    const english = fs.readFileSync(path.join(root, 'en', 'image-forge', 'index.html'), 'utf8');
    for (const marker of ['id="cropper-stage"', 'zoomOnTouch: true', 'minCropBoxWidth: 48', "event.target.closest('.cropper-container')"]) {
      if (!english.includes(marker)) failures.push(`English page is missing mobile crop fix: ${marker}`);
    }
    await c.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await c.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await evaluate(`localStorage.setItem('toolhub-language','en')`);
    await c.call('Page.navigate', { url: `http://127.0.0.1:${sitePort}/en/image-forge/` });
    await waitFor(`document.readyState === 'complete' && typeof Cropper === 'function' && !!document.getElementById('file-input')`);
    await loadImage('en');
    await evaluate(`document.documentElement.style.scrollBehavior='auto';document.querySelector('.cropper-container').scrollIntoView({block:'center',behavior:'instant'});`);
    await wait(100);
    const englishBefore = await state();
    await touchDrag({ x: englishBefore.face.cx, y: englishBefore.face.cy }, { x: englishBefore.face.cx + 24, y: englishBefore.face.cy + 18 });
    const englishAfter = await state();
    if (Math.hypot(englishAfter.box.x - englishBefore.box.x, englishAfter.box.y - englishBefore.box.y) < 8) failures.push('English mobile page: crop box did not move');
    console.log(`ENGLISH_MOBILE_MOVE_PX=${Math.hypot(englishAfter.box.x - englishBefore.box.x, englishAfter.box.y - englishBefore.box.y).toFixed(1)}`);
    c.close();
  } finally {
    browser.kill();
    await Promise.race([new Promise(resolve => browser.once('close', resolve)), wait(1500)]);
    server.close();
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  console.log(`IMAGE_FORGE_VISUAL_DIR=${outputDir}`);
  console.log(`IMAGE_FORGE_FAILURES=${failures.length}`);
  failures.forEach(failure => console.error(`- ${failure}`));
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
