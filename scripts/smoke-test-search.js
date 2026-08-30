const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),chrome=process.env.TOOLHUB_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',sitePort=4185,debugPort=9235;
const expectedTools=Number(process.env.TOOLHUB_TOTAL_TOOLS||600);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,`http://localhost:${sitePort}`).pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)){response.writeHead(403).end();return}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){response.writeHead(404).end('Not found');return}response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response)});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function endpoint(){for(let i=0;i<60;i++){try{const pages=await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r=>r.json()),page=pages.find(x=>x.type==='page'&&x.url.includes(`127.0.0.1:${sitePort}`));if(page)return page.webSocketDebuggerUrl}catch(_){}await wait(100)}throw new Error('無法連線至 Chrome DevTools')}
function client(url){const ws=new WebSocket(url),pending=new Map();let id=0;ws.onmessage=event=>{const data=JSON.parse(event.data);if(!data.id)return;const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(new Error(data.error.message)):job.resolve(data.result)};const ready=new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});return{ready,call:async(method,params={})=>{await ready;return new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}))})},close:()=>ws.close()}}
async function main(){
  if(!fs.existsSync(chrome))throw new Error(`找不到 Chrome：${chrome}`);
  await new Promise(resolve=>server.listen(sitePort,'127.0.0.1',resolve));
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'toolhub-search-smoke-')),shotDir=path.join(os.tmpdir(),'toolhub-search-visual');fs.mkdirSync(shotDir,{recursive:true});
  const browser=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,`http://127.0.0.1:${sitePort}/`],{stdio:'ignore',windowsHide:true});
  const failures=[];
  try{
    const c=client(await endpoint());await c.ready;await c.call('Runtime.enable');await wait(2200);
    const evaluate=async expression=>{const response=await c.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value};
    const waitFor=async expression=>{for(let i=0;i<80;i++){if(await evaluate(expression))return;await wait(100)}throw new Error(`等待頁面條件逾時：${expression}`)};
    const check=(condition,message)=>{if(!condition)failures.push(message)};
    await waitFor(`!!document.querySelector('#tool-search-trigger')&&!!window.ToolHubSearch&&document.querySelector('#tool-search-total')?.textContent.includes('${expectedTools}')`);
    await evaluate(`window.ToolHubLanguage?.closePrompt()`);
    let state=await evaluate(`(()=>({trigger:!!document.querySelector('#tool-search-trigger'),dialog:!!document.querySelector('[role="dialog"]'),total:document.querySelector('#tool-search-total')?.textContent,api:!!window.ToolHubSearch}))()`);
    check(state.trigger,'首頁缺少搜尋按鈕');check(state.dialog,'首頁缺少搜尋 Dialog');check(state.api,'搜尋控制器未載入');check(state.total===`共 ${expectedTools} 個工具`,`搜尋索引數量錯誤：${state.total}`);
    state=await evaluate(`(()=>{document.querySelector('#tool-search-trigger').click();const i=document.querySelector('#tool-search-input');i.value='JSON';i.dispatchEvent(new Event('input',{bubbles:true}));return{open:!document.querySelector('#tool-search-overlay').hidden,count:document.querySelectorAll('.tool-search-result').length,status:document.querySelector('#tool-search-status').textContent,names:[...document.querySelectorAll('.tool-search-result strong')].map(x=>x.textContent)}})()`);
    check(state.open,'點擊搜尋按鈕後面板未開啟');check(state.count>1&&state.count<=12,`JSON 搜尋結果數量異常：${state.count}`);check(state.names.some(x=>/JSON/i.test(x)),`JSON 結果未包含相關工具：${state.names.join(',')}`);
    state=await evaluate(`(()=>{const i=document.querySelector('#tool-search-input');i.value='瀏覽器與裝置測試';i.dispatchEvent(new Event('input',{bubbles:true}));return{count:document.querySelectorAll('.tool-search-result').length,status:document.querySelector('#tool-search-status').textContent}})()`);
    check(state.count===12,`分類搜尋應有 12 筆，實際 ${state.count}`);
    state=await evaluate(`(()=>{const i=document.querySelector('#tool-search-input');i.value='完全不存在的工具關鍵字';i.dispatchEvent(new Event('input',{bubbles:true}));return{count:document.querySelectorAll('.tool-search-result').length,empty:document.querySelector('.tool-search-empty')?.textContent}})()`);
    check(state.count===0&&/找不到符合的工具/.test(state.empty||''),'無結果狀態顯示異常');
    state=await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true}));return{open:!document.querySelector('#tool-search-overlay').hidden,expanded:document.querySelector('#tool-search-trigger').getAttribute('aria-expanded')}})()`);
    check(state.open&&state.expanded==='true','Ctrl+K 快捷鍵未開啟搜尋');
    await c.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(250);
    const capture=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const mobile=path.join(shotDir,'search-mobile.png');fs.writeFileSync(mobile,Buffer.from(capture.data,'base64'));
    await c.call('Page.navigate',{url:`http://127.0.0.1:${sitePort}/hex-file-viewer/`});await waitFor(`!!document.querySelector('#tool-search-trigger')&&!!window.ToolHubSearch&&!!document.querySelector('#expansion-app .exp-custom')`);
    state=await evaluate(`(()=>{document.querySelector('#tool-search-trigger')?.click();const i=document.querySelector('#tool-search-input');if(i){i.value='Hex';i.dispatchEvent(new Event('input',{bubbles:true}))}return{total:document.querySelector('#tool-search-total')?.textContent,count:document.querySelectorAll('.tool-search-result').length,first:document.querySelector('.tool-search-result strong')?.textContent,tool:!!document.querySelector('#expansion-app .exp-custom')}})()`);
    check(state.total===`共 ${expectedTools} 個工具`,`工具頁未建立 ${expectedTools} 筆搜尋索引`);check(state.count>0&&/Hex/i.test(state.first||''),`工具頁搜尋結果錯誤：${state.first}`);check(state.tool,'搜尋功能影響既有工具本體');
    await c.call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await wait(250);const desk=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const desktop=path.join(shotDir,'search-desktop.png');fs.writeFileSync(desktop,Buffer.from(desk.data,'base64'));
    await c.call('Page.navigate',{url:`http://127.0.0.1:${sitePort}/url-encoder/`});await waitFor(`!!document.querySelector('#tool-search-trigger')&&!!window.ToolHubSearch`);
    state=await evaluate(`(()=>{document.querySelector('#tool-search-trigger').click();const i=document.querySelector('#tool-search-input');i.value='Base64';i.dispatchEvent(new Event('input',{bubbles:true}));return{total:document.querySelector('#tool-search-total')?.textContent,count:document.querySelectorAll('.tool-search-result').length,first:document.querySelector('.tool-search-result strong')?.textContent,page:!!document.querySelector('h1')}})()`);
    check(state.total===`共 ${expectedTools} 個工具`&&state.count>0&&/Base64/i.test(state.first||''),'早期工具頁無法使用全站搜尋');check(state.page,'搜尋功能影響早期工具頁內容');
    console.log(`SEARCH_INDEX=${state.total}`);console.log(`SEARCH_VISUAL_MOBILE=${mobile}`);console.log(`SEARCH_VISUAL_DESKTOP=${desktop}`);c.close();
  }finally{browser.kill();await Promise.race([new Promise(resolve=>browser.once('close',resolve)),wait(1500)]);server.close();const resolved=path.resolve(profile),tempRoot=path.resolve(os.tmpdir());if(resolved.startsWith(tempRoot+path.sep))fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:150})}
  console.log(`SEARCH_FAILURES=${failures.length}`);if(failures.length){failures.forEach(x=>console.error(`- ${x}`));process.exitCode=1}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
