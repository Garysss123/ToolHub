const fs=require('fs');
const path=require('path');
const batch=process.env.TOOLHUB_AUDIT_BATCH||'250';
const targetTotal=Number(process.env.TOOLHUB_AUDIT_TOTAL||batch);
const indexedToolTotal=Number(process.env.TOOLHUB_INDEXED_TOOLS||targetTotal);
const {tools,categories}=require(`./tool-expansion-${batch}-data`);
const root=path.resolve(__dirname,'..');
global.window={};
require(path.join(root,'components',`tool-expansion-${batch}.js`));
const specs=window.ToolHubExpansionExtraSpecs||{};
const extraGroups=window.ToolHubExpansionExtraGroups||{};
const experienceOverrides=window.ToolHubExperienceOverrides||{};
const validExperiences=new Set(['signal','converter','timeline','editor','formatter','extractor','validator','datagrid','codestudio','terminal','protocol','security','visual','canvas','calculator','finance','engineering','planner','filelab','device','identity','builder','compare','policy','frontend','content']);
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message)};
const count=(text,re)=>[...text.matchAll(re)].length;
const home=read('index.html');
const sidebar=read('components/sidebar.html');
const sitemap=read('sitemap.xml');
const nonTools=new Set(['about','quality','contact','privacy-policy','terms-of-service','mangalens-privacy']);
const homeSlugs=[...new Set([...home.matchAll(/href="\/([^"/]+)(?:\/index\.html)?\/?"/g)].map(match=>match[1]).filter(slug=>!nonTools.has(slug)&&fs.existsSync(path.join(root,slug,'index.html'))))];
const sidebarSlugs=[...sidebar.matchAll(/<a href="\/([^"/]+)\/" class="nav-item/g)].map(match=>match[1]);
const sitemapSlugs=[...sitemap.matchAll(/<loc>https:\/\/toolhuben\.com\/([^<]+)<\/loc>/g)].map(match=>match[1].replace(/\/$/,'')).filter(slug=>!slug.includes('/')&&!nonTools.has(slug)&&sidebarSlugs.includes(slug)&&fs.existsSync(path.join(root,slug,'index.html')));
const dataSlugs=tools.map(tool=>tool.slug),specSlugs=Object.keys(specs),groupedSlugs=Object.values(extraGroups).flat();

check(tools.length===50,`${batch} 批次資料應為 50 筆，實際 ${tools.length}`);
check(new Set(dataSlugs).size===tools.length,`${batch} 批次資料含重複 Slug`);
check(new Set(tools.map(tool=>tool.title)).size===tools.length,`${batch} 批次資料含重複標題`);
for(const tool of tools){
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug),`${tool.slug} 不符合 kebab-case`);
  check(categories[tool.category],`${tool.slug} 使用未定義分類：${tool.category}`);
  for(const key of ['title','tag','icon','description','uses','caveat'])check(String(tool[key]||'').trim(),`${tool.slug} 缺少 ${key}`);
}
check(specSlugs.length===tools.length,`${batch} 批次運算規格應為 ${tools.length} 筆，實際 ${specSlugs.length}`);
for(const slug of dataSlugs){check(specs[slug]&&Array.isArray(specs[slug].fields)&&typeof specs[slug].run==='function',`${slug} 缺少可執行運算規格`)}
for(const slug of specSlugs)check(dataSlugs.includes(slug),`${batch} 運算腳本含資料檔沒有的 Slug：${slug}`);
if(Number(batch)>=350){
  for(const slug of dataSlugs){check(specs[slug]?.localizeOutput===true,`${slug} 未啟用英文動態輸出本地化`);check(groupedSlugs.filter(item=>item===slug).length===1,`${slug} 應且只能配置一個 Workspace 群組`)}
}
if(Number(batch)>=400){
  for(const slug of dataSlugs)check(validExperiences.has(experienceOverrides[slug]),`${slug} 缺少有效的用途型介面 Override`);
  const distribution=dataSlugs.reduce((counts,slug)=>{const key=experienceOverrides[slug];counts[key]=(counts[key]||0)+1;return counts},{});
  check(Object.keys(distribution).length===26,`${batch} 批次應覆蓋 26 種用途型介面，實際 ${Object.keys(distribution).length}`);
  check(Math.max(0,...Object.values(distribution))<=2,`${batch} 批次任一用途型介面不可超過 2 頁`);
  check(new Set(tools.map(tool=>tool.palette)).size===8,`${batch} 批次應覆蓋 8 種配色`);
  check(new Set(tools.map(tool=>tool.layout)).size===8,`${batch} 批次應覆蓋 8 種 Hero Layout`);
}

