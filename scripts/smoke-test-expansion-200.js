const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),{spawn}=require('child_process');
const {tools}=require('./tool-expansion-200-data');
const root=path.resolve(__dirname,'..'),chrome=process.env.TOOLHUB_CHROME||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',port=4181;
const iconBySlug=Object.fromEntries(tools.map(tool=>[tool.slug,tool.icon]));
const requested=process.env.TOOLHUB_SMOKE_SLUGS?process.env.TOOLHUB_SMOKE_SLUGS.split(',').map(value=>value.trim()).filter(Boolean):tools.map(tool=>tool.slug);
const slugs=process.env.TOOLHUB_SMOKE_LIMIT?requested.slice(0,Number(process.env.TOOLHUB_SMOKE_LIMIT)):requested;
const visualDir=process.env.TOOLHUB_VISUAL_DIR?path.resolve(process.env.TOOLHUB_VISUAL_DIR):'';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,`http://localhost:${port}`).pathname);let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root)){response.writeHead(403).end();return}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){response.writeHead(404).end('Not found');return}
  response.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(response);
});
function dump(url,profile,size,screenshot){return new Promise((resolve,reject)=>{
  const args=['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking',`--user-data-dir=${profile}`,`--window-size=${size}`,'--virtual-time-budget=2400'];
  if(screenshot)args.push(`--screenshot=${screenshot}`);args.push('--dump-dom',url);
  const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe'],windowsHide:true});let stdout='',stderr='';
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);
  const timer=setTimeout(()=>{child.kill();reject(new Error('Chrome 檢查逾時'))},15000);
  child.on('error',reject);child.on('close',code=>{clearTimeout(timer);code===0?resolve(stdout):reject(new Error(`Chrome ${code}: ${stderr.slice(-300)}`))});
})}
async function main(){
  if(!fs.existsSync(chrome))throw new Error(`找不到 Chrome：${chrome}`);if(visualDir)fs.mkdirSync(visualDir,{recursive:true});
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));const profile=fs.mkdtempSync(path.join(os.tmpdir(),'toolhub-200-smoke-')),failures=[];
  try{
    for(let index=0;index<slugs.length;index++){
      const slug=slugs[index],size=index%2?'390,844':'1280,900',screenshot=visualDir?path.join(visualDir,`${String(index+1).padStart(2,'0')}-${slug}-${size.split(',')[0]}.png`):'';
      try{
        const dom=await dump(`http://127.0.0.1:${port}/${slug}/`,profile,size,screenshot),reasons=[];
        if(!dom.includes('data-expansion-200'))reasons.push('未接入 200 工具層');
        if(!dom.includes('data-experience=')||!dom.includes('data-structure='))reasons.push('未配置用途型介面與結構');
        if(!dom.includes('exp-experience'))reasons.push('用途型介面未建立');
        if(!dom.includes('id="exp-output"'))reasons.push('結果區未建立');
        if(/id="exp-status" class="[^"]*error/.test(dom))reasons.push('預設執行發生錯誤');
        if(!dom.includes('id="theme-trigger-btn"'))reasons.push('主題按鈕未載入');
        if(!dom.includes('id="component-footer"')||!dom.includes('hub-monetization-slot'))reasons.push('Footer 或廣告版位未載入');
        if(!dom.includes('id="sidebar-container"'))reasons.push('Sidebar 未載入');
        const sidebarIcon=new RegExp(`<a href="/${slug}/"[^>]*>[\\s\\S]{0,900}<svg[^>]+data-lucide="${iconBySlug[slug]}"`);
        if(!sidebarIcon.test(dom))reasons.push('Sidebar 專屬圖示未載入');
        if(!/<h1[\s>]/.test(dom)||!dom.includes('常見問題'))reasons.push('Hero 或 FAQ 缺失');
        if(reasons.length)failures.push(`${slug}: ${reasons.join('；')}`);else console.log(`PASS ${slug} ${size.split(',')[0]}px`);
      }catch(error){failures.push(`${slug}: ${error.message}`)}
    }
  }finally{
    server.close();const resolved=path.resolve(profile),tempRoot=path.resolve(os.tmpdir());if(resolved.startsWith(tempRoot+path.sep))fs.rmSync(resolved,{recursive:true,force:true});
  }
  console.log(`EXPANSION_200_PAGES=${slugs.length}`);console.log(`EXPANSION_200_FAILURES=${failures.length}`);if(visualDir)console.log(`EXPANSION_200_VISUAL_DIR=${visualDir}`);
  if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1});
