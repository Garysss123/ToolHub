const fs=require('fs'),path=require('path');
const {tools}=require('./tool-expansion-200-data');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[];
const home=read('index.html'),sidebar=read('components/sidebar.html'),sitemap=read('sitemap.xml');
const pageSlugs=[...new Set([...home.matchAll(/href="\/([^"/]+)(?:\/index\.html)?"/g)].map(match=>match[1]).filter(slug=>fs.existsSync(path.join(root,slug,'index.html'))))];
const sidebarSlugs=[...sidebar.matchAll(/href="\/([^"/]+)"/g)].map(match=>match[1]).filter(slug=>fs.existsSync(path.join(root,slug,'index.html')));
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
const sitemapToolSlugs=sitemapUrls.map(url=>new URL(url).pathname.replace(/^\/+|\/+$/g,'')).filter(slug=>pageSlugs.includes(slug));
const duplicates=list=>[...new Set(list.filter((item,index)=>list.indexOf(item)!==index))];
if(pageSlugs.length!==200)errors.push(`首頁工具數應為 200，目前為 ${pageSlugs.length}`);
if(sidebarSlugs.length!==200)errors.push(`Sidebar 工具連結應為 200，目前為 ${sidebarSlugs.length}`);
if(new Set(sidebarSlugs).size!==200)errors.push(`Sidebar 有重複：${duplicates(sidebarSlugs).join(', ')}`);
if(sitemapToolSlugs.length!==200)errors.push(`Sitemap 工具網址應為 200，目前為 ${sitemapToolSlugs.length}`);
const sitemapSet=new Set(sitemapToolSlugs);
const missingSitemap=pageSlugs.filter(slug=>!sitemapSet.has(slug));
if(missingSitemap.length)errors.push(`Sitemap 遺漏工具：${missingSitemap.join(', ')}`);
if(duplicates(sitemapUrls).length)errors.push(`Sitemap 有重複網址：${duplicates(sitemapUrls).join(', ')}`);
for(const tool of tools){
  const file=path.join(tool.slug,'index.html');if(!fs.existsSync(path.join(root,file))){errors.push(`${tool.slug} 缺少頁面`);continue}
  const html=read(file);
  const checks=[['繁體中文語系',html.includes('<html lang="zh-TW">')],['Meta Description',/<meta name="description" content="[^"]+">/.test(html)],['Canonical',html.includes(`https://toolhuben.com/${tool.slug}`)],['FAQ',html.includes('<h2>常見問題</h2>')],['SEO Article',html.includes(`${tool.title}是什麼？`)],['AdSense',(html.match(/pagead2\.googlesyndication\.com/g)||[]).length===1],['共用視覺',html.includes('/components/tool-visual-core.css')],['版本化頁面模組',html.includes('/components/tool-page.js?v=20260820-2')],['版本化新功能模組',html.includes('/components/tool-expansion-200.js?v=20260820-2')],['版本化共用工具模組',html.includes('/components/tool-expansion.js?v=20260821-compositions-2')],['版本化獨立構圖樣式',html.includes('/components/tool-expansion.css?v=20260821-compositions-2')]];
  checks.filter(([,ok])=>!ok).forEach(([label])=>errors.push(`${tool.slug} 缺少${label}`));
  if(!home.includes(`/${tool.slug}/index.html`))errors.push(`${tool.slug} 未加入首頁`);
  if(!sidebar.includes(`href="/${tool.slug}"`))errors.push(`${tool.slug} 未加入 Sidebar`);
  if(!sitemap.includes(`https://toolhuben.com/${tool.slug}</loc>`))errors.push(`${tool.slug} 未加入 Sitemap`);
}
const categorySummary=Object.fromEntries(['資料分析與統計','商務與生活計算'].map(category=>[category,tools.filter(tool=>tool.category===category).length]));
console.log(JSON.stringify({homeTools:pageSlugs.length,sidebarLinks:sidebarSlugs.length,sidebarUnique:new Set(sidebarSlugs).size,sitemapTools:sitemapToolSlugs.length,sitemapUrls:sitemapUrls.length,newTools:tools.length,newCategories:categorySummary,errors},null,2));
if(errors.length)process.exitCode=1;
