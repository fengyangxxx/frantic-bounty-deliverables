# Open Library Book Lookup Connector

Frantic #4 deliverable for `p-2fe96b012e`.

This package defines a runx connector skill for the Open Library public search
API. It includes:

- `SKILL.md`
- `X.yaml`
- declared connector dependency, scopes, policy, and emits
- `open_library.search` governed action with typed inputs and typed output
- deterministic harness fixture
- captured harness receipt output

Reproduce locally:

```powershell
runx tool build --all --json
runx doctor --json
runx dev . --lane deterministic --json
```

For signed inline harness receipts, provide local test signing environment
variables outside the repository before running `runx harness . --json`.
