#!/usr/bin/env python3
"""Build ToolHub's static /en/ site from the Traditional Chinese source pages."""

from __future__ import annotations

import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup, Comment, NavigableString
from argostranslate import translate
from opencc import OpenCC


ROOT = Path(__file__).resolve().parents[1]
SITE = "https://toolhuben.com"
CACHE_FILE = ROOT / "scripts" / "i18n-en-cache-v3.json"
DICT_FILE = ROOT / "components" / "i18n-en-dictionary.js"
TODAY = os.environ.get("TOOLHUB_LASTMOD", date.today().isoformat())
EXPECTED_TOOL_COUNT = int(os.environ.get("TOOLHUB_TOTAL_TOOLS", "450"))
EXPANSION_RUNTIME_SRC = "/components/tool-expansion.js?v=20260823-experiences-2"
CJK_RE = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")
SPACE_RE = re.compile(r"\s+")
STRING_RE = re.compile(r"(?P<q>['\"`])(?P<body>(?:\\.|(?!\1).)*?)(?P=q)", re.S)
LOCALIZED_EXTRA = {"/", "/about", "/contact", "/privacy-policy", "/terms-of-service"}
UNLOCALIZED = {"/mangalens-privacy"}
TO_SIMPLIFIED = OpenCC("t2s")

ACRONYMS = {
    "3d": "3D", "aes": "AES", "ai": "AI", "api": "API", "ascii": "ASCII",
    "bom": "BOM", "cdn": "CDN", "cli": "CLI", "cpu": "CPU", "crlf": "CRLF",
    "cors": "CORS", "csp": "CSP", "css": "CSS", "csv": "CSV", "dns": "DNS", "dpi": "DPI", "gpu": "GPU",
    "hmac": "HMAC", "html": "HTML", "http": "HTTP", "https": "HTTPS",
    "ical": "iCalendar", "id": "ID", "ip": "IP", "json": "JSON", "jsonl": "JSONL",
    "jwt": "JWT", "lf": "LF", "llm": "LLM", "m3u": "M3U", "ndjson": "NDJSON",
    "npm": "npm", "ocr": "OCR", "pc": "PC", "pcie": "PCIe", "pdf": "PDF",
    "graphql": "GraphQL", "opml": "OPML", "pii": "PII", "psu": "PSU", "qr": "QR", "raid": "RAID", "ram": "RAM", "rss": "RSS",
    "rgb": "RGB", "seo": "SEO", "sri": "SRI", "ssh": "SSH", "ssd": "SSD",
    "sql": "SQL", "srt": "SRT", "svg": "SVG", "toml": "TOML", "ui": "UI", "url": "URL", "uri": "URI",
    "uuid": "UUID", "ux": "UX", "vcard": "vCard", "vram": "VRAM", "xml": "XML",
    "yaml": "YAML", "youtube": "YouTube", "github": "GitHub", "javascript": "JavaScript",
    "markdown": "Markdown", "docker": "Docker", "gamepad": "Gamepad", "webp": "WebP", "webvtt": "WebVTT", "wifi": "Wi-Fi",
}
LOWER = {"and", "for", "from", "in", "of", "or", "to", "with"}
SPECIAL_TITLES = {
    "": "ToolHub",
    "about": "About ToolHub",
    "contact": "Contact Us",
    "privacy-policy": "Privacy Policy",
    "terms-of-service": "Terms of Service",
    "qrcode": "QR Code Generator",
    "scan": "Barcode & QR Code Scanner",
    "color": "Color Toolkit",
    "pcbuild": "PC Build Planner",
    "hw-decoder": "Hardware Decoder",
    "logic-matrix": "Logic Gate Simulator",
    "estep-calibrator": "E-Step Calibrator",
    "htaccess-generator": ".htaccess Generator",
    "apache-htaccess-generator": "Apache .htaccess Generator",
}
CORE_HERO_TITLES = {
    "contact": ("Contact", "ToolHub"),
    "privacy-policy": ("Privacy", "Policy"),
    "terms-of-service": ("Terms of", "Service"),
}