check(homeSlugs.length===indexedToolTotal,`首頁工具卡應為 ${indexedToolTotal}，實際 ${homeSlugs.length}`);
check(new Set(homeSlugs).size===indexedToolTotal,`首頁工具卡有重複網址：唯一值 ${new Set(homeSlugs).size}`);
check(sidebarSlugs.length===targetTotal,`Sidebar 工具連結應為 ${targetTotal}，實際 ${sidebarSlugs.length}`);
check(new Set(sidebarSlugs).size===targetTotal,`Sidebar 工具連結有重複網址：唯一值 ${new Set(sidebarSlugs).size}`);
check(sitemapSlugs.length===indexedToolTotal,`Sitemap 工具網址應為 ${indexedToolTotal}，實際 ${sitemapSlugs.length}`);
check(new Set(sitemapSlugs).size===indexedToolTotal,`Sitemap 工具網址有重複：唯一值 ${new Set(sitemapSlugs).size}`);

for(const [category,config] of Object.entries(categories)){
  const expected=tools.filter(tool=>tool.category===category).length;
  check(expected>0,`${category} 沒有工具資料`);
  if(!config.existing){
    const visible=tools.some(tool=>tool.category===category&&homeSlugs.includes(tool.slug));
    if(visible)check(home.includes(`>${category}</h2>`),`首頁缺少新分類 ${category}`);
    check(sidebar.includes(`>${category}</span>`),`Sidebar 缺少新分類 ${category}`);
  }
}

for(const tool of tools){
  const file=`${tool.slug}/index.html`;
  check(fs.existsSync(path.join(root,file)),`${file} 不存在`);
  if(!fs.existsSync(path.join(root,file)))continue;
  const html=read(file);
  check(/<html lang="zh-TW">/.test(html),`${tool.slug} 缺少 zh-TW`);
  check(new RegExp(`<h1><span>${tool.title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</span></h1>`).test(html),`${tool.slug} H1 不符`);
  check(html.includes(`rel="canonical" href="https://toolhuben.com/${tool.slug}/"`),`${tool.slug} canonical 不符`);
  check(/<meta name="description" content="[^"]{40,}"/.test(html),`${tool.slug} Meta Description 過短或缺少`);
  check(html.includes(`data-expansion-${batch}`),`${tool.slug} 缺少 ${batch} 批次標記`);
  check(html.includes('/components/tool-page.js?v=20260821-4'),`${tool.slug} 共用頁面腳本版本不符`);
  check(html.includes(`/components/tool-expansion-${batch}.js?v=20260821-${batch}-1`),`${tool.slug} 缺少 ${batch} 運算腳本`);
  check(html.includes('/components/tool-expansion.js?v=20260823-experiences-2'),`${tool.slug} 缺少用途型介面框架`);
  check(html.includes('/components/tool-expansion.css?v=20260821-compositions-3'),`${tool.slug} 缺少共用工具基礎樣式`);
  check(html.includes('/components/tool-experience.css?v=20260823-1'),`${tool.slug} 缺少用途型介面樣式`);
  const noindex=/<meta\b(?=[^>]*name="robots")[^>]*content="[^"]*noindex/i.test(html);
  check(count(html,/pagead2\.googlesyndication\.com/g)===(noindex?0:1),`${tool.slug} AdSense 與索引狀態不一致`);
  check(count(html,/<details>/g)>=5,`${tool.slug} FAQ 少於 5 題`);
  check(html.includes('<article class="seo">')&&count(html,/<h3>/g)>=4,`${tool.slug} SEO 文章不完整`);
  check(homeSlugs.includes(tool.slug)===!noindex,`${tool.slug} 首頁卡與索引狀態不一致`);
  check(sidebarSlugs.includes(tool.slug),`Sidebar 缺少 ${tool.slug}`);
  check(sitemapSlugs.includes(tool.slug)===!noindex,`${tool.slug} Sitemap 與索引狀態不一致`);
}

if(failures.length){console.error(`AUDIT_FAILED=${failures.length}`);failures.forEach(item=>console.error(`- ${item}`));process.exit(1)}
console.log('AUDIT_OK');
console.log(`HOME_TOOLS=${homeSlugs.length}`);
console.log(`SIDEBAR_TOOLS=${sidebarSlugs.length}`);
console.log(`SITEMAP_TOOLS=${sitemapSlugs.length}`);
console.log(`NEW_TOOLS=${tools.length}`);
console.log(`NEW_CATEGORIES=${Object.values(categories).filter(config=>!config.existing).length}`);
