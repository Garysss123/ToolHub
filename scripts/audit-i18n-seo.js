const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),site='https://toolhuben.com',cjk=/[\u3400-\u9fff\uf900-\ufaff]/;
const expectedTools=Number(process.env.TOOLHUB_TOTAL_TOOLS||600);
const read=file=>fs.readFileSync(file,'utf8');
const sidebar=read(path.join(root,'components','sidebar.html'));
const slugs=[...new Set([...sidebar.matchAll(/<a\b[^>]*>/gi)].map(match=>match[0]).filter(tag=>/\bclass=["'][^"']*\bnav-item\b/i.test(tag)).map(tag=>tag.match(/\bhref=["']\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/i)?.[1]).filter(slug=>slug&&fs.existsSync(path.join(root,slug,'index.html'))))];
const pages=['','about','contact','privacy-policy','terms-of-service',...slugs],localized=new Set(pages),failures=[],notes=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const url=(slug,en=false)=>site+(en?'/en':'')+(slug?`/${slug}/`:'/');
function attr(tag,name){return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`,'i'))?.[1]||''}
function tags(html,name){return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`,'gi'))].map(m=>m[0])}
function seo(html){
  const links=tags(html,'link'),metas=tags(html,'meta');
  const canonical=links.find(tag=>/\brel=["']canonical["']/i.test(tag));
  const alternates=Object.fromEntries(links.filter(tag=>/\brel=["']alternate["']/i.test(tag)&&attr(tag,'hreflang')).map(tag=>[attr(tag,'hreflang'),attr(tag,'href')]));
  const description=metas.find(tag=>/\bname=["']description["']/i.test(tag));
  return {canonical:canonical&&attr(canonical,'href'),alternates,description:description&&attr(description,'content'),title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim()||''};
}
function visibleEnglish(html){
  return html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|code|pre|textarea|noscript)\b[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi,' ');
}
check(slugs.length===expectedTools,`Sidebar 應有 ${expectedTools} 個工具，實際 ${slugs.length}`);
let residual=[],residualSamples=[];
for(const slug of pages){
  const zhFile=path.join(root,...(slug?[slug,'index.html']:['index.html']));
  const enFile=path.join(root,'en',...(slug?[slug,'index.html']:['index.html']));
  check(fs.existsSync(enFile),`缺少英文頁：/en/${slug}`);if(!fs.existsSync(enFile))continue;
  const zh=read(zhFile),en=read(enFile),z=seo(zh),e=seo(en),zhUrl=url(slug),enUrl=url(slug,true);
  check(z.canonical===zhUrl,`中文 canonical 錯誤 ${slug||'/'}：${z.canonical}`);
  check(e.canonical===enUrl,`英文 canonical 錯誤 ${slug||'/'}：${e.canonical}`);
  for(const [label,expected] of [['zh-Hant',zhUrl],['en',enUrl],['x-default',enUrl]]){
    check(z.alternates[label]===expected,`中文 hreflang ${label} 錯誤：${slug||'/'}`);
    check(e.alternates[label]===expected,`英文 hreflang ${label} 錯誤：${slug||'/'}`);
  }
  check(/<html\b[^>]*\blang=["']en["']/i.test(en),`英文 lang 錯誤：${slug||'/'}`);
  check(e.title&&!cjk.test(e.title),`英文 title 仍含中文：${slug||'/'}`);
  check(e.description&&!cjk.test(e.description),`英文 description 仍含中文：${slug||'/'}`);
  check((en.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g)||[]).length===1,`英文 AdSense 載入次數不是 1：${slug||'/'}`);
  const visible=visibleEnglish(en);
  if(cjk.test(visible)){
    residual.push(slug||'/');
    residualSamples.push(`${slug||'/'}: ${(visible.match(/.{0,45}[\u3400-\u9fff].{0,80}/)||[''])[0].replace(/\s+/g,' ').trim()}`);
  }
  check(!/<meta\b[^>]*http-equiv=["']?refresh/i.test(en),`英文頁含 Meta Refresh：${slug||'/'}`);
}

const sitemap=read(path.join(root,'sitemap.xml')),locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
for(const slug of pages){check(locs.includes(url(slug)),`Sitemap 缺中文 URL：${slug||'/'}`);check(locs.includes(url(slug,true)),`Sitemap 缺英文 URL：${slug||'/'}`)}
check(locs.every(item=>item.endsWith('/')),`Sitemap 仍含非尾斜線 URL：${locs.filter(item=>!item.endsWith('/')).slice(0,5).join(', ')}`);
check(new Set(locs).size===locs.length,'Sitemap 含重複 URL');

const scanFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name==='en'||entry.name==='node_modules'||entry.name.startsWith('.'))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(entry.name.endsWith('.html')||entry.name.endsWith('.js'))scanFiles.push(full)}}walk(root);
const routePattern=slugs.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|');
const bareLink=new RegExp(`href=["']\\/(?:${routePattern})(?:[?#][^"']*)?["']`,'i');
const indexLink=new RegExp(`href=["']\\/(?:${routePattern})\\/index\\.html(?:[?#][^"']*)?["']`,'i');
for(const file of scanFiles){const body=read(file);check(!bareLink.test(body),`站內連結未使用尾斜線：${path.relative(root,file)}`);check(!indexLink.test(body),`站內連結仍使用 index.html：${path.relative(root,file)}`);check(!/<meta\b[^>]*http-equiv=["']?refresh/i.test(body),`頁面含 Meta Refresh：${path.relative(root,file)}`)}
const language=read(path.join(root,'components','language.js'));
check(!/preferred\s*&&[\s\S]{0,120}location\.replace/.test(language),'語言偏好仍會自動重新導向');
const allFiles=[];(function all(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const full=path.join(dir,entry.name);entry.isDirectory()?all(full):allFiles.push(full)}})(root);
const wranglerFileLimit=20000;
check(allFiles.length<=wranglerFileLimit,`部署檔案超過 Cloudflare Wrangler 直接上傳限制：${allFiles.length}`);
if(residual.length)notes.push(`英文靜態可見內容仍含中文 ${residual.length} 頁：${residualSamples.slice(0,8).join(' | ')}`);
console.log(`TOOLS=${slugs.length}`);console.log(`ENGLISH_PAGES=${pages.length}`);console.log(`SITEMAP_URLS=${locs.length}`);console.log(`DEPLOY_FILES=${allFiles.length}`);console.log(`DEPLOY_FILE_HEADROOM=${wranglerFileLimit-allFiles.length}`);console.log(`VISIBLE_CJK_PAGES=${residual.length}`);
notes.forEach(note=>console.log(`NOTE: ${note}`));console.log(`FAILURES=${failures.length}`);
if(failures.length){failures.slice(0,100).forEach(item=>console.error(`- ${item}`));process.exitCode=1}