MANUAL = {
    "首頁": "Home", "首頁工具": "Home Tools", "儀表板首頁": "Dashboard Home",
    "關於本站": "About", "關於我們": "About", "聯絡我們": "Contact Us",
    "隱私權政策": "Privacy Policy", "服務條款": "Terms of Service",
    "搜尋工具": "Search Tools", "搜尋 ToolHub 工具": "Search ToolHub Tools",
    "搜尋工具名稱、分類或網址關鍵字…": "Search by tool name, category, or URL…",
    "正在建立工具索引…": "Building the tool index…", "工具索引載入中": "Loading tool index",
    "搜尋全程在瀏覽器本機完成": "Search runs entirely in your browser",
    "↑ ↓ 選擇・Enter 開啟": "↑ ↓ Select · Enter to open",
    "關閉搜尋": "Close search", "切換網站語言": "Switch website language",
    "切換主題顏色": "Change theme color", "主題": "Theme", "選擇全站主題": "Choose site theme",
    "午夜黑": "Midnight", "海洋藍": "Ocean", "紫羅蘭": "Violet", "森林綠": "Forest",
    "晨曦淺色": "Daylight", "開啟或關閉側邊欄": "Open or close the sidebar",
    "系統導航 (ToolHub v5.1)": "Tool Navigation (ToolHub v5.1)",
    "編碼與轉換": "Encoding & Conversion", "開發者工具": "Developer Tools",
    "文字與資料": "Text & Data", "影像與設計": "Image & Design",
    "網路與安全": "Network & Security", "硬體與效能": "Hardware & Performance",
    "數學與計算": "Math & Calculation", "生活與實用": "Everyday Utilities",
    "內容與創作": "Content & Creation", "時間與日期": "Time & Date",
    "產生器": "Generators", "分析工具": "Analysis Tools", "全部工具": "All Tools",
    "立即使用": "Use Tool", "開始使用": "Get Started", "免費使用": "Use for Free",
    "常見問題": "Frequently Asked Questions", "使用說明": "How to Use",
    "功能特色": "Features", "計算結果": "Result", "結果": "Result", "輸入": "Input",
    "清除": "Clear", "重設": "Reset", "複製": "Copy", "下載": "Download",
    "上傳檔案": "Upload File", "選擇檔案": "Choose File", "拖放檔案至此": "Drop a file here",
    "執行": "Run", "轉換": "Convert", "產生": "Generate", "分析": "Analyze",
    "新增": "Add", "移除": "Remove", "範例": "Example", "錯誤": "Error",
    "請輸入內容": "Enter content", "處理完成": "Complete", "已複製": "Copied",
    "無需上傳": "No upload required", "純前端運算": "Runs entirely in your browser",
    "資料不離開您的裝置": "Your data never leaves your device",
    "所有處理都在瀏覽器本機完成": "All processing happens locally in your browser",
    "台灣與香港": "Taiwan and Hong Kong", "繁體中文": "Traditional Chinese",
    "閏年": "Leap year",
    "• 2024 年 → ✅ 閏年（能被 4 整除，不能被 100 整除）": "• 2024 → ✅ Leap year (divisible by 4, but not by 100)",
    "完整的工作流程：從 JSON 驗證 → Pretty Print → 轉換 → 複製 → 下載，一氣呵成。": "Complete workflow: validate JSON, pretty-print it, convert it, copy the result, and download the XML.",
    "完整的工作流程：": "Complete workflow:",
    "從 JSON 驗證 → Pretty Print → 轉換 → 複製 → 下載，一氣呵成。": "Validate JSON, pretty-print it, convert it, copy the result, and download the XML.",
    "在波形上按下滑鼠拖曳選取範圍，然後使用工具列的 Trim、Delete、Copy 等功能。你也可以直接在「Trim」欄位輸入起訖秒數進行精確剪輯。": "Drag across the waveform to select a range, then use Trim, Delete, or Copy. You can also enter exact start and end times in the Trim fields.",
    "選擇要檢視的檔案": "Choose a file to inspect", "最多讀取位元組": "Maximum bytes to read",
    "處理檔案": "Process File", "所有資料只在目前瀏覽器分頁中處理。": "All data is processed only in this browser tab.",
    "原始字元": "Original characters", "網址字元": "URL characters",
    "部署參數與規則": "Deployment Parameters and Rules", "書籤名稱": "Bookmark Name",
    "解析與轉換結果": "Parsed and Converted Result",
    "等待選擇檔案": "Waiting for a file", "產生設定": "Generate Configuration",
    "可用設定檔": "Ready-to-Use Configuration", "Bookmarklet 已產生": "Bookmarklet Generated",
    "⭐ 常用": "⭐ Popular", "SEO 相關": "SEO-related", "查看詳細": "View details",
    "📋 官方說明": "📋 Official reference", "📝 詳細說明": "📝 Details",
    "❌ 未加密": "❌ Unencrypted", "尚無查詢記錄": "No search history",
    "🔤 副檔名": "🔤 Extension", "🔤 其他副檔名": "🔤 Other extensions", "📂 類別": "📂 Category",
    "必填": "Required", "Google 搜尋結果預覽": "Google Search Result Preview",
    "Schema 標題": "Schema Title", "Schema 描述將顯示於此": "The schema description will appear here",
    "顯示": "Showing", "個項目": "items", "執行處理": "Run",
    "不足": "Incomplete", "完成度": "Completeness", "建議": "Recommendation",
    "完成度偏低": "Completeness is low",
    "建議補充更多欄位以獲得更好的搜尋呈現效果": "Consider adding more fields for better search presentation",
    "缺少": "Missing", "個推薦欄位": "recommended fields",
    "Google 建議加入以下欄位": "Google recommends adding these fields",
    "決定項不是 Superkey，右側也不是 Prime Attribute": "The determinant is not a superkey, and the right side is not a prime attribute",
    "決定項不是": "The determinant is not a", "右側也不是": "and the right side is not a",
    "總時長": "Total duration",
    "泛用性最強，動漫與寫實皆可。品質詞放開頭，負向務必保留手部標籤。": "The most versatile choice for both anime and photorealistic images. Put quality terms first and keep negative hand tags.",
    "泛用性最強，動漫與寫實皆可。品質詞放開頭，負向務必保留": "Most versatile for anime and photorealistic images. Put quality terms first and keep negative",
    "手部標籤。": "hand tags.", "🔍 常見原因": "🔍 Common causes", "🔧 修復建議": "🔧 Suggested fixes",
    "💾 快取策略": "💾 Cache strategy", "不可快取": "Not cacheable", "✅ 加密傳輸": "✅ Encrypted",
    "📝 說明": "📝 Description", "💡 常見用途": "💡 Common uses",
    "白色右手食指（White Right Pointing Index）": "White Right Pointing Index",
    "白色上箭头（Upwards White Arrow / Shift Key）": "Upwards White Arrow / Shift Key",
    "（無特定副檔名）": "(No specific extension)",
    "法律條款": "Legal Information",
    "我們收集的資訊": "Information We Collect",
    "在使用 ToolHub 時，我們可能會收集以下類型的資訊：": "When you use ToolHub, we may collect the following types of information:",
    "自動收集的資訊：": "Information collected automatically:",
    "當您訪問本網站時，我們可能會自動收集您的瀏覽器類型、操作系統、IP 位址、訪問時間及瀏覽的頁面等基本資訊。": "When you visit this site, we may automatically collect basic information such as your browser type, operating system, IP address, access time, and pages viewed.",
    "Cookie 及類似技術：": "Cookies and similar technologies:",
    "我們使用 Cookie 來改善您的瀏覽體驗、分析網站流量及顯示個人化廣告（詳見下方 Cookie 說明）。": "We use cookies to improve your browsing experience, analyze site traffic, and display personalized advertising. See the cookie section below for details.",
    "您主動提供的資訊：": "Information you provide:",
    "若您透過聯絡表單或電子郵件與我們聯繫，我們將收集您提供的姓名、電子郵件地址及訊息內容。": "If you contact us through a contact form or email, we collect the name, email address, and message content that you provide.",
    "Cookie 使用說明": "How We Use Cookies",
    "Cookie 是小型文字檔案，當您訪問網站時儲存在您的裝置上。ToolHub 使用以下類型的 Cookie：": "Cookies are small text files stored on your device when you visit a website. ToolHub uses the following types of cookies:",
    "必要 Cookie：": "Essential cookies:",
    "分析 Cookie：": "Analytics cookies:",
    "廣告 Cookie：": "Advertising cookies:",
    "本機運算與資料安全": "Local Processing and Data Security",
    "資料保存政策": "Data Retention",
    "您的權利": "Your Rights",
    "第三方服務": "Third-Party Services",
    "政策更新": "Policy Updates",
    "純前端本地運算 · 保障您的資料隱私": "Private, browser-based tools · Your data stays on your device",
    "專為開發與創作者打造的": "Built for developers and creators",
    "全能線上工具箱": "All-in-one Online Toolbox",
    "免安裝、隨開即用。涵蓋網路 IP 觀測、數位資產防禦、軟體編碼到高畫質物理機率模擬。您的檔案絕不離開設備，體驗極致的安全與效率。": "No installation, no sign-up. Explore tools for networking, security, coding, design, data, and more. Your files stay on your device for a fast, private workflow.",
    "免費本機工具": "Free Local Tool", "資料不上傳": "No uploads", "分享到": "Share on",
    "本機處理": "processed locally", "所有資料都在瀏覽器": "All data stays in the browser",
    "支援手機操作": "Mobile-friendly", "支援主題切換": "Theme support",
    "Binary Viewer ・ 免費本機工具": "Binary Viewer · Free Local Tool",
    "讀取本機檔案並以 Offset、Hex Bytes 與 ASCII 三欄顯示內容，支援限制預覽大小。": "Inspect a local file in Offset, Hex Bytes, and ASCII columns with a configurable preview limit.",
    "建立理念": "Our Founding Idea",
    "嵌套參數解析矩陣 (qs Engine) 已掛載": "Nested Query Parameter Engine Ready",
    "全方位的網址字串處理引擎。內建高階 qs 解析器，完美解構 filter[name] 等複雜嵌套結構，支援扁平表格與 JSON 樹狀雙模編輯重鑄。": "A complete URL string toolkit with an advanced query-string parser. Decode nested keys such as filter[name], then edit data as either a flat table or a JSON tree.",
    "全方位的網址字串處理引擎。內建高階 qs 解析器，完美解構": "A complete URL string toolkit with an advanced query-string parser. It can decode",
    "等複雜嵌套結構，支援扁平表格與 JSON 樹狀雙模編輯重鑄。": "and other nested structures, with two-way editing as a flat table or JSON tree.",
    "💡 最佳實踐： 在簡潔與描述性之間取得平衡。移除不必要的停用詞（如「的」、「了」、「在」），只保留核心關鍵字。": "💡 Best practice: Balance brevity with clarity. Remove unnecessary stop words such as “the”, “a”, and “of”, keeping only the core keywords.",
    "在簡潔與描述性之間取得平衡。移除不必要的停用詞（如「的」、「了」、「在」），只保留核心關鍵字。": "Balance brevity with clarity. Remove unnecessary stop words such as “the”, “a”, and “of”, keeping only the core keywords.",
}


