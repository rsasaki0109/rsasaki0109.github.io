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


def _parse_for_sort(raw_date):
    try:
        return dt.datetime.strptime(raw_date, "%b %d, %Y")
    except ValueError:
        try:
            return dt.datetime.strptime(raw_date, "%Y-%m-%d")
        except ValueError:
            return dt.datetime.min


def _clean(text):
    text = re.sub(r"\bPCF_LABEL_NONE\b", "", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[\]\([^)]+\)", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _shorten(text, limit=120):
    if len(text) <= limit:
        return text
    return f"{text[: limit - 1].rstrip()}…"


def _extract_tweet_id(url):
    match = re.search(r"/status/([0-9]+)", url)
    if match:
        return match.group(1)
    return ""


def _to_int(value):
    if isinstance(value, bool):
        return 0
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        digits = re.sub(r"[^0-9]", "", value)
        if digits:
            try:
                return int(digits)
            except ValueError:
                return 0
    return 0


def _pick_best_mp4(formats):
    candidates = []
    for item in formats:
        if not isinstance(item, dict):
            continue

        media_url = item.get("url")
        if not media_url:
            continue

        if any(ext in media_url for ext in [".m3u8", ".m3u"]):
            continue

        container = item.get("container")
        content_type = item.get("content_type") or ""
        if container == "mp4" or "video/mp4" in content_type or media_url.endswith(".mp4"):
            bitrate = item.get("bitrate", 0) or 0
            candidates.append((bitrate, media_url))

    if candidates:
        return max(candidates, key=lambda value: value[0])[1]

    return ""


def _extract_metrics(tweet_payload):
    if not isinstance(tweet_payload, dict):
        return {}

    return {
        "likes": _to_int(tweet_payload.get("likes")),
        "retweets": _to_int(tweet_payload.get("retweets")),
        "impressions": _to_int(tweet_payload.get("views")),
    }


def _fetch_tweet_details(tweet_url):
    tweet_id = _extract_tweet_id(tweet_url)
    if not tweet_id:
        return None

    endpoint = f"https://api.fxtwitter.com/i/status/{tweet_id}"
    request = urllib.request.Request(
        endpoint,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; rsasaki0109-page-updater/1.0)",
            "Accept": "application/json",
        },
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8", errors="ignore"))

    tweet_payload = payload.get("tweet", {})
    media_data = tweet_payload.get("media")
    details = {
        "metrics": _extract_metrics(tweet_payload),
        "media": None,
    }
    if not isinstance(media_data, dict):
        return details

    items = media_data.get("all")
    if not isinstance(items, list):
        return details

    for item in items:
        if not isinstance(item, dict):
            continue

        media_type = (item.get("type") or "").lower()
        if media_type in {"video", "animated_gif", "gif"}:
            source = _pick_best_mp4(item.get("formats") or item.get("variants") or [])
            if not source:
                source = item.get("url") if item.get("url", "").endswith(".mp4") else ""
            if source:
                details["media"] = {
                    "type": media_type if media_type != "animated_gif" else "gif",
                    "url": source,
                    "poster": item.get("thumbnail_url", ""),
                    "duration": item.get("duration"),
                    "content_type": "video/mp4",
                }
                return details

        if media_type in {"photo", "image"}:
            url = item.get("url") or item.get("thumbnail_url", "")
            if url:
                details["media"] = {
                    "type": "image",
                    "url": url,
                    "poster": "",
                }
                return details

    return details


def _parse_posts(markdown):
    date_pattern = re.compile(
        rf"\[(?P<date>[A-Za-z]{{3}} \d{{1,2}}, \d{{4}})\]\((?P<url>https?://(?:x|twitter)\.com/{USERNAME}/status/\d+)\)"
    )
    matches = list(date_pattern.finditer(markdown))
    posts = []

    for i, current in enumerate(matches[:MAX_POSTS]):
        sortable_date = _parse_for_sort(current.group("date"))
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

        metrics = {}
        try:
            details = _fetch_tweet_details(current.group("url"))
        except Exception:
            details = None

        media = details.get("media") if isinstance(details, dict) else None
        metrics = details.get("metrics") if isinstance(details, dict) else {}

        if media is None and image:
            media = {"type": "image", "url": image, "poster": ""}

        posts.append(
            (
                sortable_date,
                {
                    "url": current.group("url"),
                    "date": _to_readable_date(current.group("date")),
                    "text": _shorten(description, 52),
                    "desc": _shorten(description, 220),
                    "image": image,
                    "media": media,
                    "metrics": metrics,
                }
            )
        )

    return [post for _, post in sorted(posts, key=lambda item: item[0], reverse=True)]


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
