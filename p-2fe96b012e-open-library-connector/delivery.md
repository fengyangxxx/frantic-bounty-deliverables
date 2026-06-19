# Frantic #4 Delivery: Open Library runx connector skill

Built and published a complete runx connector skill:

- Skill: `open-library-book-lookup`
- Provider: `open-library`
- Connector/runtime path: `nango`
- Canonical skill: `runx/web-fetch`
- Scope: `open-library:search:read`
- Action: read-only `GET https://openlibrary.org/search.json`
- Packet emitted: `runx.open_library.search_result.v1`

Primary links:

- runx listing: https://runx.ai/x/fengyangxxx/open-library-book-lookup
- runx versioned page: https://runx.ai/x/fengyangxxx/open-library-book-lookup@sha-c60ba5f59af1
- runx upstream PR: https://github.com/runxhq/runx/pull/86
- source package: https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/skills/open-library-book-lookup
- delivery evidence: https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/p-2fe96b012e-open-library-connector
- evidence JSON: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-2fe96b012e-open-library-connector/evidence.json
- signed receipt store: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-2fe96b012e-open-library-connector/receipts/index.json

Verification:

- `runx tool build --all --json`: success
- `runx doctor --json`: success
- `runx dev . --lane deterministic --json`: success
- signed inline `runx harness`: success
- receipt verification: success, root `sha256:536d5dcce1df9850fd7a057412873b2a336d3aa7d7c1d89bc4dc2ce9de6f4c17`
- direct connector tool fixture run: success
- URL-as-publish index through `https://api.runx.ai/v1/index`: success
- registry status/detail/harness API fetches: success

The signed harness evidence contains one passing fixture case and a resolvable
receipt tree. The receipt verification output reports `valid: true`,
`receipt_count: 2`, and no findings.
