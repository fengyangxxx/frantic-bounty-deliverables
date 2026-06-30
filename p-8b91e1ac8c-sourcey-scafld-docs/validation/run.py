import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone


inputs = {
    "public_url": os.environ.get("RUNX_INPUT_PUBLIC_URL", ""),
    "parent_url": os.environ.get("RUNX_INPUT_PARENT_URL", ""),
    "repo_url": os.environ.get("RUNX_INPUT_REPO_URL", ""),
    "commit": os.environ.get("RUNX_INPUT_COMMIT", ""),
    "min_pages": int(os.environ.get("RUNX_INPUT_MIN_PAGES", "20")),
}

failures = []
observations = []


def fetch_text(url, accept="text/html,application/json,text/plain;q=0.9,*/*;q=0.8"):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "frantic33-sourcey-docs-validation/0.1",
            "Accept": accept,
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.status, response.read().decode("utf-8", errors="replace")


def fetch_json(url):
    status, body = fetch_text(url, "application/vnd.github+json")
    return status, json.loads(body)


def title_of(html):
    match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    return match.group(1) if match else ""


def generator_of(html):
    match = re.search(r'<meta name="generator" content="([^"]+)"', html, re.I)
    return match.group(1) if match else ""


def package_links(html):
    links = re.findall(r'href="([^"]+)"', html)
    filtered = sorted({link for link in links if link.startswith("/scafld/docs/go-api/pkg-")})
    return filtered


def github_api_url(repo_url, suffix=""):
    match = re.match(r"^https://github\.com/([^/]+)/([^/]+)/?$", repo_url)
    if not match:
        raise RuntimeError(f"unsupported repo_url: {repo_url}")
    return f"https://api.github.com/repos/{match.group(1)}/{match.group(2)}{suffix}"


for name in ["public_url", "parent_url", "repo_url", "commit"]:
    if not inputs[name].strip():
        failures.append(f"{name} is required")
if inputs["min_pages"] < 1:
    failures.append("min_pages must be positive")

try:
    if not failures:
        status, public_html = fetch_text(inputs["public_url"])
        public_title = title_of(public_html)
        public_generator = generator_of(public_html)
        links = package_links(public_html)
        if status != 200:
            failures.append(f"public_url status {status}")
        if not re.search(r"Sourcey\s+3\.", public_generator):
            failures.append(f"public_url generator missing Sourcey marker: {public_generator or 'none'}")
        if len(links) < inputs["min_pages"]:
            failures.append(f"Sourcey package page count {len(links)} below {inputs['min_pages']}")
        observations.append(
            {
                "id": "public_url_sourcey_site",
                "url": inputs["public_url"],
                "status": status,
                "title": public_title,
                "generator": public_generator,
                "package_page_count": len(links),
                "sample_pages": [f"https://0state.com{link}" for link in links[:12]],
            }
        )

        status, parent_html = fetch_text(inputs["parent_url"])
        parent_has_repo = "https://github.com/nilstate/scafld" in parent_html
        parent_has_docs = "/scafld/docs" in parent_html
        if status != 200:
            failures.append(f"parent_url status {status}")
        if not parent_has_repo:
            failures.append("parent_url does not link target repo")
        if not parent_has_docs:
            failures.append("parent_url does not link docs area")
        observations.append(
            {
                "id": "parent_domain_project_home",
                "url": inputs["parent_url"],
                "status": status,
                "title": title_of(parent_html),
                "links_target_repo": parent_has_repo,
                "links_docs_area": parent_has_docs,
            }
        )

        status, repo = fetch_json(github_api_url(inputs["repo_url"]))
        if status != 200:
            failures.append(f"repo API status {status}")
        if repo.get("full_name") != "nilstate/scafld":
            failures.append(f"unexpected repo {repo.get('full_name')}")
        if repo.get("license", {}).get("spdx_id") != "MIT":
            failures.append(f"unexpected license {repo.get('license', {}).get('spdx_id')}")
        observations.append(
            {
                "id": "target_repo_metadata",
                "repo_url": inputs["repo_url"],
                "full_name": repo.get("full_name"),
                "license": repo.get("license", {}).get("spdx_id"),
                "pushed_at": repo.get("pushed_at"),
                "description": repo.get("description"),
            }
        )

        status, commit = fetch_json(github_api_url(inputs["repo_url"], f"/commits/{inputs['commit']}"))
        if status != 200:
            failures.append(f"commit API status {status}")
        if commit.get("sha") != inputs["commit"]:
            failures.append(f"commit mismatch {commit.get('sha')}")
        observations.append(
            {
                "id": "pinned_commit",
                "repo_url": inputs["repo_url"],
                "commit": commit.get("sha"),
                "commit_date": commit.get("commit", {}).get("committer", {}).get("date"),
                "commit_message": (commit.get("commit", {}).get("message", "").split("\n")[0]),
            }
        )

        sample_urls = [
            "https://0state.com/scafld/docs/go-api/pkg-internal-core-receipt",
            "https://0state.com/scafld/docs/go-api/pkg-internal-app-validate",
            "https://0state.com/scafld/docs/go-api/pkg-internal-adapters-cli-config",
        ]
        sample_pages = []
        for url in sample_urls:
            page_status, html = fetch_text(url)
            generator = generator_of(html)
            if page_status != 200 or not re.search(r"Sourcey\s+3\.", generator):
                failures.append(f"sample page failed {url}")
            sample_pages.append(
                {
                    "url": url,
                    "status": page_status,
                    "title": title_of(html),
                    "generator": generator,
                    "length": len(html),
                }
            )
        observations.append({"id": "live_docs_spot_checks", "pages": sample_pages})
except Exception as exc:
    failures.append(str(exc))

result = {
    "ok": not failures,
    "checked_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "inputs": inputs,
    "observations": observations,
    "failures": failures,
}
print(json.dumps(result, indent=2, ensure_ascii=False))
if failures:
    sys.exit(1)
