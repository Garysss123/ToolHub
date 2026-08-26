const fs=require('fs'),path=require('path');
const {tools,categories}=require('./tool-expansion-200-data');
const root=path.resolve(__dirname,'..'),marker='TOOL EXPANSION 200';

const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const faqs=tool=>[
  [`${tool.title}會把資料上傳到伺服器嗎？`,'不會。工具功能直接在目前瀏覽器分頁內執行，輸入與產生結果不會由 ToolHub 上傳或保存。'],
  [`${tool.title}適合哪些使用情境？`,tool.uses],
  [`使用${tool.title}前需要安裝軟體嗎？`,'不需要。使用支援現代 JavaScript 的桌面或行動瀏覽器即可操作，也不需要建立帳號。'],
  [`這個工具有哪些限制？`,tool.caveat],
  ['產生結果後還需要人工檢查嗎？','需要。工具可協助完成計算、轉換或格式整理，但正式上線、匯入資料或做出商務決策前，仍應依實際規格複核結果。']
];
function jsonLd(tool){
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'WebApplication',name:tool.title,url:`https://toolhuben.com/${tool.slug}`,description:tool.description,applicationCategory:'UtilitiesApplication',operatingSystem:'All',browserRequirements:'Requires JavaScript',inLanguage:'zh-TW',offers:{'@type':'Offer',price:'0',priceCurrency:'TWD'},publisher:{'@type':'Organization',name:'ToolHub'}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:'https://toolhuben.com/'},{'@type':'ListItem',position:2,name:tool.category,item:'https://toolhuben.com/'},{'@type':'ListItem',position:3,name:tool.title,item:`https://toolhuben.com/${tool.slug}`}]},
    {'@type':'FAQPage',mainEntity:faqs(tool).map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}
  ]},null,2);
}
function page(tool){
  const faq=faqs(tool);
  return `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(tool.title)}｜免費瀏覽器工具 - ToolHub</title>
  <meta name="description" content="${escapeHtml(tool.description)}免費、免登入，所有資料只在瀏覽器本機處理。">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://toolhuben.com/${tool.slug}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="ToolHub">
  <meta property="og:title" content="${escapeHtml(tool.title)}｜ToolHub">
  <meta property="og:description" content="${escapeHtml(tool.description)}">
  <meta property="og:url" content="https://toolhuben.com/${tool.slug}">
  <meta property="og:image" content="https://toolhuben.com/favicon.svg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(tool.title)}｜ToolHub">
  <meta name="twitter:description" content="${escapeHtml(tool.description)}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1732059148394592" crossorigin="anonymous"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/components/tool-page.css">
  <link rel="stylesheet" href="/components/tool-visual-core.css">
  <link rel="stylesheet" href="/components/tool-expansion.css?v=20260821-compositions-3">
  <link rel="stylesheet" href="/components/tool-experience.css?v=20260823-1">
  <script type="application/ld+json">${jsonLd(tool)}</script>
</head>
<body class="font-sans" data-tool="${tool.slug}" data-tool-visual data-expansion-tool data-expansion-200 data-palette="${tool.palette}" data-layout="${tool.layout}" style="--tool-visual-accent:var(--tool-accent);--tool-visual-accent-rgb:var(--tool-accent-rgb)">
  <div id="component-header"></div>
  <div id="component-sidebar"></div>
  <main class="tool-wrap">
    <nav class="crumb" aria-label="麵包屑"><a href="/">首頁</a><span>/</span><span>${escapeHtml(tool.category)}</span><span>/</span><span>${escapeHtml(tool.title)}</span></nav>
    <header class="hero expansion-hero">
      <div class="exp-hero-visual" aria-hidden="true"><div class="exp-hero-icon"><i data-lucide="${tool.icon}"></i></div><span class="exp-orbit exp-orbit-one"></span><span class="exp-orbit exp-orbit-two"></span></div>
      <div class="exp-hero-copy"><span class="badge">${escapeHtml(tool.tag)} ・ 免費本機工具</span><h1><span>${escapeHtml(tool.title)}</span></h1><p>${escapeHtml(tool.description)}</p><div class="exp-hero-points"><span><i data-lucide="shield-check"></i>資料不上傳</span><span><i data-lucide="smartphone"></i>支援手機操作</span><span><i data-lucide="palette"></i>支援主題切換</span></div></div>
    </header>
    <div id="expansion-app" class="tool-grid" aria-label="${escapeHtml(tool.title)}操作區"></div>
    <article class="seo">
      <section class="panel">
        <h2>${escapeHtml(tool.title)}是什麼？</h2>
        <p>${escapeHtml(tool.description)}ToolHub 將核心運算完整放在瀏覽器內，讓桌面與行動裝置都能立即使用，不必註冊帳號，也不必將內容傳送到後端。</p>
        <h3>如何使用這個工具？</h3>
        <ol><li>依欄位提示輸入資料並選擇需要的處理方式。</li><li>按下「立即處理」，查看結果、指標摘要與必要的錯誤提示。</li><li>確認內容符合實際需求後，可複製結果或下載成檔案繼續使用。</li></ol>
        <h3>適合的使用情境</h3>
        <p>${escapeHtml(tool.uses)}。所有處理都在目前分頁完成，特別適合不希望將內部資料貼到遠端服務的工作流程。</p>
        <h3>結果判讀與注意事項</h3>
        <p>${escapeHtml(tool.caveat)}工具會驗證基本輸入格式並提供可讀的錯誤訊息，但正式環境仍應依來源規格、業務規則或專業要求再次確認。</p>
        <h3>瀏覽器與裝置支援</h3>
        <p>建議使用最新版本的 Chrome、Edge、Firefox 或 Safari。頁面支援深色、亮色及其他網站主題，並針對手機、平板與桌面寬度調整欄位和結果版面。</p>
      </section>
      <section class="panel faq"><h2>常見問題</h2>${faq.map(([question,answer])=>`<details><summary>${escapeHtml(question)}</summary><div class="answer">${escapeHtml(answer)}</div></details>`).join('')}</section>
    </article>
  </main>
  <div id="component-footer"></div>
  <script src="/components/tool-page.js?v=20260821-4"></script>
  <script src="/components/tool-expansion-200.js?v=20260820-2"></script>
  <script src="/components/tool-expansion.js?v=20260823-experiences-2"></script>
</body>
</html>
`;
}

