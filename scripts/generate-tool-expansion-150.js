const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const tools=[
  ['morse-code-translator','摩斯密碼翻譯器','編碼與轉換','訊號編碼','radio','在文字與國際摩斯碼之間雙向轉換，支援英文字母、數字與常用標點。','學習電報訊號、製作解謎內容、核對通訊編碼','非拉丁文字沒有國際摩斯碼對應，未知字元會保留提示。'],
  ['binary-text-converter','二進位文字轉換器','編碼與轉換','UTF-8','binary','將 Unicode 文字依 UTF-8 轉成 8 位元二進位資料，也能完整還原文字。','檢查字元位元組、教學示範、除錯資料傳輸','解碼資料必須是完整的 8 位元群組，錯誤位元可能產生替代字元。'],
  ['braille-translator','英文點字翻譯器','編碼與轉換','Braille','circle-dot','將英文字母轉為 Unicode 點字符號，並支援點字反向解讀。','無障礙教材、介面原型、基礎點字學習','本工具提供基礎英文字母對照，不包含完整縮寫點字與語境規則。'],
  ['roman-numeral-converter','羅馬數字轉換器','編碼與轉換','數字格式','landmark','在 1–3999 阿拉伯數字與標準羅馬數字之間進行嚴格雙向轉換。','章節編號、鐘面設計、歷史資料整理','標準羅馬數字通常只涵蓋 1–3999，非標準重複寫法會被拒絕。'],
  ['unicode-normalizer','Unicode 正規化工具','編碼與轉換','NFC / NFD','languages','比較 NFC、NFD、NFKC、NFKD 四種 Unicode 正規化結果與碼點。','搜尋比對、帳號清理、跨平台文字除錯','相容性正規化可能改變全形或特殊字形的語意呈現，套用前應保留原文。'],
  ['escape-sequence-converter','跳脫序列轉換器','編碼與轉換','Escape','unfold-horizontal','將換行、Tab、引號與 Unicode 控制字元轉成安全跳脫序列或反向還原。','程式碼字串、日誌除錯、設定檔資料準備','還原功能只處理明確支援的序列，不會執行輸入內容或動態程式碼。'],
  ['data-size-converter','資料容量單位換算器','編碼與轉換','SI / IEC','database','精準換算 B、KB、MB、GB、TB 與 KiB、MiB、GiB、TiB。','儲存規格比較、雲端計費、下載容量估算','十進位與二進位單位基準不同，GB 不等於 GiB，應依產品標示選擇。'],
  ['subtitle-converter','SRT／WebVTT 字幕轉換器','編碼與轉換','字幕格式','captions','在 SRT 與 WebVTT 間轉換時間格式，並能整批位移字幕時間軸。','影片剪輯、網頁字幕、修正音畫延遲','複雜樣式標籤與平台專屬字幕功能可能需要在剪輯軟體再次確認。'],
  ['css-unit-converter','CSS 單位轉換器','Web 開發','CSS 尺寸','ruler','依根字體、父層字體、Viewport 與百分比基準換算 px、rem、em、vw、vh、%。','響應式排版、設計稿轉碼、字級與間距換算','em 與百分比會受到實際父層上下文影響，結果應放回目標元件驗證。'],
  ['css-specificity-calculator','CSS 選擇器權重計算器','Web 開發','Specificity','list-ordered','逐行分析 CSS Selector 的 ID、類別與元素權重，快速找出覆寫衝突。','大型樣式表除錯、元件覆寫、Code Review','複雜偽類會依 CSS 規範影響權重，產生結果後仍應配合 Cascade 層級檢查。'],
  ['css-transform-generator','CSS Transform 產生器','Web 開發','視覺 CSS','move-3d','用數值控制位移、旋轉、縮放、傾斜與原點，並即時預覽 CSS Transform。','卡片動效、圖片排版、互動元件原型','Transform 函式順序會影響最終幾何結果，複製後不要任意交換順序。'],
  ['css-text-shadow-generator','CSS 文字陰影產生器','Web 開發','文字效果','type','調整陰影位移、模糊、顏色與透明度，即時產生可複製的 text-shadow。','標題視覺、霓虹文字、提高背景可讀性','陰影過重會降低小字清晰度，正式使用前應檢查對比與行動版效果。'],
  ['css-clip-path-generator','CSS Clip Path 產生器','Web 開發','形狀裁切','shapes','選擇三角形、菱形、六角形、星形等預設，或輸入 Polygon 座標。','圖片裁切、裝飾背景、非矩形卡片','自訂 Polygon 至少需要三點，瀏覽器縮放時也要檢查輪廓是否符合預期。'],
  ['html-minifier','HTML 壓縮工具','Web 開發','效能優化','file-code-2','移除多餘註解與標籤間空白，同時保護 pre、textarea、script、style 區塊。','部署前縮小檔案、比較壓縮率、靜態頁面優化','動態模板或依賴特殊空白的內容應先在測試環境確認，不建議直接覆蓋原始檔。'],
  ['css-minifier','CSS 壓縮工具','Web 開發','效能優化','braces','清除一般註解與多餘空白，保留可選的重要授權註解並計算節省比例。','正式環境部署、樣式檔瘦身、快速壓縮片段','壓縮器不執行完整 AST 重寫，特殊舊式語法應在目標瀏覽器測試。'],
  ['responsive-breakpoint-generator','響應式斷點產生器','Web 開發','Media Query','monitor-smartphone','用名稱與像素清單建立 Mobile First 或 Desktop First Media Query 樣板。','設計系統、切版起始檔、統一團隊斷點','max-width 模式會減去極小值避免邊界重疊，仍需配合實際裝置測試。'],
  ['curl-command-builder','cURL 指令產生器','API / HTTP','API 請求','terminal','依 HTTP 方法、URL、Headers、驗證方式與 Body 組合安全可讀的 cURL 指令。','API 文件、除錯請求、重現前端呼叫','產生的 Token 與密碼只留在目前頁面，但複製到終端前仍應確認指令歷史風險。'],
  ['cache-control-generator','Cache-Control 標頭產生器','API / HTTP','快取策略','timer-reset','組合 public、private、max-age、s-maxage、immutable 與重新驗證策略。','CDN 設定、靜態資源快取、API 回應規劃','快取時間需配合內容更新機制，錯誤的 immutable 可能讓使用者長期取得舊檔。'],
  ['csp-header-generator','CSP 安全標頭產生器','API / HTTP','網站安全','shield-check','建立 default-src、script-src、style-src、img-src 等 Content Security Policy。','降低 XSS 風險、部署安全標頭、Report-Only 測試','CSP 應先以 Report-Only 觀察實際資源，直接強制可能阻擋必要功能。'],
  ['cors-header-generator','CORS 標頭產生器','API / HTTP','跨來源','waypoints','依來源、方法、Headers、憑證與預檢快取產生完整 CORS 回應標頭。','前後端分離、API Gateway、跨網域除錯','允許憑證時不可搭配萬用來源，實際回應也應驗證 Origin 白名單。'],
  ['cookie-parser','Cookie 解析器','API / HTTP','Header 分析','cookie','將 Cookie 或 Set-Cookie 內容拆成名稱、值與屬性，輸出清楚 JSON。','登入問題除錯、檢查 SameSite、整理瀏覽器 Header','Cookie 值可能經 URL 或 Base64 編碼，本工具不會自動猜測或解密內容。'],
  ['http-date-converter','HTTP 日期轉換器','API / HTTP','RFC 7231','calendar-clock','在 RFC 7231、ISO 8601、Unix 秒、毫秒與台北時間之間互相檢視。','API Header、快取日期、伺服器日誌核對','沒有時區的日期字串會依瀏覽器環境解讀，正式資料應明確附帶時區。'],
  ['xml-formatter','XML 格式化工具','JSON / XML / YAML','XML','code-xml','驗證 XML 語法並提供美化縮排或單行壓縮，可下載標準 XML 檔。','API Payload、設定檔、資料交換除錯','格式化不會驗證 XSD 或外部 DTD，語意與 Schema 仍需另行確認。'],
  ['json-flattener','JSON 攤平與還原工具','JSON / XML / YAML','JSON Path','workflow','將巢狀物件與陣列攤平成路徑鍵值，也能從路徑物件還原結構。','試算表匯出、環境變數映射、分析巢狀資料','欄位名稱若本身包含所選分隔符號可能產生歧義，應改用不衝突字元。'],
  ['json-path-tester','JSONPath 查詢測試器','JSON / XML / YAML','JSON 查詢','search-code','使用 $.key、[index] 與 [*] 查詢 JSON 節點，顯示匹配數與格式化結果。','API 回應取值、自動化規則設計、資料除錯','目前聚焦常用路徑語法，不包含過濾表達式與遞迴下降等進階擴充。'],
  ['env-file-converter','.env 與 JSON 轉換器','JSON / XML / YAML','設定檔','file-json','在 .env 變數與 JSON 物件之間雙向轉換，處理引號、export 與註解。','部署設定整理、CI/CD 變數搬移、本機環境建立','輸出可能包含敏感值，下載或貼入版本控制前務必移除密碼與金鑰。'],
  ['markdown-table-generator','Markdown 表格產生器','JSON / XML / YAML','Markdown','table-2','用逗號分隔的標題與資料列快速建立靠左、置中或靠右的 Markdown 表格。','README、技術文件、Issue 與知識庫','包含逗號的儲存格目前需先改用其他文字，豎線會自動跳脫。'],
  ['word-frequency-counter','詞頻統計工具','文字處理','內容分析','bar-chart-3','依 Unicode 斷詞統計詞語出現次數，可控制詞長、大小寫與顯示數量。','文章用詞檢查、研究訪談、內容編輯','中文斷詞結果取決於瀏覽器 Intl.Segmenter 支援，專業語料仍應人工抽查。'],
  ['reading-time-calculator','閱讀時間計算器','文字處理','文章分析','clock-3','分別計算中文字與英文單字，依自訂閱讀速度估算文章閱讀時間。','部落格標示、教材安排、內容長度評估','閱讀速度會受難度、圖表與讀者背景影響，結果是規劃用估計值。'],
  ['n-gram-generator','N-gram 文字分析器','文字處理','語料分析','network','依詞語或字元建立 N-gram，統計相鄰組合與出現頻率。','關鍵片語探索、語料研究、重複模式分析','N 值過大時組合會快速增加，長文件建議限制顯示筆數。'],
  ['text-column-extractor','文字欄位擷取器','文字處理','表格文字','columns-3','從 CSV、TSV 或自訂分隔文字擷取指定欄位，可去重與清理空白。','Email 清單整理、日誌欄位抽取、批次資料準備','此工具採簡易分隔規則，含引號內分隔符號的完整 CSV 建議使用專用轉換器。'],
  ['text-template-filler','文字範本變數填入器','文字處理','Template','braces','將 JSON 或 key=value 資料填入 {{變數}} 範本，並列出尚未提供的欄位。','通知草稿、測試資料、重複文件產生','本工具只做純文字替換，不執行條件、迴圈或任何範本程式碼。'],
  ['regex-escape-tool','正則特殊字元跳脫工具','文字處理','Regex','asterisk','針對完整 Pattern、字元類別或 Replacement 安全跳脫正則特殊字元。','精確搜尋使用者輸入、建立動態規則、避免 Pattern 注入','跳脫後代表字面比對；若需要真正的正則邏輯，請再使用 Regex 測試器驗證。'],
  ['hmac-generator','HMAC 訊息驗證碼產生器','開發工具','Web Crypto','key-round','使用 Web Crypto 產生 SHA-1、SHA-256、SHA-384 或 SHA-512 HMAC。','Webhook 驗證測試、API 簽章、訊息完整性比對','HMAC 安全性取決於祕密金鑰強度；SHA-1 僅為相容用途，不建議新系統採用。'],
  ['aes-encryption-tool','AES-GCM 本機加解密工具','開發工具','AES-256','lock-keyhole','以 PBKDF2 衍生 AES-256-GCM 金鑰，包含隨機 Salt、IV 與驗證標籤。','本機保護文字、測試加密流程、產生可攜式封包','忘記密碼就無法復原；重要資料仍應使用經審查的密碼管理與備份方案。'],
  ['semver-calculator','Semantic Version 計算器','開發工具','SemVer','git-compare-arrows','驗證、比較並升級 Semantic Version 的 Major、Minor、Patch 與預發版本。','套件發布、版本規劃、CI/CD 腳本確認','版本升級類型仍應依相容性影響判斷，本工具不會分析實際程式碼變更。'],
  ['chmod-calculator','Unix chmod 權限計算器','開發工具','Linux','file-lock-2','用數字選擇擁有者、群組與其他人權限，產生八進位、符號與 chmod 指令。','Linux 部署、檔案權限教學、伺服器設定','遞迴 chmod 可能影響大量檔案，執行前務必確認路徑與最小權限原則。'],
  ['sql-formatter','SQL 格式化工具','開發工具','SQL','database-zap','整理通用、MySQL、PostgreSQL 與 SQLite 查詢的關鍵字、換行與縮排。','Code Review、日誌 SQL 閱讀、文件排版','格式器不連線資料庫也不驗證 Schema，複雜程序或方言語法應用資料庫工具複查。'],
  ['gitignore-generator','.gitignore 產生器','開發工具','Git','git-branch','組合 Node.js、Python、PHP、Java、.NET、作業系統與 IDE 忽略規則。','新專案初始化、跨平台協作、避免提交建置產物','產生後應依專案需求審查，避免忽略必須納入版本控制的設定或資產。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const paletteNames=['violet','sky','teal','amber','rose','emerald','indigo','cyan'];
const layoutNames=['aurora','split','blueprint','terminal','glass','editorial','neon','compact'];
tools.forEach((tool,index)=>{
  tool.palette=paletteNames[index%paletteNames.length];
  tool.layout=layoutNames[(index*3+Math.floor(index/paletteNames.length))%layoutNames.length];
});

const categories={
  '編碼與轉換':{slider:'slider-enc',color:'purple',label:'編碼轉換'},
  'Web 開發':{slider:'slider-web',color:'teal',label:'Web 開發'},
  'API / HTTP':{slider:'slider-api',color:'amber',label:'API / HTTP'},
  'JSON / XML / YAML':{slider:'slider-json',color:'rose',label:'資料格式'},
  '文字處理':{slider:'slider-text',color:'amber',label:'文字處理'},
  '開發工具':{slider:'slider-util',color:'cyan',label:'開發工具'}
};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faqs=tool=>[
  [`${tool.title}可以解決什麼問題？`,tool.description],
  [`如何使用${tool.title}？`,`先依欄位提示輸入資料並調整選項，按下「立即處理」檢查結果與統計資訊，再使用複製或下載功能帶到後續流程。`],
  [`${tool.title}的結果有哪些注意事項？`,tool.caveat],
  ['輸入資料會上傳到伺服器嗎？','不會。工具運算完全在目前瀏覽器中完成，ToolHub 不會接收、儲存或傳送你的輸入內容。'],
  [`哪些情境適合使用${tool.title}？`,`常見用途包含${tool.uses}。正式套用前，建議使用具代表性的邊界資料再次驗證。`]
];
function jsonLd(tool){const questions=faqs(tool).map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}));return JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebApplication',name:tool.title,url:`https://toolhuben.com/${tool.slug}`,description:tool.description,applicationCategory:'DeveloperApplication',operatingSystem:'All',browserRequirements:'Requires JavaScript',inLanguage:'zh-TW',offers:{'@type':'Offer',price:'0',priceCurrency:'TWD'},publisher:{'@type':'Organization',name:'ToolHub'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'首頁',item:'https://toolhuben.com/'},{'@type':'ListItem',position:2,name:tool.title,item:`https://toolhuben.com/${tool.slug}`}]},{'@type':'FAQPage',mainEntity:questions}]},null,2)}
function page(tool){const faq=faqs(tool);return `<!doctype html>
<html lang="zh-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(tool.title)}｜免費線上工具 - ToolHub</title><meta name="description" content="${escapeHtml(tool.description)}免費、免安裝，所有資料皆於瀏覽器本機處理。"><meta name="robots" content="index,follow"><link rel="canonical" href="https://toolhuben.com/${tool.slug}"><meta property="og:type" content="website"><meta property="og:locale" content="zh_TW"><meta property="og:site_name" content="ToolHub"><meta property="og:title" content="${escapeHtml(tool.title)}｜ToolHub"><meta property="og:description" content="${escapeHtml(tool.description)}"><meta property="og:url" content="https://toolhuben.com/${tool.slug}"><meta property="og:image" content="https://toolhuben.com/favicon.svg"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(tool.title)}｜ToolHub"><meta name="twitter:description" content="${escapeHtml(tool.description)}"><link rel="icon" href="/favicon.ico" sizes="any"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1732059148394592" crossorigin="anonymous"></script><script src="https://cdn.tailwindcss.com"></script><script src="https://unpkg.com/lucide@latest"></script><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/components/tool-page.css"><script type="application/ld+json">${jsonLd(tool)}</script></head>
<body class="font-sans" data-tool="${tool.slug}"><div id="component-header"></div><div id="component-sidebar"></div><main class="tool-wrap"><nav class="crumb" aria-label="麵包屑"><a href="/">首頁</a><span>/</span><span>${escapeHtml(tool.category)}</span><span>/</span><span>${escapeHtml(tool.title)}</span></nav><header class="hero"><span class="badge">${escapeHtml(tool.tag)} · 瀏覽器本機運算</span><h1>${escapeHtml(tool.title)}</h1><p>${escapeHtml(tool.description)}</p></header><div id="expansion-app" class="tool-grid" aria-label="${escapeHtml(tool.title)}操作區"></div><article class="seo"><section class="panel"><h2>${escapeHtml(tool.title)}完整使用指南</h2><p>${escapeHtml(tool.description)}工具不需要註冊或安裝套件，適合在桌面與手機瀏覽器快速完成工作。</p><h3>建議操作流程</h3><ol><li>先依欄位說明準備資料，使用範例值確認預期格式。</li><li>調整選項後執行處理，閱讀結果區的統計與錯誤提示。</li><li>複製或下載前核對代表性資料，正式使用時保留原始版本。</li></ol><h3>適用情境與實務建議</h3><p>常見用途包含${escapeHtml(tool.uses)}。${escapeHtml(tool.caveat)}</p><h3>隱私與相容性</h3><p>所有輸入與計算均留在瀏覽器本機，不會上傳到 ToolHub 伺服器。建議使用最新版 Chrome、Edge、Firefox 或 Safari；涉及目標平台規格時，仍需在實際環境完成最終驗證。</p></section><section class="panel faq"><h2>常見問題</h2>${faq.map(([q,a])=>`<details><summary>${escapeHtml(q)}</summary><div class="answer">${escapeHtml(a)}</div></details>`).join('')}</section></article></main><div id="component-footer"></div><script src="/components/tool-page.js"></script><script src="/components/tool-expansion.js"></script></body></html>
`}
function styledPage(tool){
  const hero=`<header class="hero expansion-hero"><div class="exp-hero-visual" aria-hidden="true"><div class="exp-hero-icon"><i data-lucide="${tool.icon}"></i></div><span class="exp-orbit exp-orbit-one"></span><span class="exp-orbit exp-orbit-two"></span></div><div class="exp-hero-copy"><span class="badge">${escapeHtml(tool.tag)} · 瀏覽器本機運算</span><h1><span>${escapeHtml(tool.title)}</span></h1><p>${escapeHtml(tool.description)}</p><div class="exp-hero-points"><span><i data-lucide="shield-check"></i>資料不上傳</span><span><i data-lucide="smartphone"></i>支援行動裝置</span><span><i data-lucide="palette"></i>支援主題切換</span></div></div></header>`;
  return page(tool)
    .replace('<link rel="stylesheet" href="/components/tool-page.css">','<link rel="stylesheet" href="/components/tool-page.css"><link rel="stylesheet" href="/components/tool-visual-core.css"><link rel="stylesheet" href="/components/tool-expansion.css"><link rel="stylesheet" href="/components/tool-experience.css?v=20260823-1">')
    .replace(`<body class="font-sans" data-tool="${tool.slug}">`,`<body class="font-sans" data-tool="${tool.slug}" data-tool-visual data-expansion-tool data-palette="${tool.palette}" data-layout="${tool.layout}" style="--tool-visual-accent:var(--tool-accent);--tool-visual-accent-rgb:var(--tool-accent-rgb)">`)
    .replace(/<header class="hero">[\s\S]*?<\/header>/,hero)
    .replace('<script src="/components/tool-expansion.js"></script>','<script src="/components/tool-expansion.js?v=20260823-experiences-2"></script>');
}
for(const tool of tools){const dir=path.join(root,tool.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),styledPage(tool),'utf8')}

