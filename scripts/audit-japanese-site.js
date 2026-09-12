const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),site='https://toolhuben.com';
const expectedTools=Number(process.env.TOOLHUB_TOTAL_TOOLS||600);
const read=file=>fs.readFileSync(file,'utf8');
const sidebar=read(path.join(root,'components','sidebar.html'));
const slugs=[...new Set([...sidebar.matchAll(/<a\b[^>]*>/gi)].map(match=>match[0]).filter(tag=>/\bclass=["'][^"']*\bnav-item\b/i.test(tag)).map(tag=>tag.match(/\bhref=["']\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/i)?.[1]).filter(slug=>slug&&fs.existsSync(path.join(root,slug,'index.html'))))];
const pages=['','about','quality','contact','privacy-policy','terms-of-service',...slugs],failures=[],notes=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const url=(slug,locale)=>site+(locale==='zh-Hant'?'':`/${locale}`)+(slug?`/${slug}/`:'/');
function attr(tag,name){return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`,'i'))?.[1]||''}
function tags(html,name){return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`,'gi'))].map(match=>match[0])}
function seo(html){
  const links=tags(html,'link'),metas=tags(html,'meta');
  const canonical=links.find(tag=>/\brel=["']canonical["']/i.test(tag));
  const alternates=Object.fromEntries(links.filter(tag=>/\brel=["']alternate["']/i.test(tag)&&attr(tag,'hreflang')).map(tag=>[attr(tag,'hreflang'),attr(tag,'href')]));
  const description=metas.find(tag=>/\bname=["']description["']/i.test(tag));
  return {canonical:canonical&&attr(canonical,'href'),alternates,description:description&&attr(description,'content'),title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim()||''};
}
function visible(html){return html.replace(/<!--[\s\S]*?-->/g,' ').replace(/<(script|style|code|pre|textarea|noscript)\b[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi,' ').replace(/\s+/g,' ').trim()}
const kana=/[\u3040-\u30ff]/g;
const longEnglish=/\b[A-Za-z][A-Za-z0-9+'’.-]*(?:\s+[A-Za-z][A-Za-z0-9+'’.-]*){6,}\b/g;

check(slugs.length===expectedTools,`Sidebar should contain ${expectedTools} tools, found ${slugs.length}`);
check(fs.existsSync(path.join(root,'components','header-ja.html')),'Japanese header missing');
check(fs.existsSync(path.join(root,'components','sidebar-ja.html')),'Japanese sidebar missing');
check(fs.existsSync(path.join(root,'components','footer-ja.html')),'Japanese footer missing');
check(fs.existsSync(path.join(root,'components','i18n-runtime-ja.js')),'Japanese runtime missing');
if(fs.existsSync(path.join(root,'components','sidebar-ja.html'))){
  const jaSidebar=read(path.join(root,'components','sidebar-ja.html'));
  const jaNav=[...new Set([...jaSidebar.matchAll(/<a\b[^>]*>/gi)].map(match=>match[0]).filter(tag=>/\bclass=["'][^"']*\bnav-item\b/i.test(tag)).map(tag=>tag.match(/\bhref=["']\/ja\/([^"'?#/]+)\/?(?:[?#][^"']*)?["']/i)?.[1]).filter(slug=>slug&&fs.existsSync(path.join(root,'ja',slug,'index.html'))))].length;
  check(jaNav===expectedTools,`Japanese sidebar should contain ${expectedTools} tools, found ${jaNav}`);
  check(!/href=["']\/en\//i.test(jaSidebar),'Japanese sidebar still contains /en/ internal links');
}

let lowKana=[],englishSamples=[];
const japaneseScript=/[\u3040-\u30ff\u3400-\u9fff]/g;
for(const slug of pages){
  const file=path.join(root,'ja',...(slug?[slug,'index.html']:['index.html']));
  check(fs.existsSync(file),`Missing Japanese page: /ja/${slug}`);if(!fs.existsSync(file))continue;
  const html=read(file),s=seo(html),jaUrl=url(slug,'ja'),zhUrl=url(slug,'zh-Hant'),enUrl=url(slug,'en');
  check(s.canonical===jaUrl,`Japanese canonical mismatch ${slug||'/'}: ${s.canonical}`);
  for(const [label,expected] of [['zh-Hant',zhUrl],['en',enUrl],['ja',jaUrl],['x-default',enUrl]])check(s.alternates[label]===expected,`Japanese hreflang ${label} mismatch: ${slug||'/'}`);
  check(/<html\b[^>]*\blang=["']ja["']/i.test(html),`Japanese lang mismatch: ${slug||'/'}`);
  check(/<body\b[^>]*\bdata-locale=["']ja["']/i.test(html)||['quality'].includes(slug),`Japanese data-locale missing: ${slug||'/'}`);
  check(s.title&&((s.title.match(japaneseScript)||[]).length>0),`Japanese title lacks Japanese script: ${slug||'/'} :: ${s.title}`);
  check(s.description&&((s.description.match(japaneseScript)||[]).length>0),`Japanese description lacks Japanese script: ${slug||'/'}`);
  const expectedAds=['about','quality','contact','privacy-policy','terms-of-service'].includes(slug)?0:1;
  check((html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g)||[]).length===expectedAds,`Japanese AdSense count mismatch: ${slug||'/'}`);
  check(!/<meta\b[^>]*http-equiv=["']?refresh/i.test(html),`Japanese page contains meta refresh: ${slug||'/'}`);
  check(!/�/.test(html),`Japanese page contains replacement character: ${slug||'/'}`);
  check(!/href=["']\/en\//i.test(html),`Japanese page contains English internal anchor: ${slug||'/'}`);
  if(slug&&!['about','quality','contact','privacy-policy','terms-of-service'].includes(slug)){
    const enHtml=read(path.join(root,'en',slug,'index.html'));
    if(/\/components\/i18n-runtime\.js/.test(enHtml))check(/\/components\/i18n-runtime-ja\.js/.test(html),`Japanese tool runtime missing: ${slug}`);
  }
  const body=visible(html),kanaCount=(body.match(kana)||[]).length;
  if(kanaCount<20)lowKana.push(`${slug||'/'}=${kanaCount}`);
  const runs=(body.match(longEnglish)||[]).filter(text=>!/^ToolHub\b/.test(text)).slice(0,2);
  if(runs.length)englishSamples.push(`${slug||'/'}: ${runs.join(' | ')}`);
}
check(lowKana.length===0,`Japanese visible content is too thin on ${lowKana.length} pages: ${lowKana.slice(0,12).join(', ')}`);
if(englishSamples.length)notes.push(`Long Latin runs to review (${englishSamples.length} pages): ${englishSamples.slice(0,10).join(' || ')}`);

const sitemap=read(path.join(root,'sitemap.xml')),locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
for(const slug of pages)for(const locale of ['zh-Hant','en','ja'])check(locs.includes(url(slug,locale)),`Sitemap missing ${locale}: ${slug||'/'}`);
check(locs.length===pages.length*3,`Sitemap should contain ${pages.length*3} URLs, found ${locs.length}`);
check(new Set(locs).size===locs.length,'Sitemap contains duplicate URLs');
check((sitemap.match(/<xhtml:link/g)||[]).length===locs.length*4,`Sitemap hreflang link count mismatch: ${(sitemap.match(/<xhtml:link/g)||[]).length}`);
check((sitemap.match(/hreflang="ja"/g)||[]).length===locs.length,'Sitemap Japanese hreflang count mismatch');

const language=read(path.join(root,'components','language.js')),search=read(path.join(root,'components','tool-search.js'));
check(language.includes("current==='en'?'ja'")&&language.includes("locale==='ja'"),'Language switch does not include Japanese route');
check(search.includes('isJapanese')&&search.includes('個のツール'),'Search UI does not include Japanese locale');
const allFiles=[];(function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const full=path.join(dir,entry.name);entry.isDirectory()?walk(full):allFiles.push(full)}})(root);
check(allFiles.length<=20000,`Deployment file count exceeds Wrangler direct upload limit: ${allFiles.length}`);

console.log(`TOOLS=${slugs.length}`);console.log(`JAPANESE_PAGES=${pages.length}`);console.log(`SITEMAP_URLS=${locs.length}`);console.log(`SITEMAP_HREFLANG_LINKS=${(sitemap.match(/<xhtml:link/g)||[]).length}`);console.log(`DEPLOY_FILES=${allFiles.length}`);console.log(`LOW_KANA_PAGES=${lowKana.length}`);console.log(`LONG_ENGLISH_SAMPLE_PAGES=${englishSamples.length}`);notes.forEach(note=>console.log(`NOTE: ${note}`));console.log(`FAILURES=${failures.length}`);
if(failures.length){failures.slice(0,120).forEach(item=>console.error(`- ${item}`));process.exitCode=1}
