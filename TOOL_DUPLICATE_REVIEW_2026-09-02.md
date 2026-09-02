# ToolHub 功能重複盤查

盤查日期：2026-09-02

判定方式不是只比較名稱，而是同時比較主要輸入、核心公式／轉換規則、輸出與實際使用目的。只有四項都高度重疊，且無法透過增加必要功能形成清楚差異時，才應刪除並以 301 永久轉址合併。

## 已修正的高重疊候選

### hydraulic-power-calculator / pump-head-power-calculator

原狀態：兩頁都由流量、揚程與效率計算水泵輸入功率，只有流量單位不同，實質過度接近。

處理：

- `hydraulic-power-calculator` 改為一般液壓壓力功率：系統壓力 bar、體積流量 L/min、總效率。
- `pump-head-power-calculator` 保留水泵揚程模型：水流量 m³/h、總揚程 m、泵效率。
- 兩頁現在使用不同工程模型與輸入，因此保留原 URL，不需要轉址。

### revenue-growth-calculator / percent-change-calculator

原狀態：營收成長頁只計算一般百分比變化，和既有百分比變化工具的核心結果接近。

處理：營收成長頁增加比較期間數、每年期間數、營收增減額與年化成長率；一般百分比工具仍負責方向式百分比變化與不分方向的百分比差異。兩頁現在輸出與使用目的不同。

## 比較後保留的相似工具

- `rc-time-constant-calculator` / `rl-time-constant-calculator`：分別使用 RC 與 L/R，描述電容電壓和電感電流，公式與元件不同。
- `capacitor-energy-calculator` / `inductor-energy-calculator`：分別使用 ½CV² 與 ½LI²，儲能元件與變數不同。
- `gear-ratio-calculator` / `pulley-speed-calculator`：齒數比與皮帶輪直徑比適用不同傳動機構，滑差與齒輪嚙合假設不同。
- `brick-quantity-calculator` / `block-wall-calculator`：磚與混凝土砌塊的模數、接縫、切割及施工耗損不同。
- `pool-volume-calculator` / `aquarium-volume-calculator`：公尺大型水體與公分水族箱容量的使用情境、預設尺度和判讀不同。
- `customer-retention-rate-calculator` / `churn-rate-calculator`：留存率會扣除期間新增客戶，流失率使用期初客戶；存在新客與回流時兩者不必互補為 100%。
- `grade-weight-calculator` / `gpa-calculator` / `weighted-decision-score-calculator`：分別處理百分制評量、學分等第點數與決策準則，輸入尺度與結果意義不同。
- `audio-delay-distance-calculator` / `sound-travel-time-calculator` / `lightning-distance-calculator`：固定 20°C 音訊延遲、溫度修正傳播時間與閃電事件距離，假設與輸入目的不同。

## 結果

本輪沒有頁面需要刪除或隱藏。高重疊頁已透過實際功能修改形成差異，其餘候選可由輸入、公式或使用目的清楚區分。若未來再發現真正重複頁，處理方式應是：保留內容較完整的 URL、把缺少的功能合併過去、更新首頁／側欄／Sitemap，並從舊 URL 以 301 永久轉址到主頁，避免直接形成 404。