def normalize_text(value: str) -> str:
    return SPACE_RE.sub(" ", value).strip()


def has_cjk(value: str | None) -> bool:
    return bool(value and CJK_RE.search(value))


def slug_title(slug: str) -> str:
    if slug in SPECIAL_TITLES:
        return SPECIAL_TITLES[slug]
    words = []
    for index, raw in enumerate(slug.split("-")):
        key = raw.lower()
        if key in ACRONYMS:
            words.append(ACRONYMS[key])
        elif index and key in LOWER:
            words.append(key)
        elif key == "htaccess":
            words.append(".htaccess")
        elif key == "systemd":
            words.append("systemd")
        elif key == "caddyfile":
            words.append("Caddyfile")
        else:
            words.append(raw.capitalize())
    return " ".join(words)


def tool_slugs() -> list[str]:
    soup = BeautifulSoup((ROOT / "components" / "sidebar.html").read_text(encoding="utf-8"), "html.parser")
    slugs = []
    for anchor in soup.select("a.nav-item[href]"):
        path = urlparse(anchor.get("href", "")).path.rstrip("/")
        if not path or path.count("/") != 1:
            continue
        slug = path[1:]
        if (ROOT / slug / "index.html").is_file() and slug not in slugs:
            slugs.append(slug)
    if len(slugs) != EXPECTED_TOOL_COUNT:
        raise RuntimeError(
            f"Expected {EXPECTED_TOOL_COUNT} tool links in sidebar, found {len(slugs)}"
        )
    return slugs