function removeBlocks(text){return text.replace(new RegExp(`(?:[ \\t]*\\r?\\n)*[ \\t]*<!-- ${marker} START [^>]+ -->[\\s\\S]*?<!-- ${marker} END [^>]+ -->[ \\t]*(?:\\r?\\n[ \\t]*)*`,'g'),'\n')}
function card(tool){
  const config=categories[tool.category];
  return `                        <a href="/${tool.slug}/index.html" class="flex flex-col flex-none w-[42vw] sm:w-[22rem] snap-start group"><div class="flex-grow bg-hub-800 border border-hub-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover relative overflow-hidden flex flex-col"><div class="absolute -top-10 -right-10 w-32 h-32 bg-${config.color}-500/10 rounded-full blur-2xl group-hover:bg-${config.color}-500/20 transition-all"></div><div class="flex items-center justify-between mb-3 sm:mb-4"><div class="w-10 h-10 sm:w-12 sm:h-12 bg-hub-900 rounded-lg flex items-center justify-center border border-hub-700 group-hover:border-${config.color}-400 transition-colors"><i data-lucide="${tool.icon}" class="w-5 h-5 sm:w-6 sm:h-6 text-${config.color}-400"></i></div><span class="text-[10px] sm:text-xs font-medium bg-${config.color}-500/10 text-${config.color}-400 px-2 py-1 rounded-full border border-${config.color}-500/20">${escapeHtml(tool.tag)}</span></div><h3 class="text-[15px] sm:text-xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-${config.color}-400 transition-colors line-clamp-1">${escapeHtml(tool.title)}</h3><p class="text-slate-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-grow line-clamp-2 sm:line-clamp-none">${escapeHtml(tool.description)}</p><div class="flex items-center text-xs sm:text-sm font-medium text-${config.color}-400 mt-auto pt-3 sm:pt-4 border-t border-hub-700/50"><span>開啟工具</span><i data-lucide="arrow-right" class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"></i></div></div></a>`;
}
function homeSection(category,config,group){
  return `            <!-- ${marker} START Home-${category} -->
            <section>
                <div class="flex items-center mb-4 sm:mb-6">
                    <i data-lucide="${config.icon}" class="w-6 h-6 sm:w-7 sm:h-7 text-${config.color}-400 mr-3"></i>
                    <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide">${category}</h2>
                    <div class="h-px flex-grow ml-4 sm:ml-6 section-divider" style="background:linear-gradient(90deg,rgba(99,102,241,.5),transparent)"></div>
                </div>
                <div class="relative group/slider -mx-4 sm:mx-0 px-4 sm:px-0">
                    <button onclick="scrollContainer('${config.slider}', -1)" class="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-hub-800/90 backdrop-blur border border-hub-700 rounded-full text-white items-center justify-center shadow-xl opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-hub-700 hover:text-hub-accent hidden md:flex focus:outline-none"><i data-lucide="chevron-left" class="w-6 h-6"></i></button>
                    <div id="${config.slider}" class="flex overflow-x-auto gap-3 sm:gap-6 pb-8 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch">
${group.map(card).join('\n')}
                    </div>
                    <button onclick="scrollContainer('${config.slider}', 1)" class="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-hub-800/90 backdrop-blur border border-hub-700 rounded-full text-white items-center justify-center shadow-xl opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-hub-700 hover:text-hub-accent hidden md:flex focus:outline-none"><i data-lucide="chevron-right" class="w-6 h-6"></i></button>
                </div>
            </section>
            <!-- ${marker} END Home-${category} -->

`;
}
function sidebarLink(tool){return `          <a href="/${tool.slug}" class="nav-item flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent transition-all rounded-r-md"><i data-lucide="${tool.icon}" class="w-5 h-5 shrink-0" aria-hidden="true"></i><span class="font-medium text-[15px]">${escapeHtml(tool.title)}</span></a>`}
function sidebarGroup(category,group){return `    <!-- ${marker} START Sidebar-${category} -->
    <div class="nav-group mb-2">
      <button class="w-full flex items-center justify-between px-6 py-2 text-slate-500 hover:text-slate-300 transition-colors group toggle-btn"><span class="text-xs font-semibold uppercase tracking-wider">${category}</span><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-300 chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
      <div class="group-content overflow-hidden transition-all duration-300 max-h-0"><div class="px-2 py-1 space-y-0.5">
${group.map(sidebarLink).join('\n')}
      </div></div>
    </div>
    <!-- ${marker} END Sidebar-${category} -->

`}

