#!/usr/bin/env python3
"""Refresh the site's data files before a deploy.

- assets/contributions.json: the public GitHub contribution calendar. It counts
  private contributions too (as numbers only), including work in SSO-protected
  organizations that the API can't see without an authorized token.
- assets/releases.json: the latest release tag of each project on the page.

The page only reads these same-origin files, so it never calls GitHub from the
browser. A failed fetch keeps the file that is already there.
"""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

USER = "miladbeigi"
REPOS = ["vaultui", "glimpse", "penhan", "claude-usage-bar"]
ASSETS = Path(__file__).resolve().parent.parent / "assets"


def get(url, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": "milad.cloud-refresh", **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode()


def contributions():
    html = get(f"https://github.com/users/{USER}/contributions")
    tips = dict(re.findall(r'for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)', html))
    days = []
    for cell in re.findall(r"<td[^>]*contribution-day-component[^>]*>", html):
        date = re.search(r'data-date="([\d-]+)"', cell)
        cid = re.search(r'id="(contribution-day-component-\d+-\d+)"', cell)
        level = re.search(r'data-level="(\d)"', cell)
        if not (date and cid and level):
            continue
        count = re.match(r"(\d+) contribution", tips.get(cid.group(1), ""))
        days.append([date.group(1), int(count.group(1)) if count else 0, int(level.group(1))])
    days.sort()
    if len(days) < 300:
        raise RuntimeError(f"expected about a year of days, got {len(days)}; the page layout may have changed")
    total = sum(d[1] for d in days)
    (ASSETS / "contributions.json").write_text(json.dumps({"total": total, "days": days}, separators=(",", ":")))
    print(f"contributions.json: {len(days)} days, {total} contributions ({days[0][0]} to {days[-1][0]})")


def releases():
    path = ASSETS / "releases.json"
    tags = json.loads(path.read_text()) if path.exists() else {}
    headers = {"Accept": "application/vnd.github+json"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    for repo in REPOS:
        try:
            tags[repo] = json.loads(get(f"https://api.github.com/repos/{USER}/{repo}/releases/latest", headers))["tag_name"]
        except Exception as err:  # keep the previous tag
            print(f"releases: {repo}: {err}", file=sys.stderr)
    path.write_text(json.dumps(tags, indent=2) + "\n")
    print(f"releases.json: {tags}")


failed = False
for step in (contributions, releases):
    try:
        step()
    except Exception as err:
        failed = True
        print(f"{step.__name__}: {err}", file=sys.stderr)
sys.exit(1 if failed else 0)
