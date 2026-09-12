const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),base=(process.env.TOOLHUB_PRODUCTION_ORIGIN||'https://toolhuben.com').replace(/\/$/,'');
const expectedTools=Number(process.env.TOOLHUB_TOTAL_TOOLS||600),concurrency=Number(process.env.TOOLHUB_VERIFY_CONCURRENCY||20);
const sidebar=fs.readFileSync(path.join(root,'components','sidebar.html'),'utf8');
const slugs=[...new Set([...sidebar.matchAll(/<a\b[^>]*>/gi)].map(match=>match[0]).filter(tag=>/\bclass=["'][^"']*\bnav-item\b/i.test(tag)).map(tag=>tag.match(/\bhref=["']\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/i)?.[1]).filter(slug=>slug&&fs.existsSync(path.join(root,slug,'index.html'))))];
const routes=['','about','quality','contact','privacy-policy','terms-of-service',...slugs].map(slug=>slug?`/ja/${slug}/`:'/ja/'),failures=[];
if(slugs.length!==expectedTools)throw new Error(`Expected ${expectedTools} tools, found ${slugs.length}`);
function checkPage(route,html){
  const expected=base+route;
  if(!/<html\b[^>]*\blang=["']ja["']/i.test(html))failures.push(`${route}: lang is not ja`);
  const head=(html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||html)
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi,' ');
  const canonicals=[...head.matchAll(/<link\b[^>]*>/gi)]
    .map(match=>match[0])
    .filter(tag=>/\brel=["']canonical["']/i.test(tag))
    .map(tag=>tag.match(/\bhref=["']([^"']+)["']/i)?.[1])
    .filter(Boolean);
  if(!canonicals.includes(expected))failures.push(`${route}: canonical=${canonicals.join(',')||'missing'}`);
  if(/href=["']\/en\//i.test(html))failures.push(`${route}: contains /en/ internal anchor`);
  if(/�/.test(html))failures.push(`${route}: replacement character found`);
}
async function worker(queue){
  while(queue.length){
    const route=queue.shift();
    try{
      const response=await fetch(base+route,{redirect:'manual',headers:{'user-agent':'ToolHub-Production-Japanese-Verifier/1.0'}});
      if(response.status!==200){failures.push(`${route}: HTTP ${response.status}`);continue}
      checkPage(route,await response.text());
    }catch(error){failures.push(`${route}: ${error.message}`)}
  }
}
async function main(){
  const queue=[...routes];await Promise.all(Array.from({length:Math.min(concurrency,queue.length)},()=>worker(queue)));
  try{
    const response=await fetch(`${base}/sitemap.xml`,{headers:{'user-agent':'ToolHub-Production-Japanese-Verifier/1.0'}}),xml=await response.text();
    if(response.status!==200)failures.push(`/sitemap.xml: HTTP ${response.status}`);
    const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
    for(const route of routes)if(!locs.includes(base+route))failures.push(`/sitemap.xml: missing ${base+route}`);
    if((xml.match(/hreflang="ja"/g)||[]).length!==routes.length*3)failures.push(`/sitemap.xml: unexpected ja hreflang count ${(xml.match(/hreflang="ja"/g)||[]).length}`);
  }catch(error){failures.push(`/sitemap.xml: ${error.message}`)}
  console.log(`PRODUCTION_JAPANESE_PAGES=${routes.length}`);console.log(`PRODUCTION_JAPANESE_FAILURES=${failures.length}`);
  if(failures.length){failures.slice(0,120).forEach(item=>console.error(`- ${item}`));process.exitCode=1}
}
main().catch(error=>{console.error(error);process.exitCode=1});