if(tools.length!==50)throw new Error(`工具資料應為 50 筆，目前為 ${tools.length}`);
const duplicateSlugs=tools.filter((tool,index)=>tools.findIndex(candidate=>candidate.slug===tool.slug)!==index);
if(duplicateSlugs.length)throw new Error(`新增工具 Slug 重複：${duplicateSlugs.map(tool=>tool.slug).join(', ')}`);

let home=removeBlocks(fs.readFileSync(path.join(root,'index.html'),'utf8'));
const existing=new Set([...home.matchAll(/href="\/([^"/]+)(?:\/index\.html)?"/g)].map(match=>match[1]));
const conflicts=tools.filter(tool=>existing.has(tool.slug));
if(conflicts.length)throw new Error(`與既有工具重複：${conflicts.map(tool=>tool.slug).join(', ')}`);
for(const tool of tools){const dir=path.join(root,tool.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),page(tool),'utf8')}

for(const [category,config] of Object.entries(categories)){
  const group=tools.filter(tool=>tool.category===category);if(!config.existing)continue;
  const heading=`>${category}</h2>`,start=home.indexOf(heading);if(start<0)throw new Error(`首頁找不到分類：${category}`);
  const sectionEnd=home.indexOf('</section>',start),button=home.lastIndexOf(`<button onclick="scrollContainer('${config.slider}', 1)"`,sectionEnd);if(button<start)throw new Error(`首頁找不到 Slider：${config.slider}`);
  const close=home.lastIndexOf('</div>',button),before=home.slice(0,close).replace(/[ \t\r\n]+$/,'\n                    '),block=`<!-- ${marker} START Cards-${category} -->\n${group.map(card).join('\n')}\n                        <!-- ${marker} END Cards-${category} -->\n                    `;home=before+block+home.slice(close);
}
const newSections=Object.entries(categories).filter(([,config])=>!config.existing).map(([category,config])=>homeSection(category,config,tools.filter(tool=>tool.category===category))).join('');
const seoMarker='<!-- 分類五：SEO 與網站優化 -->';
if(!home.includes(seoMarker))throw new Error('首頁找不到 SEO 分類插入點');
home=home.replace(/^[ \t]*<!-- 分類五：SEO 與網站優化 -->/m,newSections+`            ${seoMarker}`);
fs.writeFileSync(path.join(root,'index.html'),home,'utf8');

let sidebar=removeBlocks(fs.readFileSync(path.join(root,'components/sidebar.html'),'utf8'));
for(const [category,config] of Object.entries(categories)){
  const group=tools.filter(tool=>tool.category===category);if(!config.existing)continue;
  const heading=`>${category}</span>`,start=sidebar.indexOf(heading);if(start<0)throw new Error(`Sidebar 找不到分類：${category}`);
  const listStart=sidebar.indexOf('<div class="px-2 py-1 space-y-0.5">',start),close=sidebar.indexOf('</div>',listStart);if(listStart<start||close<listStart)throw new Error(`Sidebar 找不到分類清單：${category}`);
  const before=sidebar.slice(0,close).replace(/[ \t\r\n]+$/,'\n        '),block=`<!-- ${marker} START Links-${category} -->\n${group.map(sidebarLink).join('\n')}\n          <!-- ${marker} END Links-${category} -->\n        `;sidebar=before+block+sidebar.slice(close);
}
const newSidebar=Object.entries(categories).filter(([,config])=>!config.existing).map(([category])=>sidebarGroup(category,tools.filter(tool=>tool.category===category))).join('');
const seoSidebar='<!-- 群組 5: SEO 與網站優化 -->';
if(!sidebar.includes(seoSidebar))throw new Error('Sidebar 找不到 SEO 分類插入點');
sidebar=sidebar.replace(/^[ \t]*<!-- 群組 5: SEO 與網站優化 -->/m,newSidebar+`    ${seoSidebar}`);
fs.writeFileSync(path.join(root,'components/sidebar.html'),sidebar,'utf8');

let sitemap=removeBlocks(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'));
const urls=tools.map(tool=>`  <url><loc>https://toolhuben.com/${tool.slug}</loc><lastmod>2026-08-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
sitemap=sitemap.replace(/\s*<\/urlset>/,`\n  <!-- ${marker} START Sitemap -->\n${urls}\n  <!-- ${marker} END Sitemap -->\n</urlset>`);
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');
console.log(`GENERATED_TOOLS=${tools.length}`);
console.log(`NEW_CATEGORIES=${Object.values(categories).filter(config=>!config.existing).length}`);
