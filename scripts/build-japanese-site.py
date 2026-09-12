#!/usr/bin/env python3
"""Build ToolHub's static /ja/ site from the reviewed English site."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

from bs4 import BeautifulSoup, Comment


ROOT = Path(__file__).resolve().parents[1]
SITE = "https://toolhuben.com"
EN_ROOT = ROOT / "en"
JA_ROOT = ROOT / "ja"
CACHE_FILE = ROOT / "scripts" / "i18n-ja-cache.json"
EXPECTED_TOOLS = int(os.environ.get("TOOLHUB_TOTAL_TOOLS", "600"))
EXPECTED_PAGES = EXPECTED_TOOLS + 6  # home + 4 trust/core pages + quality
SPACE_RE = re.compile(r"\s+")
LATIN_RE = re.compile(r"[A-Za-z]")
URL_RE = re.compile(r"^(?:https?:|mailto:|tel:|data:|#|//)", re.I)
CODEISH_RE = re.compile(r"(?:document\.|window\.|className|=>|\$\{|</?\w|;\s*\w+=|\\[nrt]|\bconst\b|\blet\b|\bvar\b)")

MANUAL = {
    "Home": "ホーム",
    "Home Tools": "ホームツール",
    "About": "ToolHubについて",
    "Contact Us": "お問い合わせ",
    "Privacy Policy": "プライバシーポリシー",
    "Terms of Service": "利用規約",
    "Search Tools": "ツールを検索",
    "Search ToolHub Tools": "ToolHubのツールを検索",
    "Search by tool name, category, or URL…": "ツール名、カテゴリ、URLで検索…",
    "Building the tool index…": "ツール一覧を作成しています…",
    "Loading tool index": "ツール一覧を読み込んでいます",
    "Search runs entirely in your browser": "検索はブラウザ内だけで実行されます",
    "Close search": "検索を閉じる",
    "Switch website language": "サイトの言語を切り替える",
    "Change theme color": "テーマカラーを変更",
    "Theme": "テーマ",
    "Choose site theme": "サイトテーマを選択",
    "Midnight": "ミッドナイト",
    "Ocean": "オーシャン",
    "Violet": "バイオレット",
    "Forest": "フォレスト",
    "Daylight": "デイライト",
    "Open or close the sidebar": "サイドバーを開閉",
    "Tool Navigation (ToolHub v5.1)": "ツールナビゲーション (ToolHub v5.1)",
    "Encoding & Conversion": "エンコード・変換",
    "Developer Tools": "開発者ツール",
    "Text & Data": "テキスト・データ",
    "Image & Design": "画像・デザイン",
    "Network & Security": "ネットワーク・セキュリティ",
    "Hardware & Performance": "ハードウェア・性能",
    "Math & Calculation": "数学・計算",
    "Everyday Utilities": "日常ツール",
    "Content & Creation": "コンテンツ・制作",
    "Time & Date": "日時",
    "Generators": "ジェネレーター",
    "Analysis Tools": "分析ツール",
    "All Tools": "すべてのツール",
    "Use Tool": "ツールを使う",
    "Get Started": "使ってみる",
    "Use for Free": "無料で使う",
    "Frequently Asked Questions": "よくある質問",
    "How to Use": "使い方",
    "Features": "機能",
    "Result": "結果",
    "Input": "入力",
    "Clear": "クリア",
    "Reset": "リセット",
    "Copy": "コピー",
    "Download": "ダウンロード",
    "Upload File": "ファイルをアップロード",
    "Choose File": "ファイルを選択",
    "Drop a file here": "ここにファイルをドロップ",
    "Run": "実行",
    "Convert": "変換",
    "Generate": "生成",
    "Analyze": "分析",
    "Add": "追加",
    "Remove": "削除",
    "Example": "例",
    "Error": "エラー",
    "Enter content": "内容を入力してください",
    "Complete": "完了",
    "Copied": "コピーしました",
    "No upload required": "アップロード不要",
    "Runs entirely in your browser": "ブラウザ内だけで処理",
    "Your data never leaves your device": "データは端末外へ送信されません",
    "All processing happens locally in your browser": "すべての処理はブラウザ内で完結します",
    "Traditional Chinese": "繁體中文",
    "English": "English",
    "Japanese": "日本語",
    "Free Local Tool": "無料・ブラウザ内処理",
    "No uploads": "アップロードなし",
    "Mobile-friendly": "スマートフォン対応",
    "Theme support": "テーマ切替対応",
    "Last updated:": "最終更新:",
}


def normalize(value: str) -> str:
    return SPACE_RE.sub(" ", value).strip()


def should_translate(value: str | None) -> bool:
    if not value:
        return False
    clean = normalize(value)
    if not clean or URL_RE.match(clean) or CODEISH_RE.search(clean):
        return False
    if not LATIN_RE.search(clean):
        return False
    if len(clean) <= 8 and re.fullmatch(r"[A-Z0-9.+#/_-]+", clean):
        return False
    return True


def page_files() -> list[tuple[str, Path]]:
    pages: list[tuple[str, Path]] = []
    for path in sorted(EN_ROOT.rglob("index.html")):
        rel = path.relative_to(EN_ROOT)
        slug = "" if rel == Path("index.html") else rel.parent.as_posix()
        pages.append((slug, path))
    if len(pages) != EXPECTED_PAGES:
        raise RuntimeError(f"Expected {EXPECTED_PAGES} English pages, found {len(pages)}")
    return pages


def collect_dictionary_values(script_text: str, phrases: set[str]) -> None:
    marker = "window.ToolHubI18nDictionary="
    start = script_text.find(marker)
    if start < 0:
        return
    payload = script_text[start + len(marker):].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    try:
        mapping = json.loads(payload)
    except json.JSONDecodeError:
        return
    for value in mapping.values():
        if isinstance(value, str) and should_translate(value):
            phrases.add(normalize(value))


def collect_jsonld_values(value, phrases: set[str]) -> None:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {"url", "@id", "contentUrl", "image"}:
                continue
            collect_jsonld_values(item, phrases)
    elif isinstance(value, list):
        for item in value:
            collect_jsonld_values(item, phrases)
    elif isinstance(value, str) and should_translate(value):
        phrases.add(normalize(value))


def collect_phrases_from_html(text: str, phrases: set[str]) -> None:
    soup = BeautifulSoup(text, "html.parser")
    skip = {"script", "style", "code", "pre", "textarea", "noscript"}
    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or not node.parent or node.parent.name in skip:
            continue
        clean = normalize(str(node))
        if should_translate(clean) and len(clean) <= 1600:
            phrases.add(clean)
    for tag in soup.find_all(True):
        for attr in ("title", "placeholder", "aria-label", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and should_translate(value) and len(value) <= 1600:
                phrases.add(normalize(value))
        if tag.name == "meta":
            key = (tag.get("name") or tag.get("property") or "").lower()
            if key in {"description", "og:title", "og:description", "twitter:title", "twitter:description"}:
                value = tag.get("content")
                if isinstance(value, str) and should_translate(value):
                    phrases.add(normalize(value))
        if tag.name == "script":
            body = tag.string or tag.get_text() or ""
            if tag.get("type") == "application/ld+json":
                try:
                    collect_jsonld_values(json.loads(body), phrases)
                except (json.JSONDecodeError, TypeError):
                    pass
            else:
                collect_dictionary_values(body, phrases)


def collect_all_phrases(pages: list[tuple[str, Path]]) -> set[str]:
    phrases = set(MANUAL)
    for _, path in pages:
        collect_phrases_from_html(path.read_text(encoding="utf-8"), phrases)
    for name in ("header-en.html", "sidebar-en.html", "footer-en.html"):
        collect_phrases_from_html((ROOT / "components" / name).read_text(encoding="utf-8"), phrases)
    return phrases


def translate_missing(mapping: dict[str, str], phrases: set[str]) -> None:
    missing = sorted(value for value in phrases if value not in mapping and should_translate(value))
    if not missing:
        return
    sample = " | ".join(missing[:5])
    raise RuntimeError(
        f"Japanese translation cache is incomplete: {len(missing)} phrases remain. "
        f"Merge the reviewed agent translation shards before building. Sample: {sample}"
    )


def translated(value: str, mapping: dict[str, str]) -> str:
    clean = normalize(value)
    if not should_translate(clean):
        return value
    result = mapping.get(clean, clean)
    leading = value[:len(value) - len(value.lstrip())]
    trailing = value[len(value.rstrip()):]
    return leading + result + trailing


def ja_path(value: str) -> str:
    if not value:
        return value
    if value == "/en" or value == "/en/":
        return "/ja/"
    if value.startswith("/en/"):
        return "/ja/" + value[4:]
    if value == SITE + "/en" or value == SITE + "/en/":
        return SITE + "/ja/"
    if value.startswith(SITE + "/en/"):
        return SITE + "/ja/" + value[len(SITE) + 4:]
    return value


def page_url(slug: str, locale: str) -> str:
    suffix = "/" if not slug else f"/{slug}/"
    prefix = "" if locale == "zh-Hant" else f"/{locale}"
    return SITE + prefix + suffix


def translate_jsonld(value, mapping: dict[str, str]):
    if isinstance(value, dict):
        output = {}
        for key, item in value.items():
            if key == "inLanguage":
                output[key] = "ja"
            else:
                output[key] = translate_jsonld(item, mapping)
        return output
    if isinstance(value, list):
        return [translate_jsonld(item, mapping) for item in value]
    if isinstance(value, str):
        localized = ja_path(value)
        if localized != value:
            return localized
        return mapping.get(normalize(value), value) if should_translate(value) else value
    return value


def translate_soup(
    soup: BeautifulSoup,
    mapping: dict[str, str],
    component: bool = False,
    slug: str = "",
) -> None:
    skip = {"script", "style", "code", "pre", "textarea", "noscript"}
    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or not node.parent or node.parent.name in skip:
            continue
        if should_translate(str(node)):
            node.replace_with(translated(str(node), mapping))
    for tag in soup.find_all(True):
        for attr in ("title", "placeholder", "aria-label", "alt"):
            value = tag.get(attr)
            if isinstance(value, str) and should_translate(value):
                tag[attr] = translated(value, mapping)
        if tag.name == "a" and isinstance(tag.get("href"), str):
            tag["href"] = ja_path(tag["href"])
        if tag.name == "meta":
            key = (tag.get("name") or tag.get("property") or "").lower()
            value = tag.get("content")
            if key in {"description", "og:title", "og:description", "twitter:title", "twitter:description"} and isinstance(value, str):
                tag["content"] = translated(value, mapping)
    if component:
        return
    for script in soup.find_all("script"):
        if script.get("type") == "application/ld+json":
            try:
                script.string = json.dumps(
                    translate_jsonld(json.loads(script.string or script.get_text()), mapping),
                    ensure_ascii=False,
                    separators=(",", ":"),
                )
            except (json.JSONDecodeError, TypeError):
                pass
            continue
        src = script.get("src") or ""
        if src.split("?", 1)[0] == "/components/i18n-runtime.js":
            script["src"] = "/components/i18n-runtime-ja.js?v=20260913-1"
        body = script.string or script.get_text() or ""
        marker = "window.ToolHubI18nDictionary="
        if marker in body:
            start = body.find(marker)
            payload = body[start + len(marker):].strip()
            if payload.endswith(";"):
                payload = payload[:-1]
            try:
                source_dictionary = json.loads(payload)
                target_dictionary = {
                    key: mapping.get(normalize(value), value) if isinstance(value, str) and should_translate(value) else value
                    for key, value in source_dictionary.items()
                }
                script.string = marker + json.dumps(target_dictionary, ensure_ascii=False, separators=(",", ":")) + ";"
                body = script.string
            except json.JSONDecodeError:
                pass
        replaced = body.replace("/components/header-en.html", "/components/header-ja.html")
        replaced = replaced.replace("/components/sidebar-en.html", "/components/sidebar-ja.html")
        replaced = replaced.replace("/components/footer-en.html", "/components/footer-ja.html")
        replaced = replaced.replace("'header-en.html'", "'header-ja.html'").replace('"header-en.html"', '"header-ja.html"')
        replaced = replaced.replace("'sidebar-en.html'", "'sidebar-ja.html'").replace('"sidebar-en.html"', '"sidebar-ja.html"')
        replaced = replaced.replace("'footer-en.html'", "'footer-ja.html'").replace('"footer-en.html"', '"footer-ja.html"')
        if slug == "svg-studio":
            replaced = replaced.replace("let currentLang = 'en';", "let currentLang = 'zh-TW';")
            replaced = replaced.replace("currentLang = 'en';", "currentLang = 'zh-TW';")
            replaced = replaced.replace("document.documentElement.lang = lang;", "document.documentElement.lang = 'ja';")
        if slug == "css-gradient-generator":
            replaced = replaced.replace("document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';", "document.documentElement.lang = 'ja';")
        if slug == "sdxl-prompt-builder":
            replaced = replaced.replace("let currentLang = 'en';", "let currentLang = 'zh';")
        if replaced != body:
            script.string = replaced


def remove_seo_links(soup: BeautifulSoup) -> None:
    for link in list(soup.find_all("link")):
        rel = [str(item).lower() for item in (link.get("rel") or [])]
        if "canonical" in rel or ("alternate" in rel and link.get("hreflang")):
            link.decompose()


def set_meta(soup: BeautifulSoup, key: str, value: str, content: str) -> None:
    tag = soup.find("meta", attrs={key: value})
    if tag:
        tag["content"] = content


def build_components(mapping: dict[str, str]) -> None:
    for name in ("header", "sidebar", "footer"):
        source = ROOT / "components" / f"{name}-en.html"
        soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
        translate_soup(soup, mapping, component=True)
        for button in soup.select("[data-language-switch]"):
            button["title"] = "繁體中文に切り替え"
            button["aria-label"] = "繁體中文に切り替え"
            label = button.select_one("[data-language-switch-label]")
            if label:
                label.string = "繁體中文"
        target = ROOT / "components" / f"{name}-ja.html"
        target.write_text(str(soup), encoding="utf-8")


def build_page(slug: str, source: Path, mapping: dict[str, str]) -> None:
    soup = BeautifulSoup(source.read_text(encoding="utf-8"), "html.parser")
    soup.html["lang"] = "ja"
    if soup.body:
        soup.body["data-locale"] = "ja"
    translate_soup(soup, mapping, slug=slug)

    remove_seo_links(soup)
    zh_url = page_url(slug, "zh-Hant")
    en_url = page_url(slug, "en")
    ja_url = page_url(slug, "ja")
    soup.head.append(soup.new_tag("link", rel="canonical", href=ja_url))
    soup.head.append(soup.new_tag("link", rel="alternate", hreflang="zh-Hant", href=zh_url))
    soup.head.append(soup.new_tag("link", rel="alternate", hreflang="en", href=en_url))
    soup.head.append(soup.new_tag("link", rel="alternate", hreflang="ja", href=ja_url))
    soup.head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=en_url))
    set_meta(soup, "property", "og:url", ja_url)
    set_meta(soup, "property", "og:locale", "ja_JP")

    target = JA_ROOT / (slug if slug else "") / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    rendered = re.sub(r"<!doctype\s+html>\s*", "", str(soup), flags=re.I)
    target.write_text("<!DOCTYPE html>\n" + rendered.lstrip(), encoding="utf-8")


def main() -> None:
    pages = page_files()
    mapping: dict[str, str] = {}
    if CACHE_FILE.is_file():
        mapping.update(json.loads(CACHE_FILE.read_text(encoding="utf-8")))
    mapping.update(MANUAL)
    phrases = collect_all_phrases(pages)
    translate_missing(mapping, phrases)
    CACHE_FILE.write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")
    build_components(mapping)
    for index, (slug, source) in enumerate(pages, 1):
        build_page(slug, source, mapping)
        if index % 50 == 0:
            print(f"Built {index}/{len(pages)} Japanese pages", flush=True)
    print(f"Done: {len(pages)} Japanese pages ({EXPECTED_TOOLS} tools + 6 core/trust pages).", flush=True)


if __name__ == "__main__":
    main()