def source_pages(slugs: list[str]) -> list[tuple[str, Path]]:
    return [
        ("", ROOT / "index.html"),
        ("about", ROOT / "about" / "index.html"),
        ("contact", ROOT / "contact" / "index.html"),
        ("privacy-policy", ROOT / "privacy-policy" / "index.html"),
        ("terms-of-service", ROOT / "terms-of-service" / "index.html"),
    ] + [
        (slug, ROOT / slug / "index.html") for slug in slugs
    ]


def add_title_manuals(pages: list[tuple[str, Path]], mapping: dict[str, str]) -> None:
    for slug, path in pages:
        title = slug_title(slug)
        soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
        for node in [soup.title, soup.find("h1")]:
            if node:
                original = normalize_text(node.get_text(" ", strip=True))
                if original:
                    mapping[original] = title if node.name == "h1" else (
                        "ToolHub | Free Online Tools for Developers, Creators, and Everyday Work"
                        if slug == "" else f"{title} | Free Online Tool - ToolHub"
                    )
        for anchor in soup.select("a"):
            href = urlparse(anchor.get("href", "")).path.rstrip("/")
            if href == f"/{slug}" and slug:
                label = normalize_text(anchor.get_text(" ", strip=True))
                if label and has_cjk(label):
                    mapping[label] = title
    sidebar = BeautifulSoup((ROOT / "components" / "sidebar.html").read_text(encoding="utf-8"), "html.parser")
    for anchor in sidebar.select("a.nav-item[href]"):
        slug = urlparse(anchor.get("href", "")).path.rstrip("/").split("/")[-1]
        label = normalize_text(anchor.get_text(" ", strip=True))
        if slug and label and has_cjk(label):
            mapping[label] = slug_title(slug)


def collect_visible_phrases(soup: BeautifulSoup, phrases: set[str]) -> None:
    for node in soup.find_all(string=True):
        parent = node.parent
        if isinstance(node, Comment) or not parent or parent.name in {"script", "style", "code"}:
            continue
        value = normalize_text(str(node))
        if has_cjk(value) and len(value) <= 1000:
            phrases.add(value)
    for tag in soup.find_all(True):
        for attr in ("title", "placeholder", "aria-label", "value", "alt"):
            value = tag.get(attr)
            if isinstance(value, str):
                value = normalize_text(value)
                if has_cjk(value) and len(value) <= 1000:
                    phrases.add(value)


def collect_script_phrases(text: str, phrases: set[str]) -> None:
    # Scan JavaScript strings in linear time. Skip comments and regular-expression
    # literals first so quotes inside patterns (for example /[<>&"']/g) cannot
    # swallow the rest of a densely packed tool specification.
    index = 0
    length = len(text)
    while index < length:
        quote = text[index]
        if quote == "/" and index + 1 < length and text[index + 1] == "/":
            newline = text.find("\n", index + 2)
            index = length if newline < 0 else newline + 1
            continue
        if quote == "/" and index + 1 < length and text[index + 1] == "*":
            close = text.find("*/", index + 2)
            index = length if close < 0 else close + 2
            continue
        if quote == "/":
            previous = index - 1
            while previous >= 0 and text[previous].isspace():
                previous -= 1
            previous_char = text[previous] if previous >= 0 else ""
            prefix = text[max(0, previous - 12):previous + 1]
            regex_context = (
                previous < 0
                or previous_char in "([{=,:;!&|?+-*%^~<>"
                or re.search(r"\b(?:return|case|throw|yield|await|typeof|void|delete|new|in|of)\s*$", prefix)
            )
            if regex_context:
                cursor = index + 1
                in_class = False
                while cursor < length:
                    char = text[cursor]
                    if char == "\\" and cursor + 1 < length:
                        cursor += 2
                        continue
                    if char == "[":
                        in_class = True
                    elif char == "]":
                        in_class = False
                    elif char == "/" and not in_class:
                        cursor += 1
                        while cursor < length and text[cursor].isalpha():
                            cursor += 1
                        break
                    cursor += 1
                index = cursor
                continue
        if quote not in {"'", '"', "`"}:
            index += 1
            continue
        index += 1
        chunks_buffer: list[str] = []
        while index < length:
            char = text[index]
            if char == "\\" and index + 1 < length:
                chunks_buffer.append(char)
                chunks_buffer.append(text[index + 1])
                index += 2
                continue
            if char == quote:
                index += 1
                break
            chunks_buffer.append(char)
            index += 1
        body = "".join(chunks_buffer)
        if not has_cjk(body) or len(body) > 1000:
            continue
        # Template literals are translated in stable chunks around substitutions.
        chunks = re.split(r"\$\{[^}]+\}", body)
        for chunk in chunks:
            value = normalize_text(chunk.replace("\\n", "\n"))
            if has_cjk(value) and 0 < len(value) <= 1000:
                phrases.add(value)


def collect_phrases(pages: list[tuple[str, Path]]) -> set[str]:
    phrases: set[str] = set()
    for _, path in pages:
        text = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        collect_visible_phrases(soup, phrases)
        for script in soup.find_all("script"):
            collect_script_phrases(script.string or script.get_text() or "", phrases)
    for path in (ROOT / "components").glob("*.html"):
        text = path.read_text(encoding="utf-8")
        soup = BeautifulSoup(text, "html.parser")
        collect_visible_phrases(soup, phrases)
        for script in soup.find_all("script"):
            collect_script_phrases(script.string or script.get_text() or "", phrases)
    for path in (ROOT / "components").glob("*.js"):
        if path.name not in {"i18n-en-dictionary.js", "i18n-runtime.js"}:
            collect_script_phrases(path.read_text(encoding="utf-8"), phrases)
    return phrases


