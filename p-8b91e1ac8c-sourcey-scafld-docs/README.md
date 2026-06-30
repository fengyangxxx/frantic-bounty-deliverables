# Frantic #33 Sourcey Docs Proof: scafld

This packet validates the project-owned Sourcey documentation site for
`nilstate/scafld` at:

https://0state.com/scafld/docs/go-api

The validation was run in Docker on Linux with `runx-cli 0.6.13`. The public URL
is not a personal GitHub Pages site, preview host, sandbox, raw file, or
throwaway domain. It lives under the project/maintainer domain `0state.com`.

Key files:

- `evidence.json` - machine-readable Frantic evidence.
- `report.md` - maintainer-facing review and gaps.
- `validation/` - runx validation skill and reproduction script.
- `harness-output.json` - runx harness result.
- `receipt-verify-output.json` - runx receipt verification result.
- `receipts/receipt-success-sha256-c6cf4e6c449453a94f55c08303088ae4e7551046910faa232e5e14a45b5484b9.json` - success receipt JSON.
