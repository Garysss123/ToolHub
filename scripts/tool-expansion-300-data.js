const tools=[
  ['hex-file-viewer','檔案 Hex 十六進位檢視器','檔案與資料格式','Binary Viewer','file-search','讀取本機檔案並以 Offset、Hex Bytes 與 ASCII 三欄顯示內容，支援限制預覽大小。','檔案格式研究、二進位除錯、封包與未知檔案初步檢視','瀏覽器只預覽指定範圍，不會修改或上傳原始檔案。'],
  ['file-bom-detector','檔案 BOM 與編碼標記檢查器','檔案與資料格式','Encoding Mark','file-scan','檢查檔案開頭是否包含 UTF-8、UTF-16 或 UTF-32 BOM，並顯示前置位元組。','文字匯入失敗、亂碼、CSV 與程式碼編碼問題排查','沒有 BOM 不代表無法判斷編碼，許多 UTF-8 檔案原本就不含 BOM。'],
  ['line-ending-converter','換行格式 LF／CRLF 轉換器','檔案與資料格式','Line Ending','wrap-text','辨識文字中的 LF、CRLF 與 CR，轉換成指定換行格式並保留內容。','跨平台程式碼、Shell Script、CSV 與設定檔整理','轉換會統一所有換行，混合格式中的特殊語意需先確認。'],
  ['jsonl-converter','JSONL／NDJSON 轉換與驗證工具','檔案與資料格式','JSON Lines','rows-3','在 JSON 陣列與 JSON Lines 格式之間轉換，逐行回報無效 JSON。','資料串流、模型訓練資料、日誌與批次匯入檔整理','每一行必須是完整 JSON 值，多行格式化物件不屬於 JSONL。'],
  ['toml-json-converter','TOML／JSON 雙向轉換器','檔案與資料格式','Config Format','file-cog','解析常見 TOML 區段、字串、數字、布林與陣列，或由 JSON 產生 TOML 設定。','應用程式設定、Rust／Python 專案與部署參數整理','進階 TOML 日期、內聯表格與陣列表格應使用完整語言 Parser 複核。'],
  ['java-properties-converter','Java Properties／JSON 轉換器','檔案與資料格式','Properties','braces','在 Java .properties 與 JSON 之間轉換，處理註解、跳脫字元及點號巢狀鍵。','Java 設定、i18n 資源、環境參數與前端設定遷移','重複鍵與複雜 Unicode 跳脫轉換後需依原系統規則確認。'],
  ['fixed-width-data-parser','固定欄寬文字解析器','檔案與資料格式','Fixed Width','columns-3','依欄位名稱與寬度規格切割固定欄寬資料，輸出表格 JSON 或 CSV。','舊系統報表、銀行批次檔、主機資料與純文字記錄','中文字寬在不同系統可能以 Bytes 或顯示寬度計算，本工具採 JavaScript 字元。'],
  ['m3u-playlist-parser','M3U 播放清單解析器','檔案與資料格式','Playlist','list-music','解析 M3U／M3U8 的 EXTINF、標題、群組與媒體網址，輸出結構化清單。','影音清單盤點、串流來源整理與播放列表遷移','工具不會連線播放或驗證媒體網址，也不繞過存取限制。'],
  ['vcard-generator','vCard 聯絡人檔產生器','檔案與資料格式','vCard 4.0','contact-round','輸入姓名、電話、Email、公司與地址，產生可下載的 vCard 3.0 或 4.0。','建立通訊錄交換檔、活動名片與客服聯絡資訊','不同通訊錄軟體支援欄位略有差異，匯入後應確認顯示結果。'],
  ['ical-event-generator','iCalendar 行事曆事件產生器','檔案與資料格式','RFC 5545','calendar-plus','建立含時區、開始結束時間、地點、說明與提醒的 ICS 行事曆事件。','會議邀請、活動下載、網站行程與跨平台行事曆交換','重複事件與複雜時區規則需要更完整的行事曆系統處理。'],

  ['keyboard-event-tester','鍵盤按鍵與 Event 測試器','瀏覽器與裝置測試','Keyboard Event','keyboard','即時顯示 key、code、修飾鍵、Repeat 與組合鍵狀態，保留最近事件。','快捷鍵開發、鍵盤差異排查、無障礙與遊戲操作測試','瀏覽器與作業系統可能攔截部分系統快捷鍵。'],
  ['pointer-event-tester','滑鼠與 Pointer Event 測試器','瀏覽器與裝置測試','Pointer Event','mouse-pointer-2','在互動區追蹤座標、壓力、按鍵、Pointer Type、傾斜與移動軌跡。','滑鼠、觸控筆、繪圖介面與拖曳互動除錯','裝置不支援的壓力或傾斜欄位可能固定為零。'],
  ['touch-gesture-tester','多點觸控手勢測試器','瀏覽器與裝置測試','Touch Gesture','move','辨識觸控點數、滑動距離、方向、雙指縮放與旋轉角度。','手機手勢、地圖、圖片檢視與觸控介面測試','桌面滑鼠無法完整模擬真實多點觸控資料。'],
  ['gamepad-tester','Gamepad 控制器測試器','瀏覽器與裝置測試','Gamepad API','gamepad-2','偵測瀏覽器已連接的控制器，即時顯示按鈕、搖桿軸與震動能力。','遊戲控制器、搖桿死區、按鍵映射與 Web 遊戲測試','瀏覽器通常需先按下控制器按鍵才會允許網站偵測。'],
  ['clipboard-format-inspector','剪貼簿格式檢視器','瀏覽器與裝置測試','Clipboard API','clipboard-list','在使用者授權後列出剪貼簿中的 MIME Types、純文字與 HTML 片段。','富文字貼上、編輯器、跨應用程式剪貼簿問題排查','剪貼簿讀取需要 HTTPS、瀏覽器支援及使用者主動授權。'],
  ['drag-drop-data-inspector','拖放資料 DataTransfer 檢視器','瀏覽器與裝置測試','Drag & Drop','import','顯示拖入項目的 Kind、MIME Type、檔名、大小與文字資料類型。','檔案上傳區、拖放排序、瀏覽器資料交換與前端除錯','基於安全限制，瀏覽器不會提供本機檔案完整路徑。'],
  ['browser-permissions-dashboard','瀏覽器權限狀態儀表板','瀏覽器與裝置測試','Permissions API','shield-check','查詢攝影機、麥克風、定位、通知、剪貼簿等瀏覽器權限狀態。','隱私設定排查、PWA 測試與裝置功能上線前檢查','查詢不會主動索取權限，部分瀏覽器不支援個別權限名稱。'],
  ['browser-capability-checker','瀏覽器功能支援檢查器','瀏覽器與裝置測試','Feature Detection','badge-check','檢查 WebAssembly、WebGL、WebGPU、Service Worker、WebRTC、Web Share 等功能。','前端相容性、PWA、媒體與新 Web API 上線前檢查','功能存在不代表硬體效能或所有細節皆完全相容。'],
  ['screen-orientation-tester','螢幕方向與 Viewport 測試器','瀏覽器與裝置測試','Screen API','smartphone','即時顯示螢幕尺寸、Viewport、方向、角度、Pixel Ratio 與 Visual Viewport。','響應式網頁、手機旋轉、瀏海區與虛擬鍵盤版面測試','部分數值會受到瀏覽器縮放、工具列與隱私保護影響。'],
  ['network-information-viewer','瀏覽器網路狀態檢視器','瀏覽器與裝置測試','Network API','wifi','顯示 Online 狀態、連線類型、Effective Type、RTT、Downlink 與 Data Saver。','漸進式載入、離線提示與低速網路體驗測試','Network Information API 支援度有限，數值是瀏覽器估計而非測速結果。'],

  ['har-file-analyzer','HAR 網路紀錄分析器','Web 品質與稽核','HAR Analyzer','chart-no-axes-gantt','解析 HAR 檔案，整理請求數、狀態碼、網域、傳輸大小、耗時與最慢資源。','DevTools 匯出紀錄、網站效能、API 瀑布與第三方資源盤點','HAR 可能含 Cookie、Token 與敏感網址，分享前務必移除機密資料。'],
  ['lighthouse-report-viewer','Lighthouse JSON 報告檢視器','Web 品質與稽核','Lighthouse','gauge','讀取 Lighthouse JSON，彙整分類分數、Core Web Vitals、改善建議與失敗稽核。','網站效能、SEO、無障礙與最佳實務報告整理','工具只解讀既有報告，不會自行連線執行 Lighthouse。'],
  ['html-heading-auditor','HTML 標題階層稽核器','Web 品質與稽核','Heading Outline','heading','解析 H1–H6，建立文件大綱並標示跳級、空標題與多個 H1。','SEO、文章結構、無障礙與 CMS 內容檢查','標題階層仍需配合頁面語意人工判斷，並非所有跳級都一定錯誤。'],
  ['html-link-rel-auditor','HTML 連結 Rel 安全稽核器','Web 品質與稽核','Link Safety','link-2','檢查 target=_blank、nofollow、sponsored、ugc、download 與外部連結的 rel 設定。','內容站、聯盟連結、外部導覽與 Reverse Tabnabbing 風險檢查','靜態片段無法判斷 JavaScript 動態產生的連結。'],
  ['html-form-accessibility-auditor','HTML 表單無障礙稽核器','Web 品質與稽核','Form A11y','list-checks','檢查 Input、Select、Textarea 的 Label、ID、Name、Autocomplete 與必填提示。','登入、結帳、問卷與後台表單的 WCAG 初步檢查','自動檢查不能取代鍵盤操作與螢幕閱讀器實測。'],
  ['html-table-accessibility-auditor','HTML 表格無障礙稽核器','Web 品質與稽核','Table A11y','table-2','檢查 Caption、表頭、Scope、Headers 關聯與表格是否疑似被用來排版。','報表、價格表、比較表與資料表格的可存取性檢查','複雜跨列跨欄表格仍需要人工驗證閱讀順序。'],
  ['css-variable-extractor','CSS 自訂變數擷取器','Web 品質與稽核','Design Tokens','palette','擷取 CSS Custom Properties，依 Scope、名稱與值分組，標示重複定義及 var() 使用。','Design Token 盤點、主題遷移、樣式重構與文件生成','工具不會解析建置工具插值或執行瀏覽器 Cascade。'],
  ['css-selector-usage-auditor','CSS Selector 使用情況稽核器','Web 品質與稽核','Selector Audit','scan-search','以 HTML 片段比對 CSS Selector，列出可匹配、未匹配與無法靜態分析的規則。','移除疑似未使用 CSS、樣式拆分與元件遷移','動態 Class、互動狀態、偽元素與跨頁面 Selector 可能被誤判。'],
  ['css-layer-visualizer','CSS Cascade Layer 視覺化工具','Web 品質與稽核','Cascade Layers','layers-3','解析 @layer 宣告與巢狀規則，顯示 Layer 順序、未分層樣式及依賴關係。','大型 CSS 架構、第三方樣式整合與 Cascade 除錯','工具著重結構視覺化，不會完整計算每個元素的最終 Specificity。'],
  ['web-manifest-auditor','Web App Manifest 稽核器','Web 品質與稽核','PWA Audit','app-window','驗證 Manifest JSON 的名稱、Icons、Start URL、Display、Theme Color 與常見 PWA 欄位。','PWA 安裝、Icon 尺寸、啟動畫面與發布前檢查','PWA 是否可安裝仍取決於 HTTPS、Service Worker 與瀏覽器規則。'],

  ['sri-hash-generator','Subresource Integrity Hash 產生器','部署與開發工作流','SRI','shield-check','對貼上的 CSS／JavaScript 或本機檔案產生 SHA-256、384、512 Integrity 值。','CDN Script、Stylesheet、防篡改設定與部署鎖版','資源內容只要有任何變更就必須重新產生 Integrity。'],
  ['security-txt-generator','security.txt 安全聯絡檔產生器','部署與開發工作流','RFC 9116','shield-alert','建立 Contact、Expires、Encryption、Policy、Acknowledgments 等 security.txt 欄位。','網站漏洞回報管道、安全政策與責任揭露流程','Contact 與 Expires 是正式部署前必須確認的核心欄位。'],
  ['bookmarklet-builder','Bookmarklet 書籤工具產生器','部署與開發工作流','Bookmarklet','bookmark-plus','將 JavaScript 包裝、壓縮並編碼成 javascript: Bookmarklet，提供測試與可讀版本。','瀏覽器自動化、頁面除錯、內容擷取與內部工作流程','只應在信任的頁面執行自己理解的程式碼。'],
  ['systemd-service-generator','systemd Service 單元檔產生器','部署與開發工作流','Linux Service','server','依服務名稱、執行命令、使用者、環境變數與重啟策略產生 Unit File。','Linux 服務、Node／Python App、背景程序與自動啟動設定','部署前需依實際權限、路徑、Sandbox 與發行版文件審查。'],
  ['docker-compose-generator','Docker Compose 產生器','部署與開發工作流','Compose','boxes','建立單服務 Compose YAML，包含 Image、Port、Volume、Environment、Healthcheck 與 Restart。','本機開發、容器部署、服務範本與團隊文件','正式環境還需處理 Secret、Network、資源限制與映像版本。'],
  ['ssh-config-generator','SSH Config 主機設定產生器','部署與開發工作流','SSH Config','key-round','依 Host、Hostname、User、Port、IdentityFile、ProxyJump 與 KeepAlive 產生設定片段。','多主機管理、跳板機、私有 Git 與遠端開發設定','私鑰權限與 Host Key 驗證仍需在本機安全管理。'],
  ['caddyfile-generator','Caddyfile 網站設定產生器','部署與開發工作流','Caddy','server-cog','產生靜態網站或 Reverse Proxy 的 Caddyfile，支援壓縮、Header、Root 與 SPA Fallback。','Caddy 部署、內部服務代理、容器與自動 HTTPS 網站','正式部署前應使用 caddy validate 並確認 DNS 與防火牆。'],
  ['apache-htaccess-generator','Apache .htaccess 規則產生器','部署與開發工作流','Apache','file-cog','產生 HTTPS、WWW、SPA Rewrite、快取、壓縮與安全 Header 常用規則。','虛擬主機、共享主機、舊站遷移與前端路由部署','伺服器必須允許 AllowOverride，規則也可能因 Apache 模組而異。'],
  ['cookie-header-builder','Set-Cookie Header 產生器','部署與開發工作流','Cookie Builder','cookie','組合 Name、Value、Domain、Path、Expires、Max-Age、Secure、HttpOnly 與 SameSite。','登入 Session、偏好設定、API 測試與 Cookie 安全設定','敏感 Cookie 應搭配 HTTPS、短效期限與伺服器端驗證。'],
  ['curl-to-fetch-converter','cURL 轉 Fetch 程式碼工具','部署與開發工作流','HTTP Code','arrow-right-left','解析常用 cURL 參數，轉成瀏覽器 Fetch JavaScript，保留 Method、Header 與 Body。','API 文件、DevTools 請求、前端串接與除錯範例','複雜 Shell 變數、檔案上傳與特殊 cURL 選項可能需手動調整。'],

  ['github-issue-template-generator','GitHub Issue Template 產生器','內容清理與維運','Issue Form','clipboard-list','建立 Markdown Issue Template，包含問題描述、重現步驟、環境、檢查清單與 Label。','開源專案、Bug 回報、需求收集與團隊工單標準化','不同 Repository 流程可能需要 YAML Issue Form 或額外自動化。'],
  ['conventional-commit-builder','Conventional Commit 訊息產生器','內容清理與維運','Commit Message','git-commit-horizontal','依 Type、Scope、摘要、Body、Breaking Change 與 Issue 產生 Conventional Commit。','Git 歷史、Release Note、自動版本與團隊提交規範','實際 Type 與 Scope 應遵守專案自己的 Commit Convention。'],
  ['changelog-entry-generator','Changelog 條目產生器','內容清理與維運','Release Notes','notebook-tabs','依版本、日期與 Added／Changed／Fixed／Removed 內容產生 Keep a Changelog 格式。','版本發布、產品更新、套件維護與使用者公告','工具不會讀取 Git 歷史，內容仍需由維護者確認。'],
  ['npm-script-builder','package.json Scripts 指令產生器','內容清理與維運','npm Scripts','package-plus','組合 Dev、Build、Test、Lint、Format、Clean 與串並行執行 Script JSON。','前端專案、Node.js 套件、CI 與團隊指令標準化','指令與套件名稱需依實際技術棧安裝及調整。'],
  ['git-rebase-todo-builder','Git Rebase Todo 編排工具','內容清理與維運','Git History','git-compare-arrows','貼上 Commit 清單後以 Pick、Reword、Edit、Squash、Fixup、Drop 編排 Rebase Todo。','整理提交歷史、合併 WIP Commit 與準備 Pull Request','Rebase 會改寫歷史，已共享的分支操作前需先協調。'],
  ['json-patch-generator','JSON Patch 差異產生器','內容清理與維運','RFC 6902','diff','比較兩份 JSON，產生 Add、Remove、Replace 操作與 JSON Pointer 路徑。','API 更新、設定同步、狀態差異與測試資料建立','陣列差異採索引比較，複雜搬移可能不會自動產生 Move。'],
  ['pii-redactor','敏感個資遮罩工具','內容清理與維運','Privacy','shield-ban','偵測並遮罩 Email、電話、IP、身分證樣式、信用卡樣式與自訂關鍵字。','客服紀錄、Log、測試資料、文件分享與 AI Prompt 前處理','規則比對無法保證找出所有個資，正式分享前仍需人工檢查。'],
  ['log-level-filter','Log 等級篩選與著色工具','內容清理與維運','Log Viewer','list-filter','辨識 TRACE、DEBUG、INFO、WARN、ERROR、FATAL，依等級與關鍵字篩選輸出。','應用程式日誌、CI 記錄、伺服器除錯與事件調查','非標準格式可能無法自動辨識等級，可改用關鍵字輔助。'],
  ['stack-trace-cleaner','Stack Trace 清理與摘要工具','內容清理與維運','Error Trace','bug-off','移除重複框架、Node Modules、內部呼叫與查詢字串，保留核心錯誤路徑。','錯誤回報、Issue、客服紀錄與跨團隊除錯資訊整理','清理可能隱藏關鍵底層資訊，原始 Trace 應另外保存。'],
  ['markdown-frontmatter-parser','Markdown Front Matter 解析器','內容清理與維運','Front Matter','file-text','解析 Markdown 開頭的 YAML／TOML／JSON Front Matter，分離欄位與正文。','靜態網站、內容遷移、CMS、Blog 與文件批次檢查','複雜 YAML Anchor、Tag 與多文件語法需要完整 Parser。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const categories={
  '檔案與資料格式':{slider:'slider-file-format',color:'violet',existing:false,icon:'files'},
  '瀏覽器與裝置測試':{slider:'slider-browser-device',color:'sky',existing:false,icon:'monitor-smartphone'},
  'Web 品質與稽核':{slider:'slider-web-audit',color:'teal',existing:false,icon:'scan-search'},
  '部署與開發工作流':{slider:'slider-deployment',color:'cyan',existing:false,icon:'workflow'},
  '內容清理與維運':{slider:'slider-maintenance',color:'amber',existing:false,icon:'wand-sparkles'}
};
const paletteNames=['violet','sky','teal','amber','rose','emerald','indigo','cyan'];
const layoutNames=['terminal','glass','editorial','neon','compact','aurora','split','blueprint'];
tools.forEach((tool,index)=>{tool.palette=paletteNames[(index*3+2)%paletteNames.length];tool.layout=layoutNames[(index*5+Math.floor(index/6))%layoutNames.length]});
module.exports={tools,categories};
