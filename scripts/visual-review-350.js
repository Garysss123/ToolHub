const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),{spawn}=require('child_process');
const batch=process.env.TOOLHUB_VISUAL_BATCH||'350';
const {tools}=require(`./tool-expansion-${batch}-data`);
const root=path.resolve(__dirname,'..'),chrome=process.env.TOOLHUB_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const locale=process.env.TOOLHUB_VISUAL_LOCALE==='en'?'en':'zh',prefix=locale==='en'?'/en':'';
const port=Number(process.env.TOOLHUB_VISUAL_PORT||6000+Number(batch)+(locale==='en'?1:0)),debugPort=Number(process.env.TOOLHUB_VISUAL_DEBUG_PORT||12000+Number(batch)+(locale==='en'?1:0));
const selected=[...tools.slice(0,8),...tools.slice(42,50)];
const outputDir=path.join(os.tmpdir(),`toolhub-${batch}-review-${locale}`),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,`http://localhost:${port}`).pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root)){response.writeHead(403).end();return}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){response.writeHead(404).end('Not found');return}response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response)});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function endpoint(){for(let i=0;i<100;i++){try{const pages=await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r=>r.json()),page=pages.find(x=>x.type==='page');if(page)return page.webSocketDebuggerUrl}catch(_){}await wait(100)}throw new Error('無法連線至 Chrome DevTools')}
function client(url){const ws=new WebSocket(url),pending=new Map();let id=0;ws.onmessage=event=>{const data=JSON.parse(event.data);if(!data.id)return;const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(new Error(data.error.message)):job.resolve(data.result)};const ready=new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});return{ready,call:async(method,params={})=>{await ready;return new Promise((resolve,reject)=>{const callId=++id;pending.set(callId,{resolve,reject});ws.send(JSON.stringify({id:callId,method,params}))})},close:()=>ws.close()}}
async function main(){
  fs.mkdirSync(outputDir,{recursive:true});await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),`toolhub-${batch}-review-profile-${locale}-`)),browser=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true}),failures=[];
  try{
    const c=client(await endpoint());await c.ready;await c.call('Runtime.enable');await c.call('Page.enable');
    const evaluate=async expression=>{const response=await c.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw new Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value};
    const waitFor=async expression=>{for(let i=0;i<120;i++){if(await evaluate(expression))return;await wait(100)}throw new Error(`等待頁面條件逾時：${expression}`)};
    for(let index=0;index<selected.length;index++){
      const tool=selected[index],mobile=index%2===1,width=mobile?390:1280,height=mobile?844:900;
      await c.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
      await c.call('Page.navigate',{url:`http://127.0.0.1:${port}${prefix}/${tool.slug}/`});
      await waitFor(`!!document.querySelector('#expansion-app .exp-custom')&&!!document.querySelector('#component-header header')`);await evaluate(`window.ToolHubLanguage?.closePrompt();localStorage.setItem('toolhub-language','${locale==='en'?'en':'zh-Hant'}');sessionStorage.setItem('toolhub-language-prompt-dismissed','1')`);await wait(180);
      const state=await evaluate(`(()=>{const host=document.querySelector('#expansion-app'),hero=document.querySelector('.hero'),header=document.querySelector('#component-header header'),search=document.querySelector('#tool-search-trigger'),theme=document.querySelector('#theme-trigger-btn'),bodyText=document.body.innerText,rect=x=>{if(!x)return null;const r=x.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};return{layout:document.body.dataset.layout,overflow:document.documentElement.scrollWidth-innerWidth,host:rect(host),hero:rect(hero),header:rect(header),search:rect(search),theme:rect(theme),overlay:!!document.getElementById('language-welcome'),error:document.querySelector('#exp-status.error')?.textContent||'',cjk:${locale==='en'?`(bodyText.match(/[\\u3400-\\u9fff\\uf900-\\ufaff]/g)||[]).length`:'0'},cjkText:${locale==='en'?`bodyText.split(/\\n/).filter(line=>/[\\u3400-\\u9fff\\uf900-\\ufaff]/.test(line)).slice(0,8).join(' | ')`:`''`}}})()`);
      const inside=(child,parent)=>child&&parent&&child.top>=parent.top-2&&child.bottom<=parent.bottom+2;
      if(state.layout!==tool.layout)failures.push(`${tool.slug}: Layout 應為 ${tool.layout}，實際 ${state.layout}`);
      if(state.overflow>1)failures.push(`${tool.slug}: 水平溢出 ${state.overflow}px`);
      if(!state.host||state.host.width<300||!state.hero||state.hero.width<300)failures.push(`${tool.slug}: Hero 或工具區尺寸異常`);
      if(!inside(state.search,state.header)||!inside(state.theme,state.header))failures.push(`${tool.slug}: Header 按鈕超出上下範圍`);
      if(state.overlay)failures.push(`${tool.slug}: 語言建議視窗未關閉`);
      if(state.error)failures.push(`${tool.slug}: 預設功能錯誤 ${state.error}`);
      if(state.cjk)failures.push(`${tool.slug}: 英文可見文字仍有 ${state.cjk} 個中文字元（${state.cjkText}）`);
      const shot=await c.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const file=path.join(outputDir,`${String(index+1).padStart(2,'0')}-${tool.layout}-${tool.slug}-${width}.png`);fs.writeFileSync(file,Buffer.from(shot.data,'base64'));
      console.log(`VISUAL_PASS ${tool.slug} ${tool.layout} ${width}px`);
    }
    c.close();
  }finally{browser.kill();await Promise.race([new Promise(resolve=>browser.once('close',resolve)),wait(1500)]);server.close();const resolved=path.resolve(profile),temp=path.resolve(os.tmpdir());if(resolved.startsWith(temp+path.sep))fs.rmSync(resolved,{recursive:true,force:true,maxRetries:5,retryDelay:100})}
  console.log(`VISUAL_REVIEW_BATCH=${batch}`);console.log(`VISUAL_REVIEW_LOCALE=${locale}`);console.log(`VISUAL_REVIEW_PAGES=${selected.length}`);console.log(`VISUAL_REVIEW_DIR=${outputDir}`);console.log(`VISUAL_REVIEW_FAILURES=${failures.length}`);if(failures.length){failures.forEach(x=>console.error(`- ${x}`));process.exitCode=1}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
