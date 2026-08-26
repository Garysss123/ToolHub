const tools=[
  ['base32-converter','Base32 編解碼工具','編碼與轉換','RFC 4648','binary','依 RFC 4648 在 UTF-8 文字與 Base32 字串之間雙向轉換，支援自動補位與格式驗證。','API 金鑰、識別碼與純文字資料的 Base32 編解碼','Base32 不是加密技術，不適合用來隱藏機密內容。'],
  ['base58-converter','Base58 編解碼工具','編碼與轉換','Bitcoin Alphabet','coins','使用不易混淆的 Bitcoin Base58 字母表轉換 UTF-8 文字，並正確保留前置零位元組。','區塊鏈識別碼、短字串與人工抄寫友善的資料表示','不同系統可能採用不同 Base58 字母表，交換資料前應確認規格。'],
  ['quoted-printable-converter','Quoted-Printable 編解碼工具','編碼與轉換','Email MIME','mail','將 UTF-8 郵件文字編碼為 Quoted-Printable，或還原等號十六進位與軟換行內容。','Email 原始碼、MIME 內容與舊式郵件系統除錯','解碼結果仍需搭配郵件宣告的 Charset 才能保證字元正確。'],
  ['csv-delimiter-converter','CSV／TSV 分隔符號轉換器','編碼與轉換','CSV / TSV','table-properties','在 CSV、TSV 與自訂分隔格式間安全轉換，正確處理雙引號、換行及欄位內分隔符號。','試算表匯出、資料庫匯入與不同系統間的表格交換','來源資料若使用非標準跳脫方式，應先確認引號與換行規則。'],
  ['svg-data-uri-converter','SVG Data URI 轉換器','編碼與轉換','SVG / URI','image-up','將 SVG 原始碼轉為百分比或 Base64 Data URI，也可反向還原成可下載的 SVG 檔案。','CSS 背景、HTML 內嵌圖示與單檔網頁資源整理','大型 SVG 直接內嵌會增加 HTML 或 CSS 體積，應衡量快取需求。'],

  ['css-box-model-calculator','CSS Box Model 計算器','Web 開發','Layout','square-dashed','依內容尺寸、Padding、Border、Margin 與 box-sizing 設定，計算元素實際邊框與版面佔用尺寸。','還原設計稿尺寸、排查元素溢位與理解 CSS 盒模型','Transform、Outline 與陰影不會計入一般文件流尺寸。'],
  ['css-triangle-generator','CSS 三角形產生器','Web 開發','CSS Shape','triangle','設定方向、底邊、高度與顏色，即時產生純 Border 技巧的 CSS 三角形與預覽。','提示箭頭、下拉選單指示器、對話框尖角與裝飾圖形','Border 三角形沒有實際內容寬高，互動區域需由外層元素負責。'],
  ['css-scroll-snap-generator','CSS Scroll Snap 產生器','Web 開發','Scroll UX','gallery-horizontal-end','組合捲動方向、吸附強度、項目對齊與內距，產生可直接使用的 Scroll Snap CSS。','橫向卡片、相簿、教學步驟與行動版滑動介面','強制吸附可能影響長內容的可達性，實作後應以鍵盤與觸控測試。'],
  ['media-query-range-generator','Media Query 範圍產生器','Web 開發','Responsive','panel-top','依最小與最大寬度產生現代 Range Syntax 或傳統 min-width／max-width 響應式查詢。','元件斷點、裝置區間樣式與漸進式響應設計','現代範圍語法在較舊瀏覽器可能不受支援，可改用傳統語法。'],
  ['html-table-generator','HTML 表格產生器','Web 開發','Semantic HTML','table-2','將 CSV、TSV 或自訂分隔資料轉為語意化 thead 與 tbody HTML 表格，並安全跳脫內容。','文件表格、後台資料展示與靜態報表製作','大量資料應考慮分頁、虛擬捲動與無障礙 Caption。'],

  ['accept-header-builder','HTTP Accept 標頭產生器','API / HTTP','Content Negotiation','list-filter','設定主要媒體格式、品質權重與備援格式，產生符合內容協商用途的 Accept Header。','REST API 測試、圖片格式協商與多格式端點請求','q 權重只表達偏好，伺服器仍可能依自身能力回傳其他格式。'],
  ['content-disposition-generator','Content-Disposition 標頭產生器','API / HTTP','RFC 5987','file-down','產生 attachment 或 inline Content-Disposition，兼顧 ASCII 備援與 UTF-8 中文檔名。','下載端點、報表匯出與瀏覽器內顯示檔案','實際檔名仍可能受瀏覽器與作業系統的安全規則調整。'],
  ['oauth-pkce-generator','OAuth PKCE 參數產生器','API / HTTP','RFC 7636','key-square','使用瀏覽器密碼學安全亂數與 SHA-256，產生 OAuth 2.0 Code Verifier 與 Code Challenge。','SPA、行動應用與無法安全保存 Client Secret 的 OAuth 流程','Code Verifier 必須在交換 Token 前安全保存於目前授權流程。'],
  ['dns-record-parser','DNS 記錄解析器','API / HTTP','Zone Data','network','解析常見 DNS Zone 記錄為結構化 JSON，支援 A、AAAA、CNAME、MX、TXT、NS、CAA 等類型。','DNS 遷移盤點、設定檢查與紀錄格式整理','這是文字解析工具，不會連線查詢即時 DNS 或驗證權威結果。'],
  ['http-auth-header-generator','HTTP 驗證標頭產生器','API / HTTP','Auth Header','shield-keyhole','快速產生 Bearer Token、Basic Auth 或自訂 API Key Header，並處理 UTF-8 Basic 憑證編碼。','API 測試、文件範例與除錯請求標頭','產生的憑證文字屬敏感資料，不應貼入公開紀錄或版本控制。'],

  ['ini-json-converter','INI／JSON 雙向轉換器','JSON / XML / YAML','Config','file-cog','在常見 INI 區段與 JSON 物件之間雙向轉換，辨識數字、布林值與一般字串。','應用程式設定遷移、環境配置整理與文件範例','進階 INI 方言可能包含陣列、繼承或重複鍵，轉換前應確認規格。'],
  ['json-array-sorter','JSON 陣列排序器','JSON / XML / YAML','JSON Array','arrow-down-wide-narrow','依巢狀欄位路徑，以數字、文字或日期方式排序 JSON 陣列，且不修改原始輸入。','API 回應整理、測試資料排序與靜態資料維護','欄位缺漏或型別混合時，應先統一資料結構再排序。'],
  ['json-key-case-converter','JSON 鍵名命名轉換器','JSON / XML / YAML','Key Naming','braces','遞迴將 JSON 鍵名轉成 camelCase、snake_case、kebab-case 或 PascalCase。','前後端資料契約、API 欄位遷移與跨語言模型轉換','不同原始鍵可能轉成相同名稱，正式替換前應檢查碰撞。'],
  ['xml-escape-converter','XML 特殊字元跳脫工具','JSON / XML / YAML','XML Entity','code-xml','在一般文字與 XML Entity 之間轉換，支援五個預定義實體及十進位、十六進位字元參照。','XML 節點內容、屬性值、SOAP 與設定檔處理','跳脫字元不等於驗證完整 XML 結構，仍需搭配 Parser 檢查。'],
  ['csv-to-sql-insert','CSV 轉 SQL INSERT 產生器','JSON / XML / YAML','Data Import','database-backup','把 CSV 標題與資料列轉成批次 SQL INSERT，處理 NULL、數字、布林值與單引號跳脫。','資料庫種子資料、測試環境匯入與小型資料搬遷','執行產生的 SQL 前，應確認資料型別、欄位名稱與交易策略。'],

  ['email-extractor','Email 地址擷取器','文字處理','Pattern Extract','at-sign','從文章、HTML 或紀錄文字中擷取 Email 地址，可去除重複並依字母排序。','聯絡資料整理、內容稽核與測試樣本建立','正則擷取無法確認信箱是否存在，也不應用於未經同意的行銷。'],
  ['url-extractor','網址連結擷取器','文字處理','URL Extract','link-2','從混合文字中擷取 HTTP、HTTPS 與選用的 www 網址，並移除常見尾端標點。','文章連結盤點、遷移檢查與紀錄檔分析','複雜括號或非標準網址可能需要人工確認邊界。'],
  ['number-extractor','文字數字擷取器','文字處理','Number Extract','list-plus','依需求從文字擷取負數、小數與千分位數字，並提供總和與平均值摘要。','報表初步整理、收據文字檢查與紀錄數值盤點','工具不會判斷幣別、百分比或單位，統計前應確認數值語意。'],
  ['text-wrapper','文字自動換行工具','文字處理','Line Wrap','wrap-text','依 Unicode 字元或英文單字設定每行長度，自動整理長文字並選擇是否保留原始換行。','純文字文件、程式碼註解、終端顯示與固定寬度內容','等寬顯示中的全形字元可能佔兩格，字元數不一定等同視覺寬度。'],
  ['whitespace-visualizer','空白字元視覺化工具','文字處理','Whitespace','space','將空格、Tab、換行與不換行空格轉成可見符號，同時統計各類空白數量。','排查縮排、尾端空白、貼上格式與資料清理問題','視覺符號只用於檢查，複製結果前應確認是否需要還原。'],
  ['list-merger','清單合併與集合工具','文字處理','Set Operations','list-collapse','對兩份逐行清單執行聯集、交集、差集或逐列配對，並可控制英文大小寫比較。','名單比對、權限清冊、標籤合併與資料去重','逐列配對依輸入順序處理，不會自動尋找相似項目。'],
  ['levenshtein-distance-calculator','Levenshtein 文字距離計算器','文字處理','Edit Distance','between-horizontal-start','計算兩段 Unicode 文字所需的最少插入、刪除與替換次數，並換算直觀相似度。','拼字比對、名稱去重、搜尋提示與測試結果比較','長篇文字的運算量會隨兩邊長度相乘，適合短至中型內容。'],

  ['git-command-builder','Git 指令產生器','開發工具','Git Workflow','git-branch-plus','依 Clone、分支、Commit、Rebase、Tag 或 Cherry Pick 操作產生已處理引號的 Git 指令。','日常版本控制、教學文件與減少參數輸入錯誤','執行前仍應確認目前分支、工作目錄與遠端狀態。'],
  ['dockerfile-generator','Dockerfile 產生器','開發工具','Container','container','依 Node.js、Python、PHP 或 Nginx 靜態網站需求，產生可調整版本與 Port 的 Dockerfile。','建立專案容器起點、測試環境與部署範本','正式映像仍需加入鎖定版本、健康檢查、祕密管理與漏洞掃描。'],
  ['package-json-generator','package.json 產生器','開發工具','npm','package-plus','設定 npm 套件名稱、版本、模組類型、Scripts 與 Dependencies，產生格式正確的 package.json。','前端專案初始化、套件範例與教學文件','使用 latest 版本會隨時間變動，正式專案建議建立並提交 Lockfile。'],

  ['descriptive-statistics-calculator','敘述統計計算器','資料分析與統計','Statistics','chart-no-axes-combined','一次計算數量、總和、平均、中位數、四分位數、變異數與標準差，支援樣本及母體模式。','問卷、實驗、營運指標與資料品質的快速摘要','極端值可能顯著影響平均與標準差，解讀時應搭配分布檢查。'],
  ['weighted-average-calculator','加權平均計算器','資料分析與統計','Weighted Mean','scale','輸入對應的數值與權重，計算標準化後的加權平均與權重總和。','成績計算、投資組合、供應商評分與指標彙整','每個數值必須有對應權重，且權重總和不可為零。'],
  ['percent-change-calculator','百分比變化與差異計算器','資料分析與統計','Percentage','percent','計算新舊值的百分比變化，或兩個數值之間不分基準方向的百分比差異。','營收成長、效能比較、價格變動與實驗結果摘要','百分比變化以原始值為基準，原始值為零時沒有有限結果。'],
  ['percentile-calculator','百分位數計算器','資料分析與統計','Percentile','chart-spline','將數值排序後，以線性插值計算指定的第 0 到第 100 百分位數。','延遲分布、考試成績、服務水準與資料門檻分析','不同統計軟體可能採用不同百分位定義，正式報告需註明方法。'],
  ['z-score-calculator','Z 分數計算器','資料分析與統計','Standard Score','sigma','依觀測值、平均數與標準差計算 Z Score，並可估算標準常態累積百分位。','異常值初篩、測驗標準化與不同尺度資料比較','常態百分位只有在分布假設合理時才適合解讀。'],
  ['correlation-calculator','Pearson 相關係數計算器','資料分析與統計','Correlation','git-compare','計算兩組等長數列的 Pearson r，並提供相關方向與強度的簡要判讀。','指標關聯探索、實驗分析與資料品質檢查','相關不代表因果，且 Pearson 係數對非線性關係與極端值較敏感。'],
  ['linear-regression-calculator','一元線性迴歸計算器','資料分析與統計','Regression','trending-up','由成對 X、Y 數值計算最小平方法斜率、截距、R² 與指定 X 的預測值。','趨勢估算、校正線、簡單預測與教學驗算','超出觀測範圍的外插預測風險較高，且不代表因果關係。'],
  ['confidence-interval-calculator','平均數信賴區間計算器','資料分析與統計','Confidence Interval','brackets','依樣本平均、標準差、樣本數與信賴水準，使用常態近似估算平均數信賴區間。','報表誤差範圍、抽樣研究與 A/B 測試初步摘要','小樣本或非常態資料宜改用 t 分布或其他適當方法。'],
  ['sample-size-calculator','比例調查樣本數計算器','資料分析與統計','Survey Planning','users-round','依信心水準、允許誤差、預估比例與有限母體校正，估算比例調查所需樣本數。','問卷規劃、民調抽樣與品質抽查設計','此公式假設簡單隨機抽樣，分層或群集設計需加入設計效應。'],
  ['permutation-combination-calculator','排列組合計算器','資料分析與統計','Combinatorics','shapes','以 BigInt 精確計算排列 P(n,r)、組合 C(n,r) 與可重複組合 H(n,r)。','機率題、測試案例數量、選項配置與演算法分析','極大輸入會產生非常長的整數，顯示與複製可能需要較多資源。'],

  ['profit-margin-calculator','利潤率與加成率計算器','商務與生活計算','Margin','badge-dollar-sign','由營收、成本與銷售數量計算毛利、毛利率、成本加成率及每單位毛利。','商品定價、營運報表、接案估價與方案比較','結果未自動拆分稅額、折舊與間接成本，輸入時應保持口徑一致。'],
  ['break-even-calculator','損益兩平計算器','商務與生活計算','Break Even','split','依固定成本、單位售價、變動成本與目標利潤，估算兩平與目標銷售量。','新產品評估、活動預算、訂閱方案與產能規劃','模型假設售價與變動成本固定，實際情境可能存在階梯價格。'],
  ['compound-interest-calculator','複利與定期投入計算器','商務與生活計算','Compound Growth','landmark','計算初始本金、年利率、複利頻率與每月投入在指定期間後的預估終值。','長期儲蓄、投資情境與複利效果比較','試算未納入稅費、通膨、波動與實際投入時點差異，不構成投資建議。'],
  ['loan-payment-calculator','貸款月付與總利息計算器','商務與生活計算','Amortization','hand-coins','以本息平均攤還公式估算每月付款、總利息與額外還款後的預計還清時間。','房貸、車貸、設備貸款與提前還款情境比較','實際貸款可能含手續費、寬限期、浮動利率與提前清償條款。'],
  ['discount-calculator','折扣與最終價格計算器','商務與生活計算','Discount','tags','整合百分比折扣、折價券與稅率，計算最終價格、節省金額與實際折讓比例。','購物比價、促銷規劃、報價單與預算控制','折扣與稅額的先後順序可能依地區或商家規則不同。'],
  ['unit-price-calculator','單位價格比較器','商務與生活計算','Unit Price','scale-3d','比較兩個不同價格與容量的商品單位成本，顯示價差與相對節省比例。','食品、耗材、訂閱額度與包裝規格比價','比較前應確認容量單位、品質與有效內容物相同。'],
  ['electricity-cost-calculator','設備用電成本計算器','商務與生活計算','Energy Cost','plug-zap','依設備功率、使用時數、天數、數量與每度電費估算耗電量、成本與參考碳排。','電腦、伺服器、家電與工作室營運成本評估','碳排係數僅供參考，實際電價與排放會隨地區、級距和時段改變。'],
  ['fuel-cost-calculator','行程燃料成本計算器','商務與生活計算','Trip Cost','fuel','依距離、平均油耗、油價、通行成本與分攤人數計算用油與每人交通成本。','自駕旅行、通勤、物流報價與共乘費用估算','塞車、載重、路況與駕駛方式都可能使實際油耗不同。'],
  ['work-hours-calculator','工時與薪資計算器','商務與生活計算','Timesheet','clock-4','依上下班時間、休息分鐘、工作天數與時薪計算每日工時、總工時及估算金額，支援跨午夜班次。','排班、接案計時、工時表與薪資初步核對','加班、休假與法定工時計算依制度而異，本工具僅提供時間算術。'],
  ['roi-calculator','投資報酬率 ROI 計算器','商務與生活計算','ROI','chart-candlestick','由初始投資、總收益、額外成本與期間計算淨收益、ROI、回收倍數及年化報酬率。','專案評估、行銷活動、設備採購與商業方案比較','年化計算假設報酬平滑複利，未反映現金流時間與風險。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const categories={
  '編碼與轉換':{slider:'slider-enc',color:'purple',label:'編碼轉換',existing:true},
  'Web 開發':{slider:'slider-web',color:'teal',label:'Web 開發',existing:true},
  'API / HTTP':{slider:'slider-api',color:'amber',label:'API / HTTP',existing:true},
  'JSON / XML / YAML':{slider:'slider-json',color:'rose',label:'資料格式',existing:true},
  '文字處理':{slider:'slider-text',color:'amber',label:'文字處理',existing:true},
  '開發工具':{slider:'slider-util',color:'cyan',label:'開發工具',existing:true},
  '資料分析與統計':{slider:'slider-stats',color:'indigo',label:'資料分析',existing:false,icon:'chart-no-axes-combined'},
  '商務與生活計算':{slider:'slider-business',color:'emerald',label:'商務計算',existing:false,icon:'calculator'}
};

const paletteNames=['violet','sky','teal','amber','rose','emerald','indigo','cyan'];
const layoutNames=['aurora','split','blueprint','terminal','glass','editorial','neon','compact'];
tools.forEach((tool,index)=>{
  tool.palette=paletteNames[(index+3)%paletteNames.length];
  tool.layout=layoutNames[(index*5+Math.floor(index/7))%layoutNames.length];
});

module.exports={tools,categories};
