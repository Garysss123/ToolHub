#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / "i18n-ja-cache.json"
JP_RE = re.compile(r"[\u3040-\u30ff\u3400-\u9fff]")
LONG_WORDS_RE = re.compile(r"\b[A-Za-z][A-Za-z0-9+'’.-]*(?:\s+[A-Za-z][A-Za-z0-9+'’.-]*){5,}\b")


def load_builder():
    spec = importlib.util.spec_from_file_location(
        "toolhub_japanese_builder", ROOT / "scripts" / "build-japanese-site.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Japanese builder")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    builder = load_builder()
    cache = json.loads(CACHE.read_text(encoding="utf-8"))
    phrases = builder.collect_all_phrases(builder.page_files())
    required = sorted(value for value in phrases if builder.should_translate(value))
    missing = [value for value in required if value not in cache]
    blank = [value for value in required if not str(cache.get(value, "")).strip()]
    replacement = [value for value in required if "�" in str(cache.get(value, ""))]
    todo = [
        value
        for value in required
        if str(cache.get(value, "")).lstrip().startswith("__TODO__")
    ]
    identical_long = [
        value
        for value in required
        if len(value) >= 30
        and cache.get(value) == value
        and LONG_WORDS_RE.search(value)
        and not builder.CODEISH_RE.search(value)
    ]
    latin_only_long = [
        value
        for value in required
        if len(value) >= 45
        and LONG_WORDS_RE.search(str(cache.get(value, "")))
        and not JP_RE.search(str(cache.get(value, "")))
        and not builder.CODEISH_RE.search(value)
    ]

    print(f"TRANSLATION_REQUIRED={len(required)}")
    print(f"TRANSLATION_CACHE_ENTRIES={len(cache)}")
    print(f"TRANSLATION_MISSING={len(missing)}")
    print(f"TRANSLATION_BLANK={len(blank)}")
    print(f"TRANSLATION_REPLACEMENT_CHARS={len(replacement)}")
    print(f"TRANSLATION_TODO={len(todo)}")
    print(f"TRANSLATION_IDENTICAL_LONG={len(identical_long)}")
    print(f"TRANSLATION_LATIN_ONLY_LONG={len(latin_only_long)}")
    for label, values in (
        ("IDENTICAL", identical_long),
        ("LATIN_ONLY", latin_only_long),
    ):
        for value in values[:20]:
            print(f"{label}_SAMPLE={value[:240]}")

    failures = len(missing) + len(blank) + len(replacement) + len(todo)
    print(f"TRANSLATION_HARD_FAILURES={failures}")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
