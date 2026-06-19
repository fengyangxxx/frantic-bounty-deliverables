# Frantic #22 Structured Extraction Delivery

Bounty: p-40c7eb6c41
Claim: frantic:claim:b2ba428c-8a2f-416f-8593-1a44fa50fe2a
runx PR: https://github.com/runxhq/runx/pull/80

## Summary

This revision adds a governed runx skill named structured-extraction. It turns messy HTML or text fixtures into schema-validated JSON, with a real item schema and final native-json-schema-subset-v1 validation in run.mjs. The default harness runs on the real RFC 9110 HTML document from the RFC Editor, not toy data.

## Evidence

- Skill source and X.yaml: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/X.yaml
- Deterministic extractor: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/tools/structured/extract/run.mjs
- Input fixture: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/fixtures/rfc9110-http-semantics.html
- JSON Schema: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/schemas/extraction.schema.json
- Direct tool output: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/direct-tool-output.json
- Harness output: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/harness-signed-output.json
- Receipt verification: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/receipt-verify-output.json
- Receipt index: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-40c7eb6c41-structured-extraction/receipts/index.json

## Bound Data

- Source URL: https://www.rfc-editor.org/rfc/rfc9110.html
- Input bytes: 1192867
- Input SHA-256: sha256:6a83e5a8f145d7aaaf253b80735ee0b9bc7ed650261f016dcc87b6b72e55b4e6
- Schema SHA-256: sha256:87b8648f47bdd68b962d642dcf2f982fd20f07ec7a278651a275465c682f3a93
- Output payload SHA-256: sha256:6ce0d51540510d6642d99d4b2bc72ddeddbc66b1c05af226ac363632375fd05e
- Extracted items: 18
- Schema validation: True
- Schema validation engine: native-json-schema-subset-v1

## Receipt

- Root receipt: sha256:3e321e587d8423ef8a8474cf59f15d17c372c6ec4e22d0a24e493d02ee6da04c
- Verification valid: True
- Receipt count: 2

The child skill receipt contains artifact refs for the input fixture, JSON Schema, and validated output payload. Those refs are also present in direct-tool-output.json and evidence.json.

## Acceptance Mapping

- Complete X.yaml: X.yaml declares typed inputs, local read scopes, policy, emits, and a harness case.
- Real messy input: the fixture is RFC 9110 HTML from https://www.rfc-editor.org/rfc/rfc9110.html, with its byte count and SHA-256 recorded.
- Schema validation: output validates against schemas/extraction.schema.json; run.mjs fails on schema mismatch, enforces typed per-kind item fields, and records json_schema_validation=true in direct-tool-output.json.
- Receipt binding: the harness receipt verifies and includes artifact refs for input/schema/output hashes.
- Real runx PR: submitted as https://github.com/runxhq/runx/pull/80.