RUNTIME_SCRIPT_CACHE: dict[Path, tuple[set[str], dict[str, set[str]]]] = {}
RUNTIME_PHRASE_FILE = ROOT / "scripts" / "i18n-runtime-phrases-350.json"
GENERATED_RUNTIME_PHRASES = (
    json.loads(RUNTIME_PHRASE_FILE.read_text(encoding="utf-8"))
    if RUNTIME_PHRASE_FILE.is_file() else {}
)
SPECIAL_RUNTIME_PHRASE_FILE = ROOT / "scripts" / "i18n-runtime-phrases-special.json"
SPECIAL_RUNTIME_PHRASES = (
    json.loads(SPECIAL_RUNTIME_PHRASE_FILE.read_text(encoding="utf-8"))
    if SPECIAL_RUNTIME_PHRASE_FILE.is_file() else {}
)


def runtime_phrases_from_component(path: Path, slug: str) -> set[str]:
    cached = RUNTIME_SCRIPT_CACHE.get(path)
    if cached is None:
        generic_lines: list[str] = []
        tool_lines: dict[str, list[str]] = {}
        current_tool: str | None = None
        for line in path.read_text(encoding="utf-8").splitlines():
            match = re.match(r"^\s{4}'([a-z0-9-]+)':\s*\{", line) if path.name.startswith("tool-expansion") else None
            if match:
                current_tool = match.group(1)
                tool_lines.setdefault(current_tool, []).append(line)
            elif current_tool is not None and re.match(r"^\s{2}\};\s*$", line):
                current_tool = None
                generic_lines.append(line)
            elif current_tool is not None:
                tool_lines[current_tool].append(line)
            else:
                generic_lines.append(line)
        generic: set[str] = set()
        collect_script_phrases("\n".join(generic_lines), generic)
        by_slug: dict[str, set[str]] = {}
        for tool_slug, lines in tool_lines.items():
            values: set[str] = set()
            collect_script_phrases("\n".join(lines), values)
            by_slug[tool_slug] = values
        cached = (generic, by_slug)
        RUNTIME_SCRIPT_CACHE[path] = cached
    generic, by_slug = cached
    return generic | by_slug.get(slug, set())


def collect_page_runtime_phrases(slug: str, source: Path) -> set[str]:
    """Collect only strings that this page can create after its static HTML is parsed."""
    phrases: set[str] = {key for key in MANUAL if len(key) <= 80}
    phrases.update(GENERATED_RUNTIME_PHRASES.get(slug, []))
    phrases.update(SPECIAL_RUNTIME_PHRASES.get(slug, []))
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    for script in soup.find_all("script"):
        if script.get("type") == "application/ld+json":
            continue
        src = (script.get("src") or "").split("?", 1)[0]
        if src.startswith("/components/"):
            path = ROOT / src.lstrip("/")
            if path.is_file() and path.name not in {"language.js", "tool-search.js", "i18n-runtime.js", "i18n-en-dictionary.js"}:
                phrases.update(runtime_phrases_from_component(path, slug))
        else:
            collect_script_phrases(script.string or script.get_text() or "", phrases)
    for phrase in list(phrases):
        if "<" in phrase and ">" in phrase:
            collect_visible_phrases(BeautifulSoup(phrase, "html.parser"), phrases)
    return phrases


def translate_missing(mapping: dict[str, str], phrases: set[str]) -> None:
    missing = sorted(p for p in phrases if p not in mapping and has_cjk(p))
    if not missing:
        return
    print(f"Translating {len(missing)} new phrases with contextual batches...")
    separator = "\n<<<TOOLHUB_TRANSLATION_BREAK>>>\n"
    batches: list[list[str]] = []
    current: list[str] = []
    size = 0
    for phrase in missing:
        added = len(phrase) + (len(separator) if current else 0)
        if current and (size + added > 2600 or len(current) >= 36):
            batches.append(current)
            current, size = [], 0
        current.append(phrase)
        size += added
    if current:
        batches.append(current)

    def request_batch(batch: list[str], attempt: int = 0) -> list[str]:
        body = urlencode({"client": "gtx", "sl": "zh-TW", "tl": "en", "dt": "t", "q": separator.join(batch)}).encode()
        request = Request(
            "https://translate.googleapis.com/translate_a/single",
            data=body,
            headers={"User-Agent": "ToolHub-Static-I18n-Builder/1.0"},
        )
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
            output = "".join(segment[0] or "" for segment in payload[0])
            parts = [part.strip() for part in re.split(r"\s*<<<TOOLHUB_TRANSLATION_BREAK>>>\s*", output)]
            if len(parts) == len(batch):
                return parts
            if len(batch) > 1:
                middle = len(batch) // 2
                return request_batch(batch[:middle], attempt) + request_batch(batch[middle:], attempt)
            raise RuntimeError("Translation separator was not preserved")
        except Exception:
            if attempt < 3:
                time.sleep(1.5 * (attempt + 1))
                return request_batch(batch, attempt + 1)
            raise

    completed = 0
    with ThreadPoolExecutor(max_workers=4) as executor:
        jobs = {executor.submit(request_batch, batch): batch for batch in batches}
        for future in as_completed(jobs):
            batch = jobs[future]
            try:
                outputs = future.result()
            except Exception:
                # Offline fallback keeps the build reproducible if the translation service is unavailable.
                package = translate.get_translation_from_codes("zh", "en").underlying
                package.translate("測試")
                tokens = [package.pkg.tokenizer.encode(TO_SIMPLIFIED.convert(value)) for value in batch]
                results = package.translator.translate_batch(tokens, replace_unknowns=True, max_batch_size=64, batch_type="examples", beam_size=1)
                outputs = [package.pkg.tokenizer.decode(result.hypotheses[0]).strip() for result in results]
            for source, output in zip(batch, outputs):
                mapping[source] = output or source
            completed += len(batch)
            if completed % 500 < len(batch):
                print(f"  {completed}/{len(missing)}")
                CACHE_FILE.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")


