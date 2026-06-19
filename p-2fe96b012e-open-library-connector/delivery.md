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
- source package: https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/skills/open-library-book-lookup
- delivery evidence: https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/p-2fe96b012e-open-library-connector
- evidence JSON: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-2fe96b012e-open-library-connector/evidence.json

Verification:

- `runx tool build --all --json`: success
- `runx doctor --json`: success
- `runx dev . --lane deterministic --json`: success
- direct connector tool fixture run: success
- URL-as-publish index through `https://api.runx.ai/v1/index`: success
- registry status/detail/harness API fetches: success

Local Windows inline `runx harness . --json` was recorded separately. It reached
the known Windows receipt store `os error 87` path during receipt sealing, while
the same package passes doctor, deterministic dev fixtures, direct tool run, and
hosted registry indexing.