function removeBlocks(text,prefix){return text.replace(new RegExp(`(?:[ \\t]*\\r?\\n)*[ \\t]*<!-- ${prefix} START [^>]+ -->[\\s\\S]*?<!-- ${prefix} END [^>]+ -->[ \\t]*(?:\\r?\\n[ \\t]*)*`,'g'),'\n')}
function card(tool){const c=categories[tool.category];return `                        <a href="/${tool.slug}/index.html" class="flex flex-col flex-none w-[42vw] sm:w-[22rem] snap-start group"><div class="flex-grow bg-hub-800 border border-hub-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover relative overflow-hidden flex flex-col"><div class="absolute -top-10 -right-10 w-32 h-32 bg-${c.color}-500/10 rounded-full blur-2xl group-hover:bg-${c.color}-500/20 transition-all"></div><div class="flex items-center justify-between mb-3 sm:mb-4"><div class="w-10 h-10 sm:w-12 sm:h-12 bg-hub-900 rounded-lg flex items-center justify-center border border-hub-700 group-hover:border-${c.color}-400 transition-colors"><i data-lucide="${tool.icon}" class="w-5 h-5 sm:w-6 sm:h-6 text-${c.color}-400"></i></div><span class="text-[10px] sm:text-xs font-medium bg-${c.color}-500/10 text-${c.color}-400 px-2 py-1 rounded-full border border-${c.color}-500/20">${escapeHtml(tool.tag)}</span></div><h3 class="text-[15px] sm:text-xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-${c.color}-400 transition-colors line-clamp-1">${escapeHtml(tool.title)}</h3><p class="text-slate-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 flex-grow line-clamp-2 sm:line-clamp-none">${escapeHtml(tool.description)}</p><div class="flex items-center text-xs sm:text-sm font-medium text-${c.color}-400 mt-auto pt-3 sm:pt-4 border-t border-hub-700/50"><span>開啟工具</span><i data-lucide="arrow-right" class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"></i></div></div></a>`}
let home=removeBlocks(fs.readFileSync(path.join(root,'index.html'),'utf8'),'TOOL EXPANSION 150');
for(const [category,config] of Object.entries(categories)){const group=tools.filter(t=>t.category===category),heading=`>${category}</h2>`,start=home.indexOf(heading);if(start<0)throw new Error(`首頁找不到分類：${category}`);const sectionEnd=home.indexOf('</section>',start),button=home.lastIndexOf(`<button onclick="scrollContainer('${config.slider}', 1)"`,sectionEnd);if(button<start)throw new Error(`首頁找不到 Slider：${config.slider}`);const close=home.lastIndexOf('</div>',button),before=home.slice(0,close).replace(/[ \\t\\r\\n]+$/,'\n                    ');const block=`<!-- TOOL EXPANSION 150 START ${category} -->\n${group.map(card).join('\n')}\n                        <!-- TOOL EXPANSION 150 END ${category} -->\n                    `;home=before+block+home.slice(close)}
fs.writeFileSync(path.join(root,'index.html'),home,'utf8');

