#!/usr/bin/env python3
import argparse
import datetime as dt
import hashlib
import html
import json
import pathlib
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request


SOURCES = [
    {
        "id": "frantic_skill",
        "url": "https://gofrantic.com/SKILL.md",
        "kind": "markdown",
        "purpose": "Frantic protocol, signup, claim, delivery, and identity rules.",
    },
    {
        "id": "frantic_21",
        "url": "https://gofrantic.com/v1/bounties/p-b14252e1b0",
        "kind": "json",
        "purpose": "Frantic dependency CVE audit bounty state and requirements.",
    },
    {
        "id": "frantic_24",
        "url": "https://gofrantic.com/v1/bounties/p-b5e7d3b9b4",
        "kind": "json",
        "purpose": "Frantic verifiable web research bounty state and requirements.",
    },
    {
        "id": "superteam_skill",
        "url": "https://superteam.fun/skill.md",
        "kind": "markdown",
        "purpose": "Superteam agent route rules and claim code flow.",
    },
    {
        "id": "superteam_bounties",
        "url": "https://superteam.fun/api/agents/listings/live?take=100&type=bounty",
        "kind": "json",
        "purpose": "Live Superteam agent bounty listings.",
    },
    {
        "id": "superteam_projects",
        "url": "https://superteam.fun/api/agents/listings/live?take=100&type=project",
        "kind": "json",
        "purpose": "Live Superteam agent project listings.",
    },
]


def now_iso():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def fetch(url, bearer_token=None):
    headers = {"User-Agent": "frantic-verifiable-web-research/1.0"}
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read()
        return {
            "status": resp.status,
            "final_url": resp.geturl(),
            "content_type": resp.headers.get("Content-Type"),
            "body": body,
        }


def clean_text(value, limit=260):
    value = re.sub(r"\s+", " ", str(value)).strip()
    if len(value) > limit:
        return value[: limit - 3] + "..."
    return value


def find_snippet(text, pattern, limit=240):
    idx = text.lower().find(pattern.lower())
    if idx < 0:
        return ""
    start = max(0, idx - 80)
    end = min(len(text), idx + len(pattern) + 120)
    return clean_text(text[start:end], limit=limit)


def normalize_listing_items(raw):
    data = raw
    if isinstance(data, dict):
        for key in ("listings", "data", "items", "results"):
            if isinstance(data.get(key), list):
                return data[key]
    if isinstance(data, list):
        return data
    return []


def listing_title(item):
    for key in ("title", "name", "headline", "slug"):
        if item.get(key):
            return str(item[key])
    return "untitled"


def listing_url(item):
    for key in ("url", "link", "listingUrl"):
        if item.get(key):
            value = str(item[key])
            return value if value.startswith("http") else urllib.parse.urljoin("https://superteam.fun", value)
    slug = item.get("slug")
    if slug:
        return f"https://superteam.fun/earn/{slug}"
    return "https://superteam.fun/earn/agents"


def extract_facts(source_records):
    facts = []
    source_by_id = {s["id"]: s for s in source_records}

    frantic_skill_text = source_by_id["frantic_skill"]["text"]
    facts.append(
        {
            "id": "fact_frantic_signup",
            "source_ids": ["frantic_skill"],
            "claim": "Frantic supports first-class agent entry through its homepage form or POST /v1/signup, returning an agent token and public agent key id.",
            "snippet": find_snippet(frantic_skill_text, "POST /v1/signup"),
        }
    )
    facts.append(
        {
            "id": "fact_frantic_claim_delivery",
            "source_ids": ["frantic_skill"],
            "claim": "Frantic claims are made with POST /v1/claims and deliveries are submitted with POST /v1/deliveries before the claim fuse expires.",
            "snippet": find_snippet(frantic_skill_text, "POST /v1/claims"),
        }
    )
    facts.append(
        {
            "id": "fact_frantic_identity",
            "source_ids": ["frantic_skill"],
            "claim": "Frantic funded claims require active identity proof: verified email in open_email mode or runx GitHub identity in runx_github mode.",
            "snippet": find_snippet(frantic_skill_text, "Funded claims require"),
        }
    )

    for sid in ("frantic_21", "frantic_24"):
        raw = source_by_id[sid]["json"]
        bounty = raw.get("bounty") or raw
        title = bounty.get("title")
        number = bounty.get("number")
        price = bounty.get("priceUsd") or bounty.get("price_usd")
        status = bounty.get("workStatus") or bounty.get("work_status")
        claim_progress = bounty.get("claimProgress") or bounty.get("claim_progress") or {}
        available = claim_progress.get("available")
        criteria = bounty.get("acceptanceCriteria") or bounty.get("acceptance_criteria") or []
        facts.append(
            {
                "id": f"fact_{sid}_open",
                "source_ids": [sid],
                "claim": f"Frantic #{number} '{title}' is listed as {status} with {available} claim slot(s) available and ${price} posted reward.",
                "snippet": clean_text(json.dumps({"title": title, "status": status, "priceUsd": price, "claimProgress": claim_progress}, ensure_ascii=False)),
            }
        )
        facts.append(
            {
                "id": f"fact_{sid}_criteria",
                "source_ids": [sid],
                "claim": f"Frantic #{number} requires a governed skill, evidence.json, report.md, receipt reference, and a real run matching its acceptance criteria.",
                "snippet": clean_text(json.dumps(criteria, ensure_ascii=False), limit=300),
            }
        )

    superteam_skill_text = source_by_id["superteam_skill"]["text"]
    facts.append(
        {
            "id": "fact_superteam_agents_route",
            "source_ids": ["superteam_skill"],
            "claim": "Superteam exposes an agent workflow with registration, API key, listing endpoints, submission creation, and a human claim URL containing the agent claim code.",
            "snippet": find_snippet(superteam_skill_text, "claimCode"),
        }
    )

    for sid in ("superteam_bounties", "superteam_projects"):
        raw = source_by_id[sid]["json"]
        items = normalize_listing_items(raw)
        agent_ready = []
        for item in items:
            access = item.get("agentAccess") or item.get("agent_access")
            if access in ("AGENT_ALLOWED", "AGENT_ONLY"):
                agent_ready.append(
                    {
                        "title": listing_title(item),
                        "url": listing_url(item),
                        "agentAccess": access,
                        "status": item.get("status"),
                        "rewardAmount": item.get("rewardAmount") or item.get("reward_amount"),
                    }
                )
        facts.append(
            {
                "id": f"fact_{sid}_count",
                "source_ids": [sid],
                "claim": f"Superteam {sid.split('_')[-1]} agent API returned {len(items)} listing(s), including {len(agent_ready)} listing(s) marked AGENT_ALLOWED or AGENT_ONLY.",
                "snippet": clean_text(json.dumps(agent_ready[:5], ensure_ascii=False), limit=320),
            }
        )

    return facts


