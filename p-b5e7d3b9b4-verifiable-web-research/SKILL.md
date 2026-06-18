---
name: verifiable-web-research
description: Fetch official web sources, extract cited facts, and emit claim-to-source evidence, report, and receipt artifacts.
source:
  type: cli-tool
  command: F:/ProgramData/anaconda3/python.exe
  cwd: F:/work/ai_work/get_money/frantic_tasks/verifiable-web-research
  cwd_policy: skill-directory
  args:
    - tools/verifiable_research.py
inputs:
  question:
    type: string
    required: true
    description: Research question to answer.
  output_dir:
    type: string
    required: true
    description: Directory where report.md, evidence.json, and receipt.json are written.
auth:
  env:
    - SUPERTEAM_API_KEY
mutating: read
runx:
  allowed_tools:
    - http.get
    - file.write
  scopes:
    - net:gofrantic.com
    - net:superteam.fun
    - secret:SUPERTEAM_API_KEY
    - fs:output
  artifacts:
    emits:
      - evidence.json
      - report.md
      - receipt.json
  tags:
    - research
    - citations
    - receipts
---

# Verifiable Web Research

Answers a bounded research question by fetching official sources and writing:

- `evidence.json`: source records, content hashes, extracted facts, and claim mappings.
- `report.md`: concise answer where every claim cites an evidence id.
- `receipt.json`: local recomputation metadata and artifact digests.

The skill is read-only. It does not inspect browser cookies, local storage, credentials, or private pages. If `SUPERTEAM_API_KEY` is set, it uses it only as an Authorization bearer header for the official Superteam agent listing endpoints and never writes the key to artifacts.
