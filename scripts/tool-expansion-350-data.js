const tools=[
  ['csv-column-profiler','CSV 欄位剖析器','資料結構與驗證','Column Profile','columns-3','分析 CSV 各欄位的空值、唯一值、數值範圍、平均值與常見內容，快速掌握資料品質。','資料清理、匯入前檢查、開放資料探索與試算表品質盤點','CSV 引號與換行欄位會依常見 RFC 4180 規則解析，特殊方言仍需核對。'],
  ['csv-schema-inference','CSV Schema 型別推斷器','資料結構與驗證','Schema Inference','table-properties','從 CSV 樣本推斷字串、整數、浮點數、布林值、日期與空值允許條件，產生可讀 Schema。','資料庫匯入、API 欄位設計、ETL 規劃與測試資料建模','推斷只反映目前樣本，正式 Schema 應納入完整資料與業務規則。'],
  ['json-schema-sample-generator','JSON Schema 範例資料產生器','資料結構與驗證','JSON Schema','braces','讀取常用 JSON Schema 型別、屬性、必要欄位、Enum、Default 與陣列規則，產生一份範例資料。','API 文件、Mock Data、測試案例與表單原型建立','複雜的 $ref、條件式 Schema 與自訂 Format 可能需要專用解析器。'],
  ['json-schema-validator','JSON Schema 基礎驗證器','資料結構與驗證','Schema Validator','badge-check','以瀏覽器檢查 JSON 資料是否符合常用 Type、Required、Properties、Items、Enum 與長度範圍規則。','前端表單、設定檔、API Payload 與測試資料驗證','此工具涵蓋常用規則，不等同完整 JSON Schema 規格實作。'],
  ['yaml-path-explorer','YAML Path 路徑探索器','資料結構與驗證','YAML Path','route','解析常見 YAML 物件與陣列結構，列出每個值的點號路徑、型別與內容。','設定檔導覽、CI YAML 檢查、欄位文件與資料遷移','Anchor、Tag、多文件與複雜區塊語法可能需要完整 YAML Parser。'],
  ['xml-namespace-inspector','XML Namespace 命名空間檢視器','資料結構與驗證','XML Namespace','network','整理 XML 內宣告與實際使用的 Namespace、Prefix、元素及屬性數量。','SOAP、SVG、RSS、Office XML 與整合格式除錯','格式不完整的 XML 會由瀏覽器 Parser 回報錯誤，外部實體不會載入。'],
  ['sql-query-parameterizer','SQL 查詢參數化工具','資料結構與驗證','SQL Safety','database-zap','將 SQL 內常見字串與數字常值替換為命名或問號參數，並整理對應參數清單。','API 查詢重構、程式碼審查、測試樣本與 SQL 注入風險降低','自動處理無法理解所有資料庫方言，正式查詢必須由開發者複核。'],
  ['sql-identifier-quoter','SQL 識別字引用工具','資料結構與驗證','SQL Dialect','quote','依 PostgreSQL、MySQL、SQL Server 或 SQLite 規則引用表名與欄名，並處理保留字與跳脫。','跨資料庫遷移、動態 SQL、Schema 文件與查詢產生','識別字引用不能取代參數化查詢，資料值絕對不應用此方式拼接。'],
  ['delimited-data-sampler','分隔資料抽樣器','資料結構與驗證','Data Sampler','shuffle','從 CSV、TSV 或自訂分隔資料依固定間距、隨機種子或前後區段抽取代表性資料列。','大型資料預覽、測試樣本、除錯附件與資料品質抽查','抽樣結果不保證統計代表性，嚴謹研究應採正式抽樣設計。'],
  ['data-record-deduplicator','結構化資料紀錄去重器','資料結構與驗證','Record Dedup','copy-minus','依指定 CSV 欄位或 JSON Key 建立複合鍵，保留第一筆、最後一筆或列出重複群組。','名單整理、匯入前清理、事件紀錄合併與測試資料維護','空值、大小寫與空白正規化策略會影響判定，執行前應先確認規則。'],

  ['markdown-task-list-manager','Markdown 任務清單管理器','Markdown 與內容工作流','Task List','list-todo','解析 Markdown Checkbox，依完成狀態篩選、重新編號、切換勾選並輸出整理後的任務清單。','README、專案筆記、會議追蹤與個人待辦整理','巢狀清單會保留縮排，但複雜 Markdown 擴充語法仍需人工檢查。'],
  ['markdown-citation-formatter','Markdown 引用格式產生器','Markdown 與內容工作流','Citation','book-marked','依作者、標題、出版年、網站、DOI 與網址產生 APA、MLA 或 Chicago 風格引用與 Markdown 連結。','研究筆記、技術文章、報告參考資料與內容編輯','不同機構可能採用不同版本與細節規範，正式稿件應依指定 Style Guide 校對。'],
  ['markdown-footnote-manager','Markdown 註腳整理器','Markdown 與內容工作流','Footnotes','list-ordered','掃描 Markdown 註腳引用與定義，找出遺漏、未使用與重複項目，並可依出現順序重新編號。','長篇文章、文件網站、研究筆記與出版前清理','部分 Markdown 引擎的註腳語法不同，輸出前需確認目標平台支援。'],
  ['markdown-link-rewriter','Markdown 連結批次改寫器','Markdown 與內容工作流','Link Rewrite','replace-all','依 Base URL、路徑前綴或網域規則批次改寫 Markdown 行內連結與圖片網址。','文件搬遷、網域更換、靜態站重組與資產路徑修正','參考式連結與非標準嵌入語法可能需要額外人工處理。'],
  ['markdown-callout-builder','Markdown Callout 提示框產生器','Markdown 與內容工作流','Callout','message-square-warning','建立 Note、Tip、Warning、Important 等 GitHub 或 Obsidian 風格的 Markdown Callout 區塊。','技術文件、知識庫、教學文章與專案說明','不同平台支援的 Callout 語法不一致，請選擇符合發佈平台的格式。'],
  ['text-pattern-highlighter','文字模式標記器','Markdown 與內容工作流','Pattern Markup','highlighter','以關鍵字或正規表示式找出文字片段，加入 Markdown 標記並產生命中位置摘要。','校稿、Log 重點整理、訪談編碼與需求文件標註','正規表示式過於寬鬆可能造成大量誤標，建議先用預覽結果確認。'],
  ['sentence-segmenter','多語句子分段器','Markdown 與內容工作流','Sentence Split','text-cursor-input','依中英文標點、縮寫與換行規則切分句子，提供編號、長度與逐句匯出。','語料整理、字幕準備、內容分析與翻譯前處理','特殊縮寫、對話格式與未加標點內容可能需要人工調整切分。'],
  ['bilingual-line-aligner','雙語逐行對齊工具','Markdown 與內容工作流','Bilingual Align','languages','將兩份語言文字依段落或行數對齊，標示缺漏並輸出 Markdown Table、TSV 或 JSON。','翻譯校對、字幕對照、語料庫建立與術語審查','工具依順序對齊，不會自動判斷語意相似度或修復錯位。'],
  ['unicode-confusable-detector','Unicode 易混淆字元檢查器','Markdown 與內容工作流','Confusables','scan-eye','找出文字中混用的拉丁、西里爾、希臘與全形字元，列出 Code Point、Script 與可疑位置。','帳號檢查、網址審查、程式碼 Review 與釣魚內容初步辨識','Script 混用不一定代表惡意，判定仍需結合語言與使用情境。'],
  ['keyboard-layout-converter','鍵盤配置誤打轉換器','Markdown 與內容工作流','Keyboard Layout','keyboard','在英文 QWERTY 與注音鍵位對照間轉換誤用配置輸入的字元，保留無法對應的內容。','切錯輸入法、測試鍵位、客服文字復原與輸入教學','不同作業系統與自訂鍵盤配置可能採用不同符號對照。'],

  ['permissions-policy-generator','Permissions-Policy 產生器','Web 協定與政策','Permissions Policy','shield-ellipsis','選擇 Camera、Microphone、Geolocation、Fullscreen 等功能的允許來源，產生 HTTP Header。','網站權限最小化、iframe 管理、資安基線與部署設定','瀏覽器支援與功能名稱會演進，上線前應對照目標瀏覽器文件。'],
  ['referrer-policy-advisor','Referrer-Policy 策略建議器','Web 協定與政策','Privacy Header','shield-question','依隱私、分析、跨來源與 HTTPS 降級需求比較策略，產生建議 Header 與行為矩陣。','網站隱私設計、資安 Header、分析追蹤與第三方整合','實際 Referer 傳送仍受瀏覽器、來源政策與連結屬性共同影響。'],
  ['cors-preflight-simulator','CORS Preflight 模擬器','Web 協定與政策','CORS Lab','plane','依來源、Method、Request Headers 與伺服器回應模擬預檢結果，指出缺少或衝突的 CORS Header。','API 串接、前端除錯、Gateway 設定與資安審查','此工具不會發送網路請求，實際結果仍以瀏覽器與伺服器回應為準。'],
  ['cache-key-builder','HTTP Cache Key 規則產生器','Web 協定與政策','Cache Strategy','key-round','依 Method、Host、Path、Query、Header、Cookie 與裝置條件組合可讀 Cache Key 與規則摘要。','CDN、反向代理、Edge Cache、API 快取與命中率分析','不同 CDN 語法與正規化行為不同，產生結果是設計草稿而非部署檔。'],
  ['csp-policy-auditor','Content-Security-Policy 稽核器','Web 協定與政策','CSP Audit','shield-check','解析 CSP 指令與來源，檢查 unsafe-inline、Wildcard、缺少 fallback 及常見保護指令。','資安 Header Review、舊站強化、第三方 Script 盤點與部署檢查','靜態稽核無法驗證頁面實際載入資源，建議搭配 Report-Only 觀測。'],
  ['robots-meta-generator','Robots Meta 標籤產生器','Web 協定與政策','Search Control','bot','組合 Index、Follow、Snippet、Image Preview、Video Preview 與翻譯限制，產生 Meta 與 X-Robots-Tag。','SEO 收錄管理、附件頁、測試環境與敏感內容控制','搜尋引擎可能有各自支援範圍，且 robots 指令不是存取控制機制。'],
  ['openapi-operation-extractor','OpenAPI Operation 擷取器','Web 協定與政策','OpenAPI','blocks','從 OpenAPI JSON 擷取 Method、Path、Operation ID、Tag、參數與回應狀態，輸出端點清單。','API 盤點、文件審查、測試規劃與前後端對接','目前以 JSON 與常見 OpenAPI 3 結構為主，外部 $ref 不會自動下載。'],
  ['graphql-query-formatter','GraphQL Query 格式化工具','Web 協定與政策','GraphQL','workflow','格式化 GraphQL Query、Mutation、Fragment 與參數，提供縮排與基本括號平衡檢查。','API 文件、前端查詢、測試案例與 Code Review','工具不包含完整 GraphQL Schema 驗證，欄位是否存在仍需向伺服器確認。'],
  ['url-pattern-tester','URLPattern 路由測試器','Web 協定與政策','URL Pattern','route','輸入 URLPattern 與多筆網址，測試 Pathname、Hostname、Protocol 規則並列出擷取群組。','前端 Router、Service Worker、Edge Route 與網址規則除錯','URLPattern API 支援度依瀏覽器而異，不支援時會使用簡化路徑匹配。'],
  ['http-vary-header-builder','HTTP Vary Header 產生器','Web 協定與政策','Vary Header','split','依內容協商、壓縮、語言、來源與 Client Hints 條件產生 Vary Header 並提醒快取爆炸風險。','CDN 快取、內容協商、CORS、RWD 圖片與效能調校','Vary: * 會使多數共享快取無法重用回應，應避免任意啟用。'],

  ['css-supports-builder','CSS @supports 條件產生器','前端元件與樣式','Feature Query','braces','組合 CSS 屬性和值的 And、Or、Not Feature Query，產生可直接使用的 @supports 區塊。','漸進增強、瀏覽器相容、現代 CSS 導入與 Fallback 管理','語法成立不代表所有行為完全相同，仍應在目標瀏覽器實測。'],
  ['css-font-stack-builder','CSS Font Stack 字型堆疊產生器','前端元件與樣式','Typography','type','依語言、用途與系統平台組合安全字型堆疊，處理含空格名稱與通用 Family。','網站排版、設計系統、Email 樣式與跨平台字型設定','本機字型是否存在由使用者裝置決定，正式品牌字體仍需合法 Web Font。'],
  ['css-logical-properties-converter','CSS 邏輯屬性轉換器','前端元件與樣式','Logical CSS','arrow-left-right','將 Margin、Padding、Border 與定位的 Left／Right 寫法轉為 Inline／Block 邏輯屬性。','RTL 支援、多語網站、Design System 與舊 CSS 現代化','複雜 Shorthand 與特定 Writing Mode 仍需人工檢視轉換語意。'],
  ['css-selector-tester','CSS Selector DOM 測試器','前端元件與樣式','Selector Test','scan-search','在隔離的 HTML 片段中執行 CSS Selector，列出命中元素、路徑、文字與屬性摘要。','前端除錯、爬蟲規則草擬、測試選擇器與樣式維護','瀏覽器不支援或語法錯誤的 Selector 會回報錯誤，動態狀態不會模擬。'],
  ['svg-sprite-builder','SVG Symbol Sprite 產生器','前端元件與樣式','SVG Sprite','layers-3','合併多段 SVG，擷取 ViewBox 與內容，產生可重用 Symbol Sprite 及 Use 範例。','Icon System、靜態網站、元件庫與網頁資產最佳化','外部 Style、重複 ID 與濾鏡引用可能需要進一步重新命名與整理。'],
  ['svg-path-formatter','SVG Path Data 格式化工具','前端元件與樣式','Path Data','pen-tool','將 SVG Path 指令拆行、統一空白與小數精度，並檢查命令與參數基本結構。','Icon 編修、SVG 除錯、版本差異閱讀與資產清理','格式化不會改變座標系，但進階 Path 最佳化仍需專用幾何工具。'],
  ['html-landmark-auditor','HTML Landmark 地標稽核器','前端元件與樣式','ARIA Landmark','accessibility','檢查 Header、Nav、Main、Aside、Footer 與 ARIA Role 的數量、名稱及巢狀關係。','網站無障礙、版型審查、Design System 與 WCAG 前置檢查','自動檢查只能找出結構問題，完整無障礙仍需鍵盤與讀屏實測。'],
  ['html-dialog-builder','HTML Dialog 對話框產生器','前端元件與樣式','Dialog UI','panel-top-open','依標題、內容、按鈕與關閉方式產生原生 Dialog HTML、CSS 與 JavaScript 範例。','確認視窗、表單流程、教學提示與無框架前端元件','正式使用需管理焦點、背景互動、Esc 行為與非支援瀏覽器策略。'],
  ['html-picture-builder','HTML Picture 響應式圖片產生器','前端元件與樣式','Responsive Image','image','依 AVIF、WebP、尺寸斷點、Srcset 與 Alt 文字組合 Picture 元素與 Fallback。','效能優化、Art Direction、部落格、作品集與電商圖片','瀏覽器只會選擇候選資源，圖片檔與正確尺寸仍需自行準備。'],
  ['html-details-builder','HTML Details 摺疊內容產生器','前端元件與樣式','Disclosure UI','list-collapse','建立可存取的 Details／Summary 摺疊內容，支援預設展開、群組名稱與基礎樣式。','FAQ、說明文件、設定面板與不依賴 JavaScript 的互動內容','不同瀏覽器的預設動畫與樣式不同，複雜 Accordion 需額外測試。'],

  ['srt-cue-splitter','SRT 字幕段落切分器','媒體與交換格式','Subtitle Cue','captions','依最大字數、標點與最低顯示時間將過長 SRT Cue 切分，重新分配時間並編號。','影片字幕、短影音、課程內容與可讀性調整','自動分時不理解語音節奏，輸出仍需搭配影片逐段校對。'],
  ['webvtt-validator','WebVTT 字幕驗證器','媒體與交換格式','WebVTT','badge-check','檢查 WEBVTT Header、Cue 時間、順序、重疊、設定與空白分隔，列出可定位問題。','HTML5 影片、字幕上架、教學平台與播放器除錯','播放器對擴充標籤與 Cue Setting 的支援不同，建議在目標播放器複測。'],
  ['webvtt-chapter-generator','WebVTT 章節檔產生器','媒體與交換格式','Video Chapters','list-video','依章節標題與開始時間自動計算結束時間，產生可供影片使用的 WebVTT Chapters。','線上課程、Podcast 影片、產品展示與長影音導覽','最後章節需要影片總長度，時間也必須保持遞增且不重疊。'],
  ['podcast-chapter-builder','Podcast Chapters JSON 產生器','媒體與交換格式','Podcast 2.0','podcast','建立 Podcasting 2.0 Chapters JSON，包含開始時間、標題、網址與圖片欄位。','Podcast 節目、章節導覽、播放器整合與發佈流程','Host 與播放器支援程度不同，正式發佈前需依平台規格驗證。'],
  ['cue-sheet-generator','音訊 CUE Sheet 產生器','媒體與交換格式','CUE Sheet','disc-3','依專輯、演出者與曲目起始時間產生標準 CUE Sheet，並驗證 MM:SS:FF 格式。','整軌音訊分軌、CD 備份、音樂典藏與播放清單整理','Frame 以每秒 75 格計算，來源音訊與編碼工具仍需正確配合。'],
  ['opml-outline-builder','OPML 大綱與訂閱清單產生器','媒體與交換格式','OPML','network','將縮排大綱或 Feed 清單轉為 OPML 2.0，支援文字節點與 RSS XML URL。','RSS 閱讀器匯入、知識大綱、Podcast 訂閱與書籤交換','不同 App 對自訂 Attribute 的支援不同，匯入前可先保留原始清單。'],
  ['rss-feed-builder','RSS 2.0 Feed 產生器','媒體與交換格式','RSS 2.0','rss','依頻道資訊與多筆文章資料產生 RSS 2.0 XML，處理日期、GUID、摘要與必要跳脫。','Blog、更新公告、Podcast 前置稿與內容分發','正式 Feed 的 URL、日期、內容編碼與伺服器 MIME Type 都應再次驗證。'],
  ['social-share-link-builder','社群分享連結產生器','媒體與交換格式','Share Links','share-2','依網址、標題與摘要產生 Facebook、X、LinkedIn、LINE、Email 等分享連結與 HTML。','文章、活動頁、產品頁、電子報與行銷素材','平台參數與政策可能調整，分享預覽仍由各平台抓取的 Meta 決定。'],
  ['wifi-qr-payload-builder','Wi-Fi QR Payload 產生器','媒體與交換格式','Wi-Fi QR','wifi','依 SSID、密碼、WPA／WEP／無密碼與隱藏網路設定產生標準 Wi-Fi QR Payload。','訪客網路、活動場地、商店、辦公室與家庭快速連線','此工具產生文字 Payload；可再貼到 QR Code 工具製作圖碼，並避免公開敏感密碼。'],
  ['vcard-parser','vCard 聯絡人解析器','媒體與交換格式','vCard Parser','contact-round','解析 vCard 3.0／4.0 常用欄位、多值電話、Email、地址與跳脫字元，輸出 JSON 摘要。','聯絡人資料檢查、CRM 匯入前整理、備份與格式除錯','照片、群組、多語參數與廠商擴充欄位可能需要專用 vCard 程式庫。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const categories={
  '資料結構與驗證':{slider:'slider-data-validation',color:'violet',existing:false,icon:'database'},
  'Markdown 與內容工作流':{slider:'slider-markdown-workflow',color:'amber',existing:false,icon:'notebook-pen'},
  'Web 協定與政策':{slider:'slider-web-policy',color:'cyan',existing:false,icon:'shield-check'},
  '前端元件與樣式':{slider:'slider-frontend-components',color:'rose',existing:false,icon:'panels-top-left'},
  '媒體與交換格式':{slider:'slider-media-interchange',color:'emerald',existing:false,icon:'file-output'}
};
const paletteNames=['violet','sky','teal','amber','rose','emerald','indigo','cyan'];
const layoutNames=['terminal','glass','editorial','neon','compact','aurora','split','blueprint'];
tools.forEach((tool,index)=>{tool.palette=paletteNames[(index*5+3)%paletteNames.length];tool.layout=layoutNames[index%layoutNames.length]});
module.exports={tools,categories};