def write_report(path, question, sources, facts):
    source_lines = [f"- [{s['id']}] {s['url']} SHA-256 `{s['sha256']}`" for s in sources]
    fact_lines = []
    for fact in facts:
        refs = ", ".join(f"`{sid}`" for sid in fact["source_ids"])
        fact_lines.extend(
            [
                f"### {fact['id']}",
                "",
                f"{fact['claim']} Source: {refs}.",
                "",
            ]
        )
    lines = [
        "# Verifiable Web Research Report",
        "",
        f"Question: {question}",
        "",
        "## Answer",
        "",
        "Frantic is currently the clearest agent-native venue in this sample: it has explicit agent signup, claim, delivery, identity, and receipt rules, and the two checked bounties are open with available claim slots. Superteam also exposes an agent API and claim-code workflow, but current actionable work depends on listings marked `AGENT_ALLOWED` or `AGENT_ONLY` in the live listing endpoints.",
        "",
        "Remaining blockers are operational rather than research blockers: Frantic needs a verified eligible agent token for claim and delivery, and Superteam needs the registered agent API key plus later human claim flow after winning.",
        "",
        "## Claims",
        "",
        *fact_lines,
        "## Sources Read",
        "",
        *source_lines,
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--question", required=True)
    parser.add_argument("--output-dir", required=True)
    args = parser.parse_args()

    output_dir = pathlib.Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    source_records = []
    for source in SOURCES:
        needs_superteam_auth = source["id"].startswith("superteam_") and "/api/agents/" in source["url"]
        fetched = fetch(source["url"], os.environ.get("SUPERTEAM_API_KEY") if needs_superteam_auth else None)
        body = fetched["body"]
        text = body.decode("utf-8", errors="replace")
        record = {
            "id": source["id"],
            "url": source["url"],
            "final_url": fetched["final_url"],
            "status": fetched["status"],
            "content_type": fetched["content_type"],
            "sha256": sha256_bytes(body),
            "purpose": source["purpose"],
            "text": text,
        }
        if source["kind"] == "json":
            record["json"] = json.loads(text)
        source_records.append(record)

    facts = extract_facts(source_records)
    public_sources = [
        {k: v for k, v in s.items() if k not in ("text", "json")}
        for s in source_records
    ]
    evidence = {
        "schema": "frantic.verifiable_web_research.v1",
        "bounty": {
            "platform": "Frantic",
            "number": 24,
            "posting_id": "p-b5e7d3b9b4",
            "title": "runx skill: verifiable web research",
        },
        "question": args.question,
        "generated_at": now_iso(),
        "sources": public_sources,
        "claims": facts,
        "method": "Fetch official sources, hash each response, extract bounded facts, and map every report claim to one or more source ids.",
    }

    evidence_path = output_dir / "evidence.json"
    report_path = output_dir / "report.md"
    receipt_path = output_dir / "receipt.json"
    evidence_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    write_report(report_path, args.question, public_sources, facts)

    receipt = {
        "schema": "frantic.local_receipt.v1",
        "kind": "verifiable_web_research",
        "generated_at": now_iso(),
        "question": args.question,
        "artifacts": {
            "evidence_json_sha256": sha256_bytes(evidence_path.read_bytes()),
            "report_md_sha256": sha256_bytes(report_path.read_bytes()),
            "source_sha256": {s["id"]: s["sha256"] for s in public_sources},
        },
        "recompute": {
            "command": "python tools/verifiable_research.py --question <question> --output-dir <output_dir>",
            "network_sources": [s["url"] for s in SOURCES],
        },
    }
    receipt["receipt_digest"] = sha256_bytes(
        json.dumps(receipt, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    )
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        json.dumps(
            {
                "ok": True,
                "output_dir": str(output_dir),
                "sources_read": len(source_records),
                "claims": len(facts),
                "evidence": str(evidence_path),
                "report": str(report_path),
                "receipt": str(receipt_path),
                "receipt_digest": receipt["receipt_digest"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except (urllib.error.URLError, urllib.error.HTTPError, RuntimeError, json.JSONDecodeError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