def translated(value: str, mapping: dict[str, str]) -> str:
    clean = normalize_text(value)
    if not clean or not has_cjk(clean):
        return value
    result = mapping.get(clean, clean)
    leading = value[:len(value) - len(value.lstrip())]
    trailing = value[len(value.rstrip()):]
    return leading + result + trailing


def localized_path(path: str, localized: set[str]) -> str:
    parsed = urlparse(path)
    clean = parsed.path.replace("/index.html", "").rstrip("/") or "/"
    if clean.startswith("/en") or clean not in localized:
        return path
    target = "/en/" if clean == "/" else f"/en{clean}"
    if parsed.path.endswith("/") and target != "/en/":
        target += "/"
    if parsed.query:
        target += "?" + parsed.query
    if parsed.fragment:
        target += "#" + parsed.fragment
    return target


def translate_fragment(soup: BeautifulSoup, mapping: dict[str, str], localized: set[str]) -> None:
    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or not node.parent or node.parent.name in {"script", "style", "code"}:
            continue
        if has_cjk(str(node)):
            node.replace_with(translated(str(node), mapping))
    for tag in soup.find_all(True):
        for attr in ("title", "placeholder", "aria-label", "value", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and has_cjk(value):
                tag[attr] = mapping.get(normalize_text(value), value)
        if tag.name == "a" and isinstance(tag.get("href"), str):
            tag["href"] = localized_path(tag["href"], localized)


def build_english_components(mapping: dict[str, str], localized: set[str]) -> None:
    for name in ("header", "sidebar", "footer"):
        source = ROOT / "components" / f"{name}.html"
        soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
        translate_fragment(soup, mapping, localized)
        target = ROOT / "components" / f"{name}-en.html"
        target.write_text(str(soup), encoding="utf-8")


def absolute_url(slug: str, english: bool) -> str:
    prefix = "/en" if english else ""
    suffix = "/" if slug == "" else f"/{slug}/"
    return SITE + prefix + suffix


def normalize_source_links(pages: list[tuple[str, Path]], slugs: list[str]) -> None:
    """Match Cloudflare Pages' canonical folder URL: every tool ends in a slash."""
    names = sorted((re.escape(slug) for slug in slugs), key=len, reverse=True)
    route = r"(?:" + "|".join(names) + r")"
    href_pattern = re.compile(rf'(<a\b[^>]*\bhref=["\'])(/{route})(?:/index\.html)?((?:[?#][^"\']*)?["\'])', re.I)
    absolute_pattern = re.compile(rf'({re.escape(SITE)}/{route})(?=["\'<\s?#])', re.I)

    paths = [path for _, path in pages]
    paths.extend((ROOT / "components").glob("*.html"))
    for path in dict.fromkeys(paths):
        text = path.read_text(encoding="utf-8")
        text = href_pattern.sub(lambda match: match.group(1) + match.group(2) + "/" + match.group(3), text)
        text = absolute_pattern.sub(lambda match: match.group(1) + "/", text)
        path.write_text(text, encoding="utf-8")


def replace_url_strings(value: str, localized: set[str]) -> str:
    if value.startswith(SITE):
        parsed = urlparse(value)
        path = parsed.path.replace("/index.html", "").rstrip("/") or "/"
        if path in localized:
            return SITE + localized_path(parsed.path, localized)
    return value


def transform_jsonld(obj, mapping: dict[str, str], localized: set[str]):
    if isinstance(obj, dict):
        return {key: ("en" if key == "inLanguage" else transform_jsonld(value, mapping, localized)) for key, value in obj.items()}
    if isinstance(obj, list):
        return [transform_jsonld(item, mapping, localized) for item in obj]
    if isinstance(obj, str):
        obj = replace_url_strings(obj, localized)
        return mapping.get(normalize_text(obj), obj) if has_cjk(obj) else obj
    return obj


def remove_seo_links(soup: BeautifulSoup) -> None:
    for link in list(soup.find_all("link")):
        rel = [str(item).lower() for item in (link.get("rel") or [])]
        if "canonical" in rel or "alternate" in rel and link.get("hreflang"):
            link.decompose()


def set_meta(soup: BeautifulSoup, selector: str, content: str, attr: str = "name") -> None:
    key, value = selector.split("=", 1)
    tag = soup.find("meta", attrs={key: value})
    if tag:
        tag["content"] = content


def build_english_page(slug: str, source: Path, mapping: dict[str, str], localized: set[str]) -> None:
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    soup.html["lang"] = "en"
    soup.body["data-locale"] = "en"

    for script in list(soup.find_all("script")):
        if script.get("src") == "https://cdn.tailwindcss.com":
            stylesheet = soup.new_tag("link", rel="stylesheet", href="/components/tailwind-en.css?v=20260821-1")
            script.replace_with(stylesheet)
        elif "tailwind.config" in (script.string or script.get_text() or ""):
            script.decompose()
        elif (script.get("src") or "").split("?", 1)[0] == "/components/tool-page.js":
            script["src"] = "/components/tool-page.js?v=20260821-5"
        elif (script.get("src") or "").split("?", 1)[0] == "/components/tool-expansion.js":
            script["src"] = EXPANSION_RUNTIME_SRC

    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or not node.parent or node.parent.name in {"script", "style", "code"}:
            continue
        if has_cjk(str(node)):
            node.replace_with(translated(str(node), mapping))
    for tag in soup.find_all(True):
        for attr in ("title", "placeholder", "aria-label", "value", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and has_cjk(value):
                tag[attr] = mapping.get(normalize_text(value), value)
        if tag.name == "meta" and isinstance(tag.get("content"), str) and has_cjk(tag["content"]):
            tag["content"] = mapping.get(normalize_text(tag["content"]), tag["content"])
        if tag.name == "a" and isinstance(tag.get("href"), str):
            tag["href"] = localized_path(tag["href"], localized)

    if slug in CORE_HERO_TITLES:
        heading = soup.find("h1")
        if heading:
            prefix, accent = CORE_HERO_TITLES[slug]
            accent_node = heading.find("span")
            if accent_node:
                for child in heading.contents:
                    if isinstance(child, str) and child.strip():
                        child.replace_with(f"\n                {prefix} ")
                        break
                accent_node.string = accent
            else:
                heading.string = f"{prefix} {accent}"

    expansion_badge = soup.select_one(".exp-hero-copy > .badge")
    if expansion_badge:
        badge_text = normalize_text(expansion_badge.get_text(" ", strip=True))
        badge_tag = re.split(r"\s*(?:・|·|\.)\s*Free\b", badge_text, maxsplit=1, flags=re.I)[0].strip()
        expansion_badge.string = f"{badge_tag} · Free Local Tool"

    for inline in soup.find_all(["strong", "a", "code", "em"]):
        following = inline.next_sibling
        if isinstance(following, NavigableString) and following and not str(following)[0].isspace() and re.match(r"[A-Za-z0-9]", str(following)):
            following.replace_with(" " + str(following))

    name = slug_title(slug)
    page_title = (
        "ToolHub | Free Online Tools for Developers, Creators, and Everyday Work"
        if slug == "" else
        "About ToolHub | Private, Browser-Based Online Tools" if slug == "about" else
        "Contact ToolHub | Support, Feedback, and Partnerships" if slug == "contact" else
        "Privacy Policy | ToolHub" if slug == "privacy-policy" else
        "Terms of Service | ToolHub" if slug == "terms-of-service" else
        f"{name} | Free Online Tool - ToolHub"
    )
    if soup.title:
        soup.title.string = page_title
    description_tag = soup.find("meta", attrs={"name": "description"})
    description = description_tag.get("content", "") if description_tag else ""
    if has_cjk(description):
        description = mapping.get(normalize_text(description), description)
    if not description or has_cjk(description):
        description = (
            "Use ToolHub's free browser-based tools for development, design, content, data, and everyday work. No installation required."
            if slug == "" else
            "Learn how ToolHub delivers free, privacy-friendly tools that run directly in your browser."
            if slug == "about" else
            "Contact ToolHub for support, feedback, bug reports, or partnership inquiries."
            if slug == "contact" else
            "Read the ToolHub Privacy Policy, including local browser processing, cookies, advertising, and data protection practices."
            if slug == "privacy-policy" else
            "Read the ToolHub Terms of Service, including acceptable use, intellectual property, disclaimers, and limitations of liability."
            if slug == "terms-of-service" else
            f"Use the free {name} online. Fast, private, mobile-friendly, and processed directly in your browser."
        )
    if description_tag:
        description_tag["content"] = description
    set_meta(soup, "property=og:title", page_title)
    set_meta(soup, "property=og:description", description)
    set_meta(soup, "property=og:url", absolute_url(slug, True))
    set_meta(soup, "property=og:locale", "en_US")
    set_meta(soup, "name=twitter:title", page_title)
    set_meta(soup, "name=twitter:description", description)

    remove_seo_links(soup)
    canonical = soup.new_tag("link", rel="canonical", href=absolute_url(slug, True))
    zh = soup.new_tag("link", rel="alternate", hreflang="zh-Hant", href=absolute_url(slug, False))
    en = soup.new_tag("link", rel="alternate", hreflang="en", href=absolute_url(slug, True))
    default = soup.new_tag("link", rel="alternate", hreflang="x-default", href=absolute_url(slug, True))
    soup.head.append(canonical)
    soup.head.append(zh)
    soup.head.append(en)
    soup.head.append(default)
    for script in soup.find_all("script"):
        if script.get("type") == "application/ld+json":
            continue
        content = script.string or script.get_text() or ""
        replaced = content.replace("/components/header.html", "/components/header-en.html")
        replaced = replaced.replace("/components/sidebar.html", "/components/sidebar-en.html")
        replaced = replaced.replace("/components/footer.html", "/components/footer-en.html")
        replaced = replaced.replace("'header.html'", "'header-en.html'").replace('\"header.html\"', '\"header-en.html\"')
        replaced = replaced.replace("'sidebar.html'", "'sidebar-en.html'").replace('\"sidebar.html\"', '\"sidebar-en.html\"')
        replaced = replaced.replace("'footer.html'", "'footer-en.html'").replace('\"footer.html\"', '\"footer-en.html\"')
        if slug == "svg-studio":
            replaced = replaced.replace("let currentLang = 'zh-TW';", "let currentLang = 'en';")
            replaced = replaced.replace("currentLang = localStorage.getItem('svg-studio-lang') || 'zh-TW';", "currentLang = 'en';")
        if slug == "sdxl-prompt-builder":
            replaced = replaced.replace("let currentLang = 'zh';", "let currentLang = 'en';")
        if replaced != content:
            script.string = replaced

    if slug not in {"", "about", "contact", "privacy-policy", "terms-of-service"}:
        runtime_phrases = collect_page_runtime_phrases(slug, source)
        useful = {key: value for key, value in mapping.items() if key in runtime_phrases and "<" not in key and ">" not in key and has_cjk(key) and value and value != key}
        if slug == "sdxl-prompt-builder":
            allowed = set(SPECIAL_RUNTIME_PHRASES.get(slug, []))
            useful = {key: value for key, value in mapping.items() if key in allowed and value and value != key}
        dictionary = soup.new_tag("script")
        dictionary.string = "window.ToolHubI18nDictionary=" + json.dumps(useful, ensure_ascii=False, separators=(",", ":")) + ";"
        runtime = soup.new_tag("script", src="/components/i18n-runtime.js?v=20260821-10")
        soup.head.append(dictionary)
        soup.head.append(runtime)

    for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            payload = json.loads(script.string or script.get_text())
            script.string = json.dumps(transform_jsonld(payload, mapping, localized), ensure_ascii=False, separators=(",", ":"))
        except (json.JSONDecodeError, TypeError):
            pass

    target = ROOT / "en" / (slug if slug else "") / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    rendered = re.sub(r"<!doctype\s+html>\s*", "", str(soup), flags=re.I)
    rendered = "<!DOCTYPE html>\n" + rendered.lstrip()
    target.write_text(rendered, encoding="utf-8")


def update_chinese_seo(slug: str, path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"\s*<!-- TOOLHUB I18N START -->.*?<!-- TOOLHUB I18N END -->", "", text, flags=re.S)
    canonical_url = absolute_url(slug, False)
    english_url = absolute_url(slug, True)
    canonical_tag = re.compile(r'<link\b[^>]*\brel=["\']canonical["\'][^>]*>', re.I)
    canonical_match = canonical_tag.search(text)
    if canonical_match:
        tag = canonical_match.group(0)
        if re.search(r'\bhref=["\'][^"\']*["\']', tag, re.I):
            tag = re.sub(r'(\bhref=["\'])[^"\']*(["\'])', rf'\g<1>{canonical_url}\2', tag, count=1, flags=re.I)
        else:
            tag = tag[:-1] + f' href="{canonical_url}">'
        text = text[:canonical_match.start()] + tag + text[canonical_match.end():]
    text = re.sub(
        r'(<meta\b[^>]*\bproperty=["\']og:url["\'][^>]*\bcontent=["\'])[^"\']*(["\'])',
        rf'\g<1>{canonical_url}\2', text, count=1, flags=re.I
    )
    if not re.search(r'<link\s+[^>]*rel=["\']canonical["\']', text, re.I):
        canonical = f'    <link rel="canonical" href="{canonical_url}">\n'
    else:
        canonical = ""
    block = (
        "\n    <!-- TOOLHUB I18N START -->\n"
        f"{canonical}"
        f'    <link rel="alternate" hreflang="zh-Hant" href="{canonical_url}">\n'
        f'    <link rel="alternate" hreflang="en" href="{english_url}">\n'
        f'    <link rel="alternate" hreflang="x-default" href="{english_url}">\n'
        "    <!-- TOOLHUB I18N END -->\n"
    )
    text = re.sub(r"</head>", block + "</head>", text, count=1, flags=re.I)
    path.write_text(text, encoding="utf-8")


def write_dictionary() -> None:
    """Compatibility stub: English pages now carry a small page-specific dictionary."""
    DICT_FILE.write_text("window.ToolHubI18nDictionary={};\n", encoding="utf-8")


def update_sitemap(pages: list[tuple[str, Path]]) -> None:
    path = ROOT / "sitemap.xml"
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"\s*<!-- TOOLHUB ENGLISH START -->.*?<!-- TOOLHUB ENGLISH END -->", "", text, flags=re.S)
    text = re.sub(rf'(<loc>{re.escape(SITE)}/[^<]+?)(?<!/)</loc>', r'\1/</loc>', text)
    entries = ["  <!-- TOOLHUB ENGLISH START -->"]
    for slug, _ in pages:
        priority = "1.0" if slug == "" else "0.6" if slug == "about" else "0.8"
        frequency = "daily" if slug == "" else "monthly"
        entries.append(
            f"  <url><loc>{absolute_url(slug, True)}</loc><lastmod>{TODAY}</lastmod>"
            f"<changefreq>{frequency}</changefreq><priority>{priority}</priority></url>"
        )
    entries.append("  <!-- TOOLHUB ENGLISH END -->")
    text = re.sub(r"\s*</urlset>", "\n\n" + "\n".join(entries) + "\n</urlset>\n", text, count=1)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    slugs = tool_slugs()
    pages = source_pages(slugs)
    localized = LOCALIZED_EXTRA | {f"/{slug}" for slug in slugs}
    normalize_source_links(pages, slugs)
    mapping = {}
    if CACHE_FILE.is_file():
        mapping.update(json.loads(CACHE_FILE.read_text(encoding="utf-8")))
    mapping.update(MANUAL)
    add_title_manuals(pages, mapping)
    phrases = collect_phrases(pages)
    for slug, source in pages:
        if slug not in {"", "about", "contact", "privacy-policy", "terms-of-service"}:
            phrases.update(collect_page_runtime_phrases(slug, source))
    translate_missing(mapping, phrases)
    CACHE_FILE.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")
    build_english_components(mapping, localized)
    write_dictionary()
    for index, (slug, source) in enumerate(pages, 1):
        build_english_page(slug, source, mapping, localized)
        update_chinese_seo(slug, source)
        if index % 50 == 0:
            print(f"Built {index}/{len(pages)} pages")
    update_sitemap(pages)
    print(f"Done: {len(slugs)} tools plus 5 core pages ({len(pages)} English pages).")


if __name__ == "__main__":
    main()
