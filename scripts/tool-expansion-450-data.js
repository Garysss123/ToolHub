const tools=[
  ['gettext-po-catalog-auditor','Gettext PO 翻譯目錄稽核器','字型與國際化','PO Catalog','languages','解析 Gettext PO／POT 目錄，檢查未翻譯、Fuzzy、複數缺漏、重複 Msgid 與 Placeholder 不一致。','軟體在地化、翻譯交付、Release QA 與多語內容維護','工具採常見 PO 語法進行靜態檢查，複雜自訂旗標與專案專屬規則仍需人工複核。'],
  ['elf-header-inspector','ELF 執行檔標頭檢視器','檔案與資料格式','ELF Binary','file-search','在瀏覽器解析 ELF32／ELF64 的位元序、ABI、檔案型別、CPU 架構、Entry Point 與 Table Offset。','Linux 執行檔、共享函式庫、韌體分析、交叉編譯與檔案鑑識','此工具只讀取 ELF Header 與基礎欄位，不會反組譯程式碼或判定檔案是否安全。'],
  ['unicode-line-break-inspector','Unicode 換行機會檢視器','字型與國際化','Line Breaking','pilcrow','逐字標示空白、標點、CJK、連字號、結合字元與強制換行，預覽可換行與禁止換行位置。','多語排版、字幕、電子書、窄欄 UI 與文字渲染除錯','結果依常見 Unicode Line Breaking 類別近似呈現，瀏覽器實際斷行仍受字型與 CSS 影響。'],
  ['sqlite-file-header-inspector','SQLite 資料庫檔頭檢視器','檔案與資料格式','SQLite Header','database','解析 SQLite Database Header 的頁面大小、格式版本、頁數、文字編碼、Schema Cookie 與版本欄位。','資料庫檔案鑑識、備份檢查、App 資料除錯、數位保存與格式教學','此工具只讀取檔頭，不會執行 SQL、修復資料庫或解析資料頁內容。'],
  ['file-entropy-map','檔案熵值熱圖','檔案與資料格式','Binary Entropy','chart-no-axes-combined','依固定區塊計算檔案 Shannon Entropy，顯示高低熵區段、分布熱圖與可匯出摘要。','壓縮檔辨識、韌體檢查、二進位鑑識與異常區段定位','高熵可能代表壓縮、加密或隨機資料，不能單獨當成惡意檔案判定。'],
  ['duplicate-file-finder','本機重複檔案比對器','檔案與資料格式','Local Dedup','files','以檔案大小與 SHA-256 在本機分組完全相同的多個檔案，計算可回收容量並產生清冊。','照片整理、下載資料夾清理、交付檔盤點與備份檢查','工具只產生比對報告，不會刪除或移動檔案；同內容不同編碼不會視為重複。'],
  ['sprite-sheet-slicer','Sprite Sheet 切片工作台','視覺與影像處理','Sprite Slicing','grid-3x3','依列欄、邊距與間距切分 Sprite Sheet，預覽各影格並產生 Atlas 座標資料。','遊戲素材、像素動畫、Icon 圖集與前端資產整理','自動網格適合規則排列，非規則 Atlas 仍需逐格調整座標。'],
  ['image-difference-heatmap','圖片差異熱圖','視覺與影像處理','Pixel Diff','scan-eye','對齊兩張圖片後逐像素比較，產生差異率、變更區域與可調容差熱圖。','視覺回歸、截圖比對、設計驗收與壓縮品質檢查','圖片尺寸或對齊方式不同會放大差異，判讀前應先確認基準一致。'],
  ['contact-sheet-maker','圖片聯絡表製作器','視覺與影像處理','Contact Sheet','layout-grid','將多張本機圖片依指定欄數、尺寸、間距與檔名標籤排成可列印聯絡表。','攝影挑片、素材索引、交付預覽、分鏡盤點與檔案清冊','大量高解析圖片會占用較多瀏覽器記憶體，建議分批建立聯絡表。'],
  ['video-frame-extractor','影片影格擷取工作台','媒體與交換格式','Frame Capture','film','載入本機影片並按間隔或指定時間擷取影格，產生縮圖、Timecode 與聯絡表。','影片取樣、縮圖製作、內容審查、分鏡參考與問題回報','可讀取格式取決於瀏覽器解碼能力，受 DRM 保護影片無法處理。'],

  ['chordpro-chart-transposer','ChordPro 和弦譜移調器','媒體與交換格式','ChordPro','music-2','解析 ChordPro 行內和弦與指令，依半音移調並保留歌詞位置、Slash Chord 及樂譜結構。','樂團排練、歌手換 Key、敬拜歌曲、音樂教學與和弦譜整理','工具使用十二平均律音名，特殊調弦、微分音與複雜和弦拼法仍需樂手複核。'],
  ['rhythm-pattern-sequencer','節奏步進編曲器','媒體與交換格式','Step Sequencer','audio-waveform','以步進格線安排鼓點、速度與 Swing，預覽節拍並匯出 Pattern JSON。','節奏草稿、音樂教學、遊戲音效原型與練習伴奏','瀏覽器計時適合預覽，不應取代需要取樣精度的專業 DAW。'],
  ['image-measurement-overlay','圖片比例尺與量測標註','視覺與影像處理','Image Measure','ruler','以已知比例校正圖片，在畫面上量測長度、角度並輸出含標註的預覽。','產品照片、平面圖、顯微影像、施工紀錄與尺寸溝通','結果取決於比例校正與透視角度，不能取代正式測量儀器。'],
  ['app-icon-mask-preview','App 圖示遮罩預覽器','視覺與影像處理','Icon Mask','app-window','將圖示套用圓形、圓角方形與 Squircle 等遮罩，檢查安全區及多尺寸辨識度。','App Icon、PWA、桌面程式、品牌資產與上架前檢查','平台遮罩可能隨系統版本調整，正式提交仍應依平台最新規範複核。'],
  ['intel-hex-memory-map','Intel HEX 記憶體映射分析器','檔案與資料格式','Intel HEX','memory-stick','解析 Intel HEX Record、Extended Address 與 Checksum，整理實際位址範圍、間隙、重疊及 Entry Point。','微控制器韌體、燒錄檔檢查、Bootloader 除錯、嵌入式教學與版本 QA','工具不會反組譯機器碼或寫入硬體，位址有效性仍需對照目標晶片記憶體配置。'],
  ['ruby-annotation-editor','注音標註 Ruby 編輯器','字型與國際化','Ruby Text','spell-check-2','將本文與讀音配對成語意化 Ruby HTML，提供上下標位置、字級與即時排版預覽。','日文假名、中文注音、語言教材、姓名讀音與內容出版','不同瀏覽器與字型的 Ruby 間距略有差異，正式版面應在目標裝置檢查。'],
  ['vertical-writing-preview-studio','直排文字預覽工作室','字型與國際化','Vertical Type','align-horizontal-space-around','以 Writing Mode、Text Orientation、行距與欄高預覽中文、日文直排版面並產生 HTML／CSS。','電子書、詩詞、展覽標示、東亞語排版、海報與內容設計','實際字形旋轉與標點位置取決於瀏覽器及字型的垂直排版支援。'],
  ['protobuf-wire-decoder','Protocol Buffers Wire 解碼器','資料結構與驗證','Protobuf Wire','binary','從 Hex 或 Base64 解析 Protobuf Field Number、Wire Type、Varint、Fixed 與 Length-delimited 原始內容。','API 封包除錯、逆向格式確認、Log 分析、測試 Fixture 與協定教學','沒有 .proto Schema 時無法得知欄位名稱與確切型別，Length-delimited 內容只做安全推測。'],
  ['locale-fallback-simulator','語系回退路徑模擬器','字型與國際化','Locale Fallback','route','正規化 BCP 47 Language Tag，依支援清單模擬 Lookup、逐層回退與最終匹配結果。','網站語言切換、App 在地化、Accept-Language 除錯與翻譯資源選擇','簡化 Lookup 不等同所有框架的 Best Fit 演算法，應對照實際產品設定。'],
  ['variable-font-axis-playground','可變字型軸線試玩台','字型與國際化','Variable Font','sliders-horizontal','讀取 SFNT TTF／OTF 可變字型的 fvar Axis，或使用內建示範軸線調整 Weight、Width 並產生 CSS。','品牌字型、動態排版、Design System、桌面字型評估與字型 QA','目前僅解析 TTF／OTF 的 SFNT Table Directory，不支援 WOFF／WOFF2 容器；部分自訂 Axis 仍需對照字型文件。'],

  ['typography-scale-designer','排版比例尺設計器','字型與國際化','Type Scale','type','依基準字級、比例、行高與斷點建立標題到內文的完整排版預覽與 Design Tokens。','網站排版、Design System、簡報模板、內容平台與響應式設計','數學比例只是起點，實際層級仍需依字型、語言與內容密度調整。'],
  ['sql-set-operation-simulator','SQL 集合運算模擬器','資料結構與驗證','Set Operations','combine','以兩組資料模擬 UNION、UNION ALL、INTERSECT 與 EXCEPT，呈現重複值保留規則。','SQL 教學、查詢設計、資料合併驗證與邊界案例測試','不同資料庫對 NULL、型別轉換與排序的細節可能不同，正式查詢需在目標資料庫測試。'],
  ['data-quality-rule-builder','資料品質規則工作台','資料結構與驗證','Quality Rules','list-checks','以 Required、型別、範圍、Regex、唯一值等規則檢查 CSV，輸出逐列違規與規則 JSON。','資料匯入、ETL、名單清理、營運報表與 Data Contract 前置檢查','規則只能反映已設定的條件，不能自動理解完整業務語意。'],
  ['schema-drift-comparator','資料結構漂移比較器','資料結構與驗證','Schema Drift','git-compare-arrows','比較兩批 JSON 樣本的路徑、型別與出現率，找出欄位新增、移除及不相容變化。','API 版本升級、事件資料、ETL 監控、資料合約與回歸測試','樣本推斷不等同正式 Schema，低頻欄位可能因抽樣而被誤判為移除。'],
  ['data-lineage-canvas','資料血緣流程畫布','圖表與流程建模','Data Lineage','workflow','以來源、轉換、儲存與消費節點建立資料流向圖，檢查循環並輸出 Mermaid。','資料平台文件、ETL 設計、責任盤點、稽核與系統遷移','工具描述邏輯血緣，不會自動連線掃描實際資料庫或雲端服務。'],
  ['database-index-prefix-planner','資料庫複合索引前綴規劃器','資料結構與驗證','Index Prefix','list-tree','依查詢的等值、範圍、排序與選取欄位評估複合索引 Leftmost Prefix、排序覆蓋與候選順序。','SQL 效能設計、Schema Review、慢查詢改善、索引教學與遷移規劃','結果是一般 B-tree 規劃提示，實際最佳索引仍受資料分布、資料庫版本與執行計畫影響。'],
  ['database-normalization-workbench','資料庫正規化工作台','資料結構與驗證','Normalization','database','依 Attributes、候選鍵與 Functional Dependencies 檢查 Partial／Transitive Dependency 與 BCNF。','關聯模型設計、資料庫教學、Schema Review 與重構規劃','自動建議是結構分析草稿，實際分解還需考量查詢效能與業務一致性。'],
  ['sankey-flow-diagram-maker','Sankey 流向圖製作器','圖表與流程建模','Sankey Flow','chart-spline','將 Source、Target、Value 表格轉為節點與加權流線，產生可縮放 SVG 預覽。','預算流向、能源、轉換漏斗、供應鏈、使用者旅程與資料流量','負值與循環流需要專門布局策略，本工具以非負流程資料為主。'],
  ['promise-combinator-simulator','Promise 組合器模擬器','Web 開發','Promise Lab','timer-reset','以 Resolve／Reject 與完成時間模擬 Promise.all、allSettled、race、any 的時序與結果。','JavaScript 教學、非同步流程設計、錯誤處理與測試案例','模擬器使用確定性時間軸，不包含真實網路、Event Loop 壅塞或取消訊號。'],
  ['sequence-diagram-workbench','時序圖工作台','圖表與流程建模','Sequence Diagram','milestone','依參與者、訊息、回應與註解建立時序圖，輸出 SVG 與 Mermaid 語法。','API 設計、登入流程、系統整合、事件溝通與技術文件','複雜 Fragment 與自訂 Mermaid 主題可能需要在專用繪圖工具進一步調整。'],

  ['service-worker-cache-simulator','Service Worker 快取策略模擬器','Web 協定與政策','Cache Strategy','database-zap','模擬 Cache First、Network First、Stale While Revalidate 等策略在連線與快取狀態下的流程。','PWA、離線頁面、前端效能、Service Worker 教學與錯誤情境設計','此工具不會註冊真實 Service Worker，結果仍需在目標網站與瀏覽器驗證。'],
  ['cookie-samesite-simulator','Cookie SameSite 傳送情境模擬器','Web 協定與政策','SameSite','cookie','依 SameSite、Secure、Domain、請求方法、頂層導覽與跨站情境判斷 Cookie 是否傳送。','登入流程、OAuth、嵌入內容、CSRF 防護與 Cookie 除錯','站點判定以常見 Host 規則近似，Public Suffix 與瀏覽器政策差異仍需實機測試。'],
  ['mime-multipart-builder','MIME Multipart 訊息產生器','Web 協定與政策','MIME Multipart','mail-plus','依 Boundary、Subtype 與多個 Part 產生符合 CRLF 的 Multipart Body、Header 與長度摘要。','Email、multipart/form-data、API 測試、Webhook 範例與協定教學','二進位附件需先使用 Base64，正式傳輸仍需由目標 Client 正確計算 Content-Length。'],
  ['webrtc-sdp-session-inspector','WebRTC SDP 連線描述檢視器','Web 協定與政策','WebRTC SDP','radio-tower','解析 SDP Offer／Answer 的 Media、Codec、ICE、Fingerprint、Direction、Candidate 與 BUNDLE。','視訊會議、WebRTC 除錯、Codec 協商、網路問題回報與教學','工具只做文字解析，不會建立 PeerConnection 或驗證 ICE Server 可達性。'],
  ['api-contract-example-matrix','API Contract 範例覆蓋矩陣','Web 協定與政策','API Examples','table-2','盤點 API Operation 各回應狀態是否具有 Example，建立成功、驗證、授權與錯誤案例矩陣。','OpenAPI 文件、Mock Server、契約測試、QA 規劃與前後端協作','矩陣檢查範例覆蓋，不會驗證範例是否完全符合外部 Schema Reference。'],
  ['source-map-explorer','JavaScript Source Map 瀏覽器','開發工具','Source Map','map','解析 Source Map VLQ Mappings，查詢 Bundle 行列對應的原始檔案、行列與內嵌來源。','前端除錯、錯誤定位、Bundle 稽核、Sourcemap QA 與上線調查','壓縮器產生的 Name Mapping 與 Sectioned Map 可能需要更完整的 Source Map 實作。'],
  ['software-license-compatibility-matrix','軟體授權相容性矩陣','部署與開發工作流','License Matrix','scale','依輸出授權與相依套件授權建立相容、條件式、衝突及未知矩陣，列出主要義務。','開源治理、套件選型、Release Review、SBOM 審查與法遵溝通','結果是一般性工程提示而非法律意見，正式散布前應由合格人員審查授權全文。'],
  ['git-history-graph','Git 提交歷史圖','部署與開發工作流','Commit Graph','git-branch','將結構化 Git Log 轉成 Commit DAG、Branch／Tag 標記、作者時間軸與可搜尋摘要。','Code Review、Release 回顧、分支教學、事故調查與專案交接','工具不會讀取本機 Repository，需先以指定格式貼入 Git Log。'],
  ['incident-timeline-workbench','事故事件時間軸工作台','專案與營運規劃','Incident Timeline','siren','整理事故時間、嚴重度、事件、證據與負責人，計算資訊缺口並產生 Markdown 時間軸。','Incident Response、Postmortem、維運交接、稽核與客戶說明','時間軸完整度取決於輸入紀錄，正式報告仍應保留原始 Log 與證據。'],
  ['process-swimlane-designer','跨部門泳道流程設計器','圖表與流程建模','Swimlane','between-horizontal-end','依角色泳道、步驟、決策與交接關係產生 SVG 流程圖與結構化 JSON。','SOP、跨部門流程、服務藍圖、內控文件與系統導入','自動布局適合中小型流程，大型流程建議拆成多張圖以維持可讀性。'],

  ['requirements-traceability-matrix','需求追蹤矩陣','專案與營運規劃','Traceability','table-properties','將需求、測試與交付證據建立 Coverage Matrix，找出未驗證需求與孤立測試。','軟體 QA、驗收、合規專案、系統導入與 Release Gate','矩陣只能確認連結存在，不能取代測試內容與證據品質審查。'],
  ['survey-skip-logic-designer','問卷跳題邏輯設計器','圖表與流程建模','Survey Logic','split','建立問題、選項與 Next Rule，模擬回答路徑並找出循環、死路與不可達題目。','問卷研究、表單 UX、資格篩選、訪談流程與測試案例','工具不會評估問題措辭偏誤，正式研究仍需進行預試與倫理審查。'],
  ['raci-matrix-workspace','RACI 權責矩陣工作台','專案與營運規劃','RACI Matrix','users-round','以任務與角色建立 RACI 矩陣，檢查缺少 Responsible、無或多個 Accountable 等問題。','專案治理、跨部門協作、流程責任、交接與稽核準備','RACI 描述角色責任，不代表實際資源容量或決策授權已完成確認。'],
  ['customer-journey-map','顧客旅程地圖工作台','圖表與流程建模','Journey Map','map-pinned','依階段、接觸點、情緒、痛點與機會建立旅程格線及情緒曲線。','UX 研究、客服改善、行銷漏斗、服務設計與產品策略','旅程地圖是研究資料的摘要，不能以團隊猜測取代真實使用者訪談。'],
  ['meeting-agenda-timekeeper','會議議程計時工作台','專案與營運規劃','Agenda Timer','timer','依議程段落、預定分鐘、主持人與已用時間計算目前進度、超時與更新後時程。','會議主持、Workshop、設計評審、每日站會與培訓活動','瀏覽器背景分頁可能降低計時更新頻率，重要場合應搭配正式計時設備。'],
  ['risk-register-heatmap','風險登錄與熱圖工作台','專案與營運規劃','Risk Heatmap','grid-2x2-check','依機率、影響、負責人與緩解措施建立風險分數、5×5 熱圖及優先清單。','專案管理、資訊安全、供應鏈、營運持續與內控追蹤','分數是排序輔助，重大風險仍應以組織方法、專業判斷與證據評估。'],
  ['research-evidence-matrix','研究證據矩陣','專案與營運規劃','Evidence Matrix','book-open-check','連結主張、來源、支持方向與品質，找出缺少證據或僅有單一來源的結論。','研究報告、政策分析、內容查核、文獻回顧與決策簡報','工具不會查證來源真偽，品質評分與引用內容仍需由研究者審核。'],
  ['user-story-map-board','使用者故事地圖','圖表與流程建模','Story Map','layout-dashboard','按使用者活動、工作、Release 與優先度排列 Story Map，呈現版本切片及缺漏。','產品規劃、敏捷工作坊、MVP 範圍、跨團隊溝通與 Roadmap','Story Map 用於對齊脈絡，不應取代需求驗證、容量評估與技術設計。'],
  ['seating-chart-designer','座位配置圖設計器','專案與營運規劃','Seating Plan','armchair','依桌型、容量、賓客群組與偏好自動產生初步座位配置、衝突及未安排清單。','活動、婚宴、教室、會議、工作坊與團體座位安排','自動配置採簡化規則，無障礙、場地動線與實際人際需求仍需人工確認。'],
  ['label-sheet-designer','標籤紙版面設計器','視覺與影像處理','Print Labels','grid-3x3','依紙張、邊界、列欄、間距與資料列建立精準標籤位置及可列印 HTML。','地址貼紙、資產標籤、商品標示、活動名牌與批次套印','印表機縮放與不可列印邊界會影響精度，正式列印前應先用普通紙校正。']
].map(([slug,title,category,tag,icon,description,uses,caveat])=>({slug,title,category,tag,icon,description,uses,caveat}));

