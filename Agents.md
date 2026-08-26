ToolHub Project Development Rules

Project Overview

ToolHub 是一個完全由前端構成的工具網站。

所有工具皆可獨立運作，不依賴任何後端。



Language Policy



目前 ToolHub 正式網站只有繁體中文版。

所有新工具、所有新頁面皆必須使用繁體中文。

英文版網站目前尚未開始建置。

不得自行建立英文版 UI。

不得自行建立英文 FAQ。

不得自行建立英文 SEO。

不得自行建立英文 Meta。

不得自行建立英文 Landing Page。

英文版將於所有繁體中文工具完成後，



再另外建立：

/en/

因此目前所有新增內容都必須維持繁體中文。



網站目前包含：

Home

Sidebar

Sitemap

Router

Header

Footer

共用 Layout

多個 Tool Pages

每個工具皆採用相同 UI 風格。

開發原則

新增功能，不重構

每次任務預設都是：

新增一個工具

不是：

重構網站

重寫 CSS

重寫 Layout

重寫 Router

除非需求明確要求。

Minimal Change Principle

請遵守：

最小修改原則

只修改完成任務所需的內容。

不要因為新增一個工具，而修改其他已完成功能。

可以修改

允許：

✅ 新增 Tool Page

✅ 新增 Home Tool Card

✅ 新增 Sidebar Link

✅ 更新 Router

✅ 更新 Sitemap

必要時可少量修改共用元件。

禁止修改

不得：

❌ 修改 Header

❌ 修改 Footer

❌ 修改 Layout

❌ 修改首頁設計

❌ 修改 Sidebar 樣式

❌ 修改既有 Tool UI

❌ 修改既有 CSS 導致其他頁面改變

❌ 刪除既有功能

❌ 重構整個專案

Tool Style

所有工具需保持一致。

包含：

Hero Section

Tool Card

Input Card

Result Card

FAQ

SEO Article

不得自行發明新的 UI。

Theme

必須支援：

Dark Mode

保持：

相同字型

相同配色

相同 Hover

相同陰影

相同圓角

Homepage

首頁設計為固定。

不得：

修改分類(除非該項目跟目前已經有的分類都不適合才新增新分類）

修改分類配色

修改 Card 樣式

修改 Glow

修改 Hover

新增工具時：

只新增卡片。(除非該項目跟目前已經有的分類都不適合才新增新分類）

Sidebar(除非該項目跟目前已經有的分類都不適合才新增新分類）

Sidebar 為固定元件。

新增工具：

只新增 Link。

不得重新排序。

不得重新設計。

Sitemap

新增工具時：

同步更新：

sitemap.xml

保留所有既有網址。

Tool URL

工具網址皆使用：

kebab-case

例如：

/ssd-endurance



/raid-calculator



/ram-latency-calculator

不得任意修改既有網址。

SEO

每個工具皆必須包含：

Hero

Meta Title

Meta Description

FAQ

SEO Article

避免只有輸入框。

Technical Requirements

使用：

HTML

CSS

Vanilla JavaScript

不得使用：

React

Vue

Angular

不得新增後端。

所有功能皆於瀏覽器完成。

Quality Standard

所有新工具皆需：

✅ 專業

✅ SEO Friendly

✅ Mobile Friendly

✅ Desktop Friendly

✅ 可直接正式上線

不得只完成 MVP。

請直接完成正式版本。

Regression Checklist

完成任務後請自行確認：

✅ Home 正常

✅ Tool Card 顏色正常

✅ Sidebar 正常

✅ Router 正常

✅ Sitemap 正常

✅ Dark Mode 正常

✅ Mobile 正常

✅ Desktop 正常

✅ 所有既有 Tool 正常

若任何既有功能受到影響，請先修正，再視為完成。

Code Style

保持：

模組化

可讀性

易維護

不要過度抽象。

不要過度封裝。

User Experience

所有工具應：

操作直覺

結果易閱讀

有錯誤提示

有使用建議

Project Goal

ToolHub 並非一般工具集合網站。

目標是建立：

全球高品質、SEO 友善、專業工具平台。

每個工具都應：

比 Google 同類工具更完整

更容易理解

更好的 UI

更好的 UX

更好的 SEO

每次新增工具時，請以正式商業產品品質完成。



\# Google AdSense（MANDATORY）



ToolHub 已啟用 Google AdSense。



所有新增工具頁面必須支援 Google AdSense。



\## AdSense Script



若專案尚未載入 AdSense Script，請於網站共用的 <head>（例如 Layout、Header、App 或共用 Head 元件）加入：



```html

<script async

src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1732059148394592"

crossorigin="anonymous"></script>

```



\## 規則



\- 僅允許載入一次。

\- 不可每個元件重複加入。

\- 若網站已經存在此 Script，不可再次新增。



\## 新工具頁面



所有新工具頁面都必須依照 ToolHub 現有版面配置加入 AdSense 廣告區塊。



若專案已有共用 AdSense 元件，請直接重複使用。



不得自行建立不同樣式的廣告區塊。



\## 注意事項



\- 保持與 ToolHub 現有廣告版位一致。

\- 不得破壞頁面排版。

\- 不得影響工具操作體驗。

