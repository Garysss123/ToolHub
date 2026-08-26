const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),chrome=process.env.TOOLHUB_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',sitePort=4186,debugPort=9236;
const expectedTools=Number(process.env.TOOLHUB_TOTAL_TOOLS||450);
const extraSampleRoutes=(process.env.TOOLHUB_I18N_SAMPLE_ROUTES||'').split(',').map(route=>route.trim().replace(/^\/+|\/+$/g,'')).filter(Boolean).map(route=>`/${route.startsWith('en/')?route:`en/${route}`}/`);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,`http://localhost:${sitePort}`).pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)){response.writeHead(403).end();return}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){response.writeHead(404).end('Not found');return}response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response)});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function endpoint(){for(let i=0;i<100;i++){try{const pages=await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r=>r.json()),page=pages.find(x=>x.type==='page'&&x.url.includes(`127.0.0.1:${sitePort}`));if(page)return page.webSocketDebuggerUrl}catch(_){}await wait(100)}throw new Error('無法連線至 Chrome DevTools')}
function client(url){const ws=new WebSocket(url),pending=new Map();let id=0;ws.onmessage=event=>{const data=JSON.parse(event.data);if(!data.id)return;const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(new Error(data.error.message)):job.resolve(data.result)};const ready=new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});return{ready,call:async(method,params={})=>{await ready;return new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}))})},close:()=>ws.close()}}
async function main(){
  if(!fs.existsSync(chrome))throw new Error(`找不到 Chrome：${chrome}`);
  await new Promise(resolve=>server.listen(sitePort,'127.0.0.1',resolve));
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'toolhub-i18n-smoke-')),shotDir=path.join(os.tmpdir(),'toolhub-i18n-visual');fs.mkdirSync(shotDir,{recursive:true});
  const browser=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--lang=en-US',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,`http://127.0.0.1:${sitePort}/`],{stdio:'ignore',windowsHide:true});
  const failures=[],check=(condition,message)=>{if(!condition)failures.push(message)};
  try{
    const c=client(await endpoint());await c.ready;await c.call('Runtime.enable');await c.call('Page.enable');await c.call('Network.enable');await c.call('Network.setCacheDisabled',{cacheDisabled:true});
    const evaluate=async expression=>{const response=await c.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value};
    const waitFor=async expression=>{for(let i=0;i<300;i++){if(await evaluate(expression))return;await wait(100)}throw new Error(`等待頁面條件逾時：${expression}`)};
    const navigate=async route=>{await c.call('Page.navigate',{url:`http://127.0.0.1:${sitePort}${route}`});await waitFor(`document.readyState==='complete'`);await wait(900)};
    await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await waitFor(`!!document.querySelector('#language-welcome')`);
    let state=await evaluate(`(()=>({path:location.pathname,suggested:window.ToolHubLanguage?.suggested,recommended:document.querySelector('[data-language-choice="en"]')?.classList.contains('recommended'),saved:localStorage.getItem('toolhub-language')}))()`);
    check(state.path==='/'&&state.suggested==='en'&&state.recommended&&!state.saved,`首次英文建議狀態錯誤：${JSON.stringify(state)}`);
    let capture=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const welcome=path.join(shotDir,'language-welcome-mobile.png');fs.writeFileSync(welcome,Buffer.from(capture.data,'base64'));
    await c.call('Emulation.setCPUThrottlingRate',{rate:6});await c.call('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:500000,uploadThroughput:250000,connectionType:'cellular4g'});
    const coldMobileSwitchStarted=Date.now();
    await evaluate(`document.querySelector('[data-language-choice="en"]').click()`);await waitFor(`location.pathname==='/en/'&&!!document.querySelector('#component-sidebar .nav-item')`);await wait(300);
    const coldMobileSwitchMs=Date.now()-coldMobileSwitchStarted;
    check(coldMobileSwitchMs<20000,`Throttled cold mobile English switch took ${coldMobileSwitchMs}ms`);
    await c.call('Emulation.setCPUThrottlingRate',{rate:1});await c.call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    state=await evaluate(`(()=>({path:location.pathname,lang:document.documentElement.lang,saved:localStorage.getItem('toolhub-language'),home:[...document.querySelectorAll('header a span')].some(x=>x.textContent.trim()==='Home'),search:document.querySelector('#tool-search-trigger')?.textContent.includes('Search Tools'),total:document.querySelector('#tool-search-total')?.textContent,footer:document.querySelector('footer [data-language-switch-label]')?.textContent.trim(),footerLinks:[...document.querySelectorAll('footer a')].map(a=>a.getAttribute('href')),autoRedirect:performance.getEntriesByType('navigation')[0]?.redirectCount||0}))()`);
    check(state.path==='/en/'&&state.lang==='en'&&state.saved==='en',`英文切換或偏好記錄錯誤：${JSON.stringify(state)}`);check(state.home&&state.search,'英文 Header 未完整翻譯');check(String(state.total||'').includes(String(expectedTools)),`英文搜尋索引不是 ${expectedTools}`);check(state.footer==='Traditional Chinese','英文 Footer 切換標籤錯誤');check(['/en/about/','/en/contact/','/en/privacy-policy/','/en/terms-of-service/'].every(link=>state.footerLinks.includes(link)),`英文 Footer 連結錯誤：${state.footerLinks.join(', ')}`);
    await c.call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await wait(180);
    capture=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const home=path.join(shotDir,'english-home-desktop.png');fs.writeFileSync(home,Buffer.from(capture.data,'base64'));
    let compactHeader='';
    for(const width of [320,390,768,1024,1280,1366]){
      await c.call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<768});await wait(180);
      state=await evaluate(`(()=>{const header=document.querySelector('header'),headerRect=header.getBoundingClientRect();const selectors=['#tool-search-trigger','header [data-language-switch]','#theme-trigger-btn','#sidebar-trigger-btn'];const items=selectors.map(selector=>{const element=document.querySelector(selector),rect=element?.getBoundingClientRect();return{selector,visible:!!rect&&rect.width>0&&rect.height>0,left:rect?.left,right:rect?.right,top:rect?.top,bottom:rect?.bottom,height:rect?.height}});return{width:innerWidth,header:{top:headerRect.top,bottom:headerRect.bottom,height:headerRect.height},horizontalOverflow:header.scrollWidth>header.clientWidth+1,items}})()`);
      check(!state.horizontalOverflow&&state.items.every(item=>item.visible&&item.left>=-0.5&&item.right<=state.width+0.5&&item.top>=state.header.top-0.5&&item.bottom<=state.header.bottom+0.5),`${width}px Header 按鈕超出範圍：${JSON.stringify(state)}`);
      if(width===1024){const data=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});compactHeader=path.join(shotDir,'english-header-1024.png');fs.writeFileSync(compactHeader,Buffer.from(data.data,'base64'))}
    }
    await c.call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await wait(180);
    await evaluate(`document.querySelector('footer [data-language-switch]').click()`);await waitFor(`location.pathname==='/'`);check(await evaluate(`localStorage.getItem('toolhub-language')==='zh-Hant'`),'切回中文後未記住選擇');
    await navigate('/en/json-formatter/');check(await evaluate(`location.pathname==='/en/json-formatter/'`),'已儲存中文偏好時英文 URL 被自動重新導向');
    const detailShots={};
    const samples=[...new Set(['/en/about/','/en/contact/','/en/privacy-policy/','/en/terms-of-service/','/en/url-encoder/','/en/hex-file-viewer/','/en/audio-studio/','/en/bookmarklet-builder/','/en/json-to-xml/','/en/sdxl-prompt-builder/','/en/http-status-codes/','/en/port-number-lookup/','/en/html-entity-lookup/','/en/mime-type-lookup/','/en/file-signature-lookup/','/en/website-seo-audit/','/en/ai-website-seo-checker/','/en/svg-studio/','/en/schema-generator/',...extraSampleRoutes])];
    for(const route of samples){
      await navigate(route);
      state=await evaluate(`(()=>{const cjk=/[\\u3400-\\u9fff\\uf900-\\ufaff]/;const skipped=new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','NOSCRIPT']);const texts=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const p=n.parentElement;if(!p||skipped.has(p.tagName)||p.closest('[data-i18n-skip]'))continue;const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden')continue;if(cjk.test(n.nodeValue))texts.push(n.nodeValue.trim())}return{path:location.pathname,lang:document.documentElement.lang,title:document.title,h1:document.querySelector('h1')?.textContent.trim(),cjk:texts.slice(0,5),replacement:document.body.innerText.includes('�'),header:!!document.querySelector('#tool-search-trigger'),footer:!!document.querySelector('footer [data-language-switch]')}})()`);
      check(state.path===route,`${route} 發生非預期導向至 ${state.path}`);check(state.lang==='en'&&state.header&&state.footer,`${route} 英文共用介面載入失敗`);check(state.h1&&!/[\u3400-\u9fff]/.test(state.h1),`${route} H1 未英文化：${state.h1}`);check(!state.cjk.length,`${route} 動態可見內容殘留中文：${state.cjk.join(' | ')}`);check(!state.replacement,`${route} 出現編碼替代字元`);
      if(route==='/en/about/'||route==='/en/privacy-policy/'||route==='/en/url-encoder/'){
        const name=route.includes('about')?'english-about-desktop.png':route.includes('privacy-policy')?'english-privacy-desktop.png':'english-classic-tool-desktop.png';
        const shot=path.join(shotDir,name),data=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(shot,Buffer.from(data.data,'base64'));detailShots[route]=shot;
      }
    }
    await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await navigate('/hex-file-viewer/');
    await c.call('Emulation.setCPUThrottlingRate',{rate:6});await c.call('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:500000,uploadThroughput:250000,connectionType:'cellular4g'});
    const deepMobileSwitchStarted=Date.now();await evaluate(`document.querySelector('header [data-language-switch]').click()`);await waitFor(`location.pathname==='/en/hex-file-viewer/'&&!!window.ToolHubI18n&&!!document.querySelector('#expansion-app [data-field]')`);await wait(300);const deepMobileSwitchMs=Date.now()-deepMobileSwitchStarted;
    check(deepMobileSwitchMs<20000,`Throttled deep-page mobile English switch took ${deepMobileSwitchMs}ms`);
    await c.call('Emulation.setCPUThrottlingRate',{rate:1});await c.call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    capture=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const mobile=path.join(shotDir,'english-tool-mobile.png');fs.writeFileSync(mobile,Buffer.from(capture.data,'base64'));
    const heavyMobileLoads=[];
    for(const route of ['/en/sdxl-prompt-builder/','/en/http-status-codes/']){
      await c.call('Emulation.setCPUThrottlingRate',{rate:6});await c.call('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:500000,uploadThroughput:250000,connectionType:'cellular4g'});
      const started=Date.now();await navigate(route);const elapsed=Date.now()-started;heavyMobileLoads.push(`${route}=${elapsed}`);check(elapsed<20000,`Throttled heavy mobile page took ${elapsed}ms: ${route}`);
      await c.call('Emulation.setCPUThrottlingRate',{rate:1});await c.call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    }
    console.log(`I18N_COLD_MOBILE_SWITCH_MS=${coldMobileSwitchMs}`);console.log(`I18N_DEEP_MOBILE_SWITCH_MS=${deepMobileSwitchMs}`);console.log(`I18N_HEAVY_MOBILE_LOAD_MS=${heavyMobileLoads.join(',')}`);console.log(`I18N_VISUAL_WELCOME=${welcome}`);console.log(`I18N_VISUAL_HOME=${home}`);console.log(`I18N_VISUAL_HEADER_1024=${compactHeader}`);console.log(`I18N_VISUAL_ABOUT=${detailShots['/en/about/']}`);console.log(`I18N_VISUAL_PRIVACY=${detailShots['/en/privacy-policy/']}`);console.log(`I18N_VISUAL_CLASSIC=${detailShots['/en/url-encoder/']}`);console.log(`I18N_VISUAL_MOBILE=${mobile}`);c.close();
  }finally{browser.kill();await Promise.race([new Promise(resolve=>browser.once('close',resolve)),wait(1500)]);server.close();const resolved=path.resolve(profile),tempRoot=path.resolve(os.tmpdir());if(resolved.startsWith(tempRoot+path.sep))fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:150})}
  console.log(`I18N_FAILURES=${failures.length}`);if(failures.length){failures.forEach(x=>console.error(`- ${x}`));process.exitCode=1}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
