# Open Library Book Lookup Connector

Frantic #4 deliverable for `p-2fe96b012e`.

This package defines a runx connector skill for the Open Library public search
API. It includes:

- `SKILL.md`
- `X.yaml`
- declared connector dependency, scopes, policy, and emits
- `open_library.search` governed action with typed inputs and typed output
- deterministic harness fixture
- captured signed harness receipt output
- resolvable receipt store under `receipts/`
- receipt verification output

Reproduce locally:

```powershell
runx tool build --all --json
runx doctor --json
runx dev . --lane deterministic --json
```

Signed receipt evidence:

- Harness output: `harness-patched-signed-output.json`
- Receipt verification: `receipt-verify-output.json`
- Root receipt: `sha256:536d5dcce1df9850fd7a057412873b2a336d3aa7d7c1d89bc4dc2ce9de6f4c17`
- Receipt store index: `receipts/index.json`

For local reproduction of signed inline harness receipts, provide signing
environment variables outside the repository before running
`runx harness . --json`.
