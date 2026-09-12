#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "scripts" / "i18n-ja-cache.json"
SHARDS = ROOT / "scripts" / "ja-agent-shards"


def load_object(path: Path) -> dict[str, str]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not all(
        isinstance(key, str) and isinstance(value, str) for key, value in payload.items()
    ):
        raise RuntimeError(f"Expected a string-to-string JSON object: {path}")
    return payload


def main() -> None:
    cache = load_object(CACHE)
    added = 0
    identical = 0
    for family in ("base", "part"):
        for index in range(1, 4):
            source_path = SHARDS / f"{family}-{index}.json"
            translated_path = SHARDS / f"{family}-{index}-ja.json"
            if not translated_path.is_file():
                raise RuntimeError(
                    f"Missing reviewed translation shard: {translated_path}"
                )
            source = load_object(source_path)
            translated = load_object(translated_path)
            if family == "base" and index == 3:
                for split_name in ("mid", "tail"):
                    split_path = SHARDS / f"base-3-{split_name}-ja.json"
                    if not split_path.is_file():
                        raise RuntimeError(
                            f"Missing reviewed base-3 split translation: {split_path}"
                        )
                    translated.update(load_object(split_path))
            if source.keys() != translated.keys():
                missing = list(source.keys() - translated.keys())[:10]
                extra = list(translated.keys() - source.keys())[:10]
                raise RuntimeError(
                    f"{family} shard {index} key mismatch: "
                    f"missing={missing}, extra={extra}"
                )
            for key, english in source.items():
                japanese = translated[key].strip()
                if not japanese:
                    raise RuntimeError(
                        f"{family} shard {index} has a blank translation at key {key}"
                    )
                if japanese.startswith("__TODO__"):
                    raise RuntimeError(
                        f"{family} shard {index} still has TODO translation at key {key}"
                    )
                if japanese == english:
                    identical += 1
                cache[english] = japanese
                added += 1
            print(f"{family.upper()}_{index}_MERGED={len(source)}")

    CACHE.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"AGENT_TRANSLATIONS_MERGED={added}")
    print(f"IDENTICAL_TRANSLATIONS={identical}")
    print(f"CACHE_ENTRIES={len(cache)}")


if __name__ == "__main__":
    main()