function sidebarLink(tool){return `          <a href="/${tool.slug}" class="nav-item flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent transition-all rounded-r-md"><svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg><span class="font-medium text-[15px]">${escapeHtml(tool.title)}</span></a>`}
let sidebar=removeBlocks(fs.readFileSync(path.join(root,'components/sidebar.html'),'utf8'),'TOOL EXPANSION 150');
for(const category of Object.keys(categories)){const group=tools.filter(t=>t.category===category),heading=`>${category}</span>`,start=sidebar.indexOf(heading);if(start<0)throw new Error(`側欄找不到分類：${category}`);const listStart=sidebar.indexOf('<div class="px-2 py-1 space-y-0.5">',start),close=sidebar.indexOf('</div>',listStart);if(listStart<start||close<listStart)throw new Error(`側欄分類結構錯誤：${category}`);const before=sidebar.slice(0,close).replace(/[ \\t\\r\\n]+$/,'\n        '),block=`<!-- TOOL EXPANSION 150 START ${category} -->\n${group.map(sidebarLink).join('\n')}\n          <!-- TOOL EXPANSION 150 END ${category} -->\n        `;sidebar=before+block+sidebar.slice(close)}
fs.writeFileSync(path.join(root,'components/sidebar.html'),sidebar,'utf8');

let sitemap=removeBlocks(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),'TOOL EXPANSION 150');const urls=tools.map(t=>`  <url><loc>https://toolhuben.com/${t.slug}</loc><lastmod>2026-08-20</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');sitemap=sitemap.replace(/\s*<\/urlset>/,`\n  <!-- TOOL EXPANSION 150 START Sitemap -->\n${urls}\n  <!-- TOOL EXPANSION 150 END Sitemap -->\n</urlset>`);fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap,'utf8');
console.log(`GENERATED_TOOLS=${tools.length}`);
