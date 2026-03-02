#!/usr/bin/env python3
import datetime as dt
import json
import re
import urllib.request
from pathlib import Path


USERNAME = "rsasaki0109"
SOURCE_URL = f"https://r.jina.ai/http://x.com/{USERNAME}"
OUTPUT_PATH = Path(__file__).resolve().parents[2] / "data" / "tweets.json"
JS_OUTPUT_PATH = Path(__file__).resolve().parents[2] / "data" / "tweets.js"
MAX_POSTS = 6


def _fetch_markdown():
    request = urllib.request.Request(
        SOURCE_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; rsasaki0109-page-updater/1.0)",
            "Accept": "text/plain, text/html",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="ignore")


def _to_readable_date(raw_date):
    try:
        parsed = dt.datetime.strptime(raw_date, "%b %d, %Y")
    except ValueError:
        return raw_date
    return parsed.strftime("%Y-%m-%d")


def _clean(text):
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _shorten(text, limit=120):
    if len(text) <= limit:
        return text
    return f"{text[: limit - 1].rstrip()}…"


def _parse_posts(markdown):
    date_pattern = re.compile(
        rf"\[(?P<date>[A-Za-z]{{3}} \d{{1,2}}, \d{{4}})\]\((?P<url>https?://(?:x|twitter)\.com/{USERNAME}/status/\d+)\)"
    )
    matches = list(date_pattern.finditer(markdown))
    posts = []

    for i, current in enumerate(matches[:MAX_POSTS]):
        start = current.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(markdown)
        block = markdown[start:end]
        lines = [line.strip() for line in block.splitlines()]

        image = ""
        description_lines = []
        got_description = False

        for line in lines:
            if line.startswith("![Image "):
                image_match = re.search(r"\(([^)]+)\)", line)
                if image_match and not image:
                    image = image_match.group(1)
                continue

            if not line:
                continue

            if line == "·" or line == "Reload" or line.startswith("The media could not be played."):
                continue

            if re.fullmatch(r"\d{1,2}:\d{2}", line):
                if got_description:
                    break
                continue

            if re.fullmatch(r"\d+", line):
                if got_description:
                    break
                continue

            if re.fullmatch(r"\[rsasaki0109\]\([^)]*\)", line):
                continue
            if re.fullmatch(r"\[@rsasaki0109\]\([^)]*\)", line):
                continue
            if line.startswith(f"[{USERNAME}]("):
                continue

            description_lines.append(line)
            got_description = True

            if len(description_lines) >= 2:
                break

        if not description_lines:
            continue

        description = _clean(" ".join(description_lines))
        if not description:
            continue

        posts.append(
            {
                "url": current.group("url"),
                "date": _to_readable_date(current.group("date")),
                "text": _shorten(description, 52),
                "desc": _shorten(description, 220),
                "image": image,
            }
        )

    return posts


def _load_existing():
    if not OUTPUT_PATH.exists():
        return []
    try:
        return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _same_posts(existing, new):
    return json.dumps(existing, ensure_ascii=False, sort_keys=True) == json.dumps(
        new, ensure_ascii=False, sort_keys=True
    )


def main():
    try:
        markdown = _fetch_markdown()
    except Exception as exc:
        print(f"fetch failed: {exc}")
        return

    posts = _parse_posts(markdown)
    if not posts:
        print("No posts parsed.")
        return

    payload = {
        "updated_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": posts,
    }

    existing = _load_existing()
    if isinstance(existing, list):
        wrapped_existing = existing
    elif isinstance(existing, dict):
        wrapped_existing = existing.get("items", [])
    else:
        wrapped_existing = []

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    if not _same_posts(wrapped_existing, posts):
        OUTPUT_PATH.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Updated {OUTPUT_PATH}: {len(posts)} items.")
    else:
        print("No update needed.")

    js_blob = f"window.__TWEETS_CACHE__ = {json.dumps(payload, ensure_ascii=False)};\n"
    JS_OUTPUT_PATH.write_text(js_blob, encoding="utf-8")


if __name__ == "__main__":
    main()
