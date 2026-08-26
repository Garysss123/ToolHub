const tools=[
  ['base36-converter','Base36 大整數轉換器','編碼與轉換','BigInt','binary','在十進位與 Base36 之間精確轉換超大型整數，不受 JavaScript 一般 Number 安全範圍限制。','資料庫短 ID、流水號與人工可讀識別碼轉換','Base36 只使用 0–9 與 A–Z，不是加密或雜湊演算法。'],
  ['base62-converter','Base62 文字編解碼工具','編碼與轉換','Base62','circle-dot','使用 0–9、A–Z、a–z 字母表在 UTF-8 文字與 Base62 表示之間雙向轉換。','短網址代碼、識別碼與不含特殊符號的資料表示','Base62 沒有單一國際字母表標準，跨系統交換前需確認順序。'],
  ['ascii85-converter','ASCII85 編解碼工具','編碼與轉換','Base85','braces','將 UTF-8 文字編碼為 Adobe ASCII85，或解碼含有 z 縮寫與可選包圍符號的內容。','PostScript、PDF 資料片段與文字通道中的二進位表示','不同 Base85 方言的字母表與包圍符號不完全相同。'],
  ['byte-endian-converter','Byte Endian 位元組序轉換器','編碼與轉換','Endian','arrow-left-right','依 16、32 或 64 位元字組反轉十六進位位元組順序，顯示 Little Endian 與 Big Endian 對照。','韌體資料、封包、暫存器與二進位檔案分析','轉換只改變位元組順序，不會判斷帶符號數或浮點格式。'],
  ['mac-address-formatter','MAC Address 格式化工具','編碼與轉換','Network ID','ethernet-port','驗證 48 位元 MAC Address，輸出冒號、連字號、Cisco 點號與純十六進位格式。','網路設備清冊、交換器設定與除錯紀錄整理','格式正確不代表位址已分配或目前存在於區域網路。'],
  ['luhn-check-digit-calculator','Luhn 檢查碼計算器','編碼與轉換','Check Digit','credit-card','計算或驗證 Luhn Mod 10 檢查碼，並標示完整數字是否通過校驗。','測試用識別碼、會員編號與採用 Luhn 的資料格式驗證','通過 Luhn 只代表檢查碼正確，不代表帳號真實或有效。'],

  ['csv-transposer','CSV 行列轉置工具','JSON / XML / YAML','Matrix','table','把 CSV 或 TSV 的列轉為欄、欄轉為列，並正確處理引號與空白儲存格。','資料方向調整、問卷結果整理與試算表格式轉換','不規則列會以空白補齊，轉置後應檢查欄位語意。'],
  ['csv-row-filter','CSV 資料列篩選器','JSON / XML / YAML','Data Filter','list-filter','依欄位、文字或數字條件篩選 CSV 資料列，保留標題並輸出新的 CSV。','紀錄篩選、報表切分、測試資料與小型資料集整理','大型資料或複雜條件建議改用資料庫或專業分析工具。'],
  ['json-to-typescript','JSON 轉 TypeScript 型別','JSON / XML / YAML','TypeScript','file-code-2','分析 JSON 物件與陣列，產生 TypeScript Interface，推斷基本型別、巢狀結構與可空值。','API 回應建模、前端型別草稿與文件維護','自動推斷無法得知商業語意，正式使用前應補上聯集與選填規則。'],
  ['json-to-sql-schema','JSON 轉 SQL Schema','JSON / XML / YAML','SQL DDL','database','由 JSON 樣本推斷欄位名稱與 SQL 型別，產生 CREATE TABLE 建表草稿。','原型資料庫、測試資料與匯入流程規劃','單筆樣本無法完整推斷長度、索引、關聯與約束。'],

  ['css-transition-generator','CSS Transition 產生器','Web 開發','Motion','move-right','組合屬性、持續時間、延遲與 Timing Function，產生 Transition CSS 與即時預覽。','按鈕、卡片、選單與介面狀態切換動畫','應尊重 prefers-reduced-motion，避免過長或影響操作的動畫。'],
  ['css-outline-generator','CSS Outline 產生器','Web 開發','Focus Style','scan','設定寬度、樣式、顏色與 Offset，產生不影響盒模型的 CSS Outline。','鍵盤焦點、除錯邊界與無障礙互動提示','移除預設焦點框時必須提供清楚且足夠對比的新樣式。'],
  ['css-mask-generator','CSS Mask 漸層產生器','Web 開發','CSS Mask','blend','產生線性或放射狀 CSS Mask，控制方向、中心、淡出起點與終點。','圖片淡出、捲動邊緣、文字遮罩與裝飾效果','部分舊瀏覽器仍需要 -webkit-mask 相容前綴。'],
  ['object-position-generator','Object Position 產生器','Web 開發','Media Crop','move','調整 object-fit 與水平、垂直位置，產生圖片或影片裁切定位 CSS。','響應式封面、人物焦點保留與媒體卡片','object-position 只有在容器比例與媒體比例不同時才有明顯效果。'],
  ['responsive-srcset-generator','Responsive Srcset 產生器','Web 開發','Responsive Image','images','依檔名樣板、寬度清單與 Sizes 規則產生 img srcset 與 picture HTML。','響應式圖片、效能優化與多尺寸 CDN 資源串接','實際圖片檔必須存在，且應搭配正確 width、height 與壓縮格式。'],
  ['iframe-sandbox-builder','iframe Sandbox 設定器','Web 開發','Embed Security','panels-top-left','選擇允許的 iframe Sandbox 能力、Lazy Loading 與 Permissions Policy，產生嵌入 HTML。','第三方內容、地圖、影片與內部小工具嵌入','allow-scripts 與 allow-same-origin 同時開啟可能削弱隔離效果。'],
  ['aria-label-auditor','ARIA Accessible Name 檢查器','Web 開發','Accessibility','accessibility','解析 HTML 片段，找出缺少可存取名稱的按鈕、連結、輸入框與圖片。','元件開發、Code Review 與無障礙初步稽核','靜態規則無法取代螢幕閱讀器與完整 WCAG 人工測試。'],

  ['http-link-header-builder','HTTP Link 標頭產生器','API / HTTP','RFC 8288','link','組合網址、rel、type、hreflang 與 crossorigin，產生可放入回應的 HTTP Link Header。','資源預載、分頁導覽、Canonical 與 API 關聯連結','Header 長度受伺服器與代理限制，大量連結宜精簡使用。'],
  ['retry-after-calculator','Retry-After 標頭計算器','API / HTTP','Backoff','timer-reset','在延遲秒數與 HTTP 日期格式間轉換，並依指定時間產生 Retry-After Header。','429、503 回應、維護通知與客戶端重試策略','客戶端仍應加入指數退避與隨機抖動，避免同步重試。'],
  ['rate-limit-header-calculator','RateLimit 標頭計算器','API / HTTP','Quota','gauge','依配額、已使用量、視窗長度與重設時間，產生 RateLimit 相關標頭與剩餘比例。','API Gateway、SDK 測試與流量配額文件','不同平台採用的 RateLimit Header 名稱與草案版本可能不同。'],

  ['markdown-outline-generator','Markdown 大綱產生器','文字處理','Document Outline','list-tree','擷取 Markdown ATX 標題，產生縮排大綱與可選的錨點目錄。','README、技術文件、長篇文章與 Wiki 導覽整理','平台對中文與重複標題的錨點規則可能不同。'],
  ['markdown-link-extractor','Markdown 連結擷取器','文字處理','Link Audit','link-2','擷取 Markdown 行內連結、圖片與自動連結，輸出標籤、URL 與類型清單。','文件連結盤點、遷移與內容審核','工具不會連線檢查 URL 是否可用或處理所有擴充語法。'],
  ['text-chunk-splitter','文字分段切塊工具','文字處理','Chunking','scissors-line-dashed','依最大字元數與重疊長度切分文字，優先在段落、句號或空白邊界分段。','LLM Prompt、翻譯批次、字幕與長文件處理','Token 數與字元數不同，送入特定模型前仍需使用對應 Tokenizer。'],
  ['line-numbering-tool','文字行號產生器','文字處理','Line Number','list-ordered','為每一行加入可設定起始值、步進、補零與分隔符號的行號。','程式碼片段、逐行審閱、教學材料與記錄文件','複製結果後行號會成為實際文字，原始內容請另外保留。'],
  ['prefix-suffix-tool','逐行前綴後綴工具','文字處理','Batch Edit','text-cursor-input','批次為非空白或全部文字行加入前綴與後綴，並可跳過已符合條件的內容。','批次引號、清單語法、SQL 片段與路徑整理','工具以行為單位處理，不會解析 CSV 引號或程式語法。'],

  ['code-comment-remover','程式碼註解移除工具','開發工具','Source Cleanup','file-x-2','移除 JavaScript／CSS、HTML 或 Shell／Python 註解，並保留字串與基本換行結構。','程式碼比較、範例精簡與註解量統計','複雜樣板字串、正則字面值或語言方言可能需要專用 Parser。'],
  ['javascript-string-escaper','JavaScript 字串跳脫工具','開發工具','JS String','quote','將任意文字轉成單引號、雙引號或 Template Literal 可使用的 JavaScript 字串。','程式碼產生、測試資料、翻譯字串與範例文件','Template Literal 中的運算式符號會特別跳脫，避免意外執行。'],
  ['shell-argument-escaper','Shell 參數跳脫工具','開發工具','CLI Safety','terminal','將逐行參數轉為 POSIX Shell、PowerShell 或 Windows CMD 可安全貼上的引數字串。','CLI 文件、檔名處理、部署指令與自動化腳本','不同 Shell 的解析規則不同，必須選擇實際執行環境。'],
  ['github-actions-generator','GitHub Actions Workflow 產生器','開發工具','CI Workflow','git-pull-request','依 Node.js 或 Python 專案設定分支、版本、安裝、測試與建置步驟，產生 Workflow YAML。','持續整合起點、專案範本與教學文件','Action 版本與執行環境會更新，正式使用前應檢查官方版本。'],
  ['nginx-config-generator','Nginx 網站設定產生器','開發工具','Web Server','server-cog','產生靜態網站或反向代理 Server Block，包含 Domain、Port、Gzip 與常用安全標頭。','網站上線、內部服務代理與容器設定草稿','部署前必須執行 nginx -t，並依 TLS、路徑與基礎設施調整。'],

  ['ohms-law-calculator','歐姆定律計算器','數學與工程計算','Ohm Law','zap','依電壓、電流、電阻或功率中的兩個已知量，計算其餘電氣參數。','電子電路、電源規劃、維修與基礎教學','計算假設理想直流穩態，實際元件還有溫升、容差與動態特性。'],
  ['voltage-divider-calculator','分壓電路計算器','數學與工程計算','Voltage Divider','git-fork','計算無負載或含負載電阻的分壓輸出、支路電流與電阻功耗。','感測器介面、ADC 輸入、偏壓與電路設計','負載會改變等效下臂電阻，高阻值電路也可能受漏電流影響。'],
  ['led-resistor-calculator','LED 限流電阻計算器','數學與工程計算','LED Circuit','lightbulb','依電源、LED 順向壓降、串聯顆數與目標電流計算建議電阻及功率額定。','指示燈、燈條原型與低功率 LED 電路','高功率 LED 應使用定電流驅動並評估散熱，不宜只靠串聯電阻。'],
  ['resistor-color-code-calculator','電阻色碼計算器','數學與工程計算','Resistor Bands','palette','依四環或五環色碼計算阻值、倍率與容差，並輸出易讀工程單位。','實體電阻辨識、材料整理、維修與電子教學','老化、受熱或色環褪色可能造成誤判，重要元件應使用電表確認。'],
  ['capacitor-code-converter','電容三位數代碼轉換器','數學與工程計算','Capacitor Code','component','在電容三位數代碼與 pF、nF、µF 數值之間轉換，支援常見容差字母。','陶瓷電容辨識、BOM 整理與電路維修','不同封裝可能採用其他標示方式，耐壓資訊通常需另行查詢。'],
  ['battery-runtime-calculator','電池續航時間計算器','數學與工程計算','Battery Runtime','battery-charging','依容量、電壓、負載功率、轉換效率與可用深度估算理想續航時間。','行動裝置、UPS、感測器與離網電源規劃','實際容量會受倍率、溫度、老化與保護電路影響。'],
  ['dc-power-calculator','直流功率與耗能計算器','數學與工程計算','DC Power','plug-zap','依直流電壓、電流與運行時間計算功率、Wh、kWh 與電荷量。','電源供應器、電池、嵌入式設備與能源估算','啟動峰值、待機變化與轉換損失需另外量測或納入。'],
  ['series-parallel-resistance-calculator','串並聯電阻計算器','數學與工程計算','Equivalent Resistance','network','輸入多個電阻值，計算串聯總阻值或並聯等效阻值與各支路比例。','電阻網路、負載配置、原型設計與教學驗算','並聯中任何零歐姆支路都會使理想等效阻值為零。'],
  ['temperature-unit-converter','溫度單位轉換器','數學與工程計算','Temperature','thermometer','在攝氏、華氏、開爾文與蘭金溫標之間精確換算並檢查絕對零度。','工程規格、科學資料、天氣與設備溫度換算','這是溫標換算，不包含感測器誤差或熱力學校正。'],
  ['pressure-unit-converter','壓力單位轉換器','數學與工程計算','Pressure','gauge','在 Pa、kPa、MPa、bar、psi、atm、mmHg 與 Torr 之間換算。','輪胎、流體、氣象、真空與工業規格轉換','表壓與絕對壓是不同基準，換算前必須先確認來源。'],

  ['pert-estimation-calculator','PERT 三點估算計算器','專案與營運規劃','PERT','chart-gantt','依樂觀、最可能與悲觀工期計算 PERT 期望值、標準差與近似信賴範圍。','專案排程、需求估時、風險討論與任務規劃','估算品質取決於輸入假設，任務相依性仍需用排程工具管理。'],
  ['task-priority-scorer','任務優先級評分器','專案與營運規劃','Priority Score','list-checks','綜合影響、急迫性、風險、信心與工作量，產生可比較的任務優先分數。','產品 Backlog、維運工單、內容排程與團隊討論','權重模型只是決策輔助，法規、安全與承諾事項仍需人工優先。'],
  ['pomodoro-session-planner','番茄鐘工作階段規劃器','專案與營運規劃','Focus Plan','timer','依工作量、專注時段、短休息、長休息與週期，估算番茄鐘數量與完成時間。','讀書、寫作、程式開發與深度工作安排','休息與工作長度應依個人狀況調整，不必機械式遵守。'],
  ['time-block-schedule-generator','Time Block 時間區塊產生器','專案與營運規劃','Schedule','calendar-range','依開始、結束、區塊長度、休息與任務清單產生逐時段工作排程。','每日規劃、輪班作業、讀書進度與會議安排','產生器不會檢查外部行事曆衝突，使用前應人工比對。'],
  ['meeting-cost-calculator','會議成本計算器','專案與營運規劃','Meeting Cost','users','依參與人數、平均薪資、會議時間與間接成本率估算單次及年度成本。','會議制度檢討、預算規劃與非同步協作評估','薪資成本不等於會議價值，決策品質與風險降低也應納入判斷。'],
  ['freelance-rate-calculator','接案時薪計算器','專案與營運規劃','Freelance Rate','briefcase-business','依目標年收入、營運費用、可計費時數、稅務緩衝與利潤率估算最低報價時薪。','自由工作者、顧問、工作室與服務定價','稅率與成本結構因地區及個人而異，結果僅供報價規劃。'],
  ['inventory-reorder-point-calculator','庫存再訂購點計算器','專案與營運規劃','Reorder Point','package-search','依平均需求、前置天數與安全庫存計算再訂購點與涵蓋天數。','零售、倉儲、耗材與生產補貨規劃','需求波動、供應中斷與最小訂購量需另外納入。'],
  ['safety-stock-calculator','安全庫存計算器','專案與營運規劃','Safety Stock','warehouse','依需求標準差、平均前置期與服務水準 Z 值估算安全庫存及再訂購點。','供應鏈、零售庫存、備品與服務水準規劃','公式假設需求獨立且近似常態，季節性商品需使用更完整模型。'],
  ['customer-lifetime-value-calculator','顧客終身價值 CLV 計算器','專案與營運規劃','Customer Value','user-round-check','依平均訂單、購買頻率、毛利率、維持年限與取得成本估算顧客終身價值。','行銷預算、會員經營、訂閱服務與客群比較','簡化模型未反映留存曲線、折現率與不同客群行為。'],
  ['sales-commission-calculator','業務佣金計算器','專案與營運規劃','Commission','hand-coins','依銷售額、基本佣金率、門檻、超額獎勵率與固定獎金計算佣金。','業務獎金、代理合作、活動激勵與薪酬試算','實際佣金仍應依合約、退貨、稅務與認列期間核對。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const categories={
  '編碼與轉換':{slider:'slider-enc',color:'purple',existing:true},
  'JSON / XML / YAML':{slider:'slider-json',color:'rose',existing:true},
  'Web 開發':{slider:'slider-web',color:'teal',existing:true},
  'API / HTTP':{slider:'slider-api',color:'amber',existing:true},
  '文字處理':{slider:'slider-text',color:'amber',existing:true},
  '開發工具':{slider:'slider-util',color:'cyan',existing:true},
  '數學與工程計算':{slider:'slider-engineering',color:'sky',existing:false,icon:'calculator'},
  '專案與營運規劃':{slider:'slider-operations',color:'emerald',existing:false,icon:'chart-gantt'}
};

const paletteNames=['cyan','amber','violet','sky','emerald','rose','indigo','teal'];
const layoutNames=['blueprint','compact','aurora','terminal','split','glass','editorial','neon'];
tools.forEach((tool,index)=>{tool.palette=paletteNames[index%paletteNames.length];tool.layout=layoutNames[(index*3+Math.floor(index/8))%layoutNames.length]});
module.exports={tools,categories};
