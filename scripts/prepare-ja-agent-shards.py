#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import shutil
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / "i18n-ja-cache.json"
OUT = ROOT / "scripts" / "ja-agent-shards"
TRUSTED_CACHE_COUNT = 13597


def main() -> None:
    current = json.loads(CACHE.read_text(encoding="utf-8"))
    if len(current) < TRUSTED_CACHE_COUNT:
        raise RuntimeError(
            f"Japanese cache unexpectedly has only {len(current)} entries; "
            f"expected at least {TRUSTED_CACHE_COUNT}."
        )

    backup = Path(tempfile.gettempdir()) / "toolhub-i18n-ja-cache-before-agent-rebuild.json"
    shutil.copy2(CACHE, backup)
    trusted = dict(list(current.items())[:TRUSTED_CACHE_COUNT])

    spec = importlib.util.spec_from_file_location(
        "toolhub_japanese_builder", ROOT / "scripts" / "build-japanese-site.py"
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Japanese site builder")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)

    pages = builder.page_files()
    phrases = builder.collect_all_phrases(pages)
    missing = sorted(
        (
            phrase
            for phrase in phrases
            if phrase not in trusted and builder.should_translate(phrase)
        ),
        key=lambda value: (-len(value), value),
    )

    shards: list[list[str]] = [[], [], []]
    sizes = [0, 0, 0]
    for phrase in missing:
        target = min(range(3), key=sizes.__getitem__)
        shards[target].append(phrase)
        sizes[target] += len(phrase)

    CACHE.write_text(
        json.dumps(trusted, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    OUT.mkdir(exist_ok=True)
    for index, shard in enumerate(shards, 1):
        payload = {str(item_index): value for item_index, value in enumerate(shard)}
        (OUT / f"part-{index}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    base_shards: list[list[str]] = [[], [], []]
    base_sizes = [0, 0, 0]
    for phrase in sorted(trusted, key=lambda value: (-len(value), value)):
        target = min(range(3), key=base_sizes.__getitem__)
        base_shards[target].append(phrase)
        base_sizes[target] += len(phrase)
    for index, shard in enumerate(base_shards, 1):
        payload = {str(item_index): value for item_index, value in enumerate(shard)}
        (OUT / f"base-{index}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    print(f"CACHE_KEPT={len(trusted)}")
    print(f"MISSING={len(missing)}")
    print(f"SHARD_COUNTS={','.join(str(len(shard)) for shard in shards)}")
    print(f"SHARD_CHARS={','.join(str(size) for size in sizes)}")
    print(f"BASE_COUNTS={','.join(str(len(shard)) for shard in base_shards)}")
    print(f"BASE_CHARS={','.join(str(size) for size in base_sizes)}")
    print(f"BACKUP={backup}")


if __name__ == "__main__":
    main()