const categories={
  '字型與國際化':{slider:'slider-i18n-typography',color:'violet',existing:false,icon:'languages'},
  '檔案與資料格式':{slider:'slider-file-format',color:'indigo',existing:true,icon:'file-code-2'},
  '視覺與影像處理':{slider:'slider-img',color:'rose',existing:true,icon:'palette'},
  '媒體與交換格式':{slider:'slider-media-interchange',color:'emerald',existing:true,icon:'file-output'},
  '資料結構與驗證':{slider:'slider-data-validation',color:'violet',existing:true,icon:'database'},
  '圖表與流程建模':{slider:'slider-diagram-modeling',color:'cyan',existing:false,icon:'workflow'},
  'Web 開發':{slider:'slider-web',color:'teal',existing:true,icon:'code-2'},
  'Web 協定與政策':{slider:'slider-web-policy',color:'cyan',existing:true,icon:'shield-check'},
  '開發工具':{slider:'slider-util',color:'cyan',existing:true,icon:'wrench'},
  '部署與開發工作流':{slider:'slider-deployment',color:'sky',existing:true,icon:'git-branch'},
  '專案與營運規劃':{slider:'slider-operations',color:'amber',existing:true,icon:'calendar-check'}
};
const paletteNames=['violet','sky','teal','amber','rose','emerald','indigo','cyan'];
const layoutNames=['split','blueprint','terminal','glass','editorial','neon','compact','aurora'];
tools.forEach((tool,index)=>{tool.palette=paletteNames[(index*7+2)%paletteNames.length];tool.layout=layoutNames[index%layoutNames.length]});
module.exports={tools,categories};
