#!/usr/bin/env python3
"""Install accessibility and first-party pageview snippets on every archive HTML page."""
from pathlib import Path
import re
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]
patched = 0
removed_links = 0
for path in sorted(root.glob("*.html")):
    if re.fullmatch(r"google[0-9a-f]+\.html", path.name, re.I):
        continue
    contents = path.read_text(encoding="utf-8")
    updated = contents
    if 'src="site-tools.js"' not in updated:
        updated = re.sub(r"</head\s*>", '<script src="site-tools.js" defer></script>\n</head>', updated, count=1, flags=re.I)

    def remove_official_org_link(match):
        global removed_links
        href = match.group("href")
        hostname = urlsplit(href).hostname or ""
        hostname = hostname.lower().removeprefix("www.")
        if hostname in {
            "bbbsa.org", "bbbsaz.org", "bbbscaz.org", "bbbs.org",
            "bigbrothersbigsisters.org", "bbbsa.com", "bbbscaz.com",
            "bigbrothersbigsisters.com"
        }:
            removed_links += 1
            return match.group("inner")
        return match.group(0)

    updated = re.sub(
        r'<a\b[^>]*?href=["\'](?P<href>https?://[^"\']+)["\'][^>]*>(?P<inner>.*?)</a>',
        remove_official_org_link, updated, flags=re.I | re.S
    )
    if updated != contents:
        path.write_text(updated, encoding="utf-8")
        patched += 1

print(f"Updated {patched} HTML files; removed {removed_links} outbound organization links.")
