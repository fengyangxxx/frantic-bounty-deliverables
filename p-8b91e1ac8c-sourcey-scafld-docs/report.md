# Frantic #33 Report: scafld Sourcey Docs

## Delivery

- `public_url`: https://0state.com/scafld/docs/go-api
- `target repo`: https://github.com/nilstate/scafld
- `pinned commit`: `ce26b0c0637a0f0acd1c6be4397bda14668844ec`
- `receipt_ref`: `runx:receipt:sha256:c6cf4e6c449453a94f55c08303088ae4e7551046910faa232e5e14a45b5484b9`
- `runx --version`: `runx-cli 0.6.13`

This delivery uses the project-owned `0state.com` docs area rather than a
personal GitHub Pages account, preview host, raw file URL, or throwaway docs
domain. The parent page `https://0state.com/scafld` links to the target GitHub
repository and the docs area.

## Target

`nilstate/scafld` is a maintained MIT-licensed Go OSS library for deterministic
multi-phase agent work. The pinned commit is:

```text
ce26b0c0637a0f0acd1c6be4397bda14668844ec
2026-06-30T05:49:41Z
ci: limit receipt verification push scope
```

The shallow checkout at that commit contained 251 Go source files. The GitHub
API reported `pushed_at=2026-06-30T05:49:43Z` and `license=MIT`.

## Sourcey Config

The target repo contains its own Sourcey docs configuration:

- `docs/package.json` has `site:build` set to `sourcey build -o ../dist`.
- `docs/package.json` depends on `sourcey ^3.6.0`.
- `docs/sourcey.config.ts` sets `name: "scafld"` and
  `repo: "https://github.com/nilstate/scafld"`.
- The Go API tab uses `godoc({ module: "..", packages: [...] })`.
- The package globs include `cmd/scafld`, `internal/core`,
  `internal/app`, `internal/adapters`, and `internal/platform`.

## Live Coverage

The live Go API page returned HTTP 200 and includes the meta generator
`Sourcey 3.6.0`. The validation counted 74 unique package/API pages under
`/scafld/docs/go-api/pkg-*`, above the bounty's 20-concept minimum.

Spot checks:

- `internal/core/receipt`: HTTP 200, Sourcey 3.6.0, 110013 bytes.
- `internal/app/validate`: HTTP 200, Sourcey 3.6.0, 54967 bytes.
- `internal/adapters/cli/config`: HTTP 200, Sourcey 3.6.0, 51449 bytes.

## Validation

Validation ran in Docker on Linux using:

```bash
docker run --rm -v <repo>/p-8b91e1ac8c-sourcey-scafld-docs/validation:/work -w /work node:20-bookworm sh ./run-docker-validation.sh
npx -y @runxhq/cli@0.6.13 --version
npx -y @runxhq/cli@0.6.13 skill . --input public_url=https://0state.com/scafld/docs/go-api --input parent_url=https://0state.com/scafld --input repo_url=https://github.com/nilstate/scafld --input commit=ce26b0c0637a0f0acd1c6be4397bda14668844ec --input min_pages=20 --json
npx -y @runxhq/cli@0.6.13 harness . --receipt-dir ./receipts --json
```

The harness had two cases:

- `scafld-sourcey-live-proof`: expected sealed success.
- `invalid-sourcey-url-fails`: expected sealed failure for a non-Sourcey URL.

`harness-output.json` reports `status=passed`, `case_count=2`, and
`assertion_error_count=0`.

The success receipt was verified with the public key in
`receipt-public-key-base64.txt`:

```text
root_receipt_id=sha256:c6cf4e6c449453a94f55c08303088ae4e7551046910faa232e5e14a45b5484b9
signature_mode=production
valid=true
```

## Maintainer-Facing Gaps

- The Go API docs are broad, but package landing pages would be easier to scan
  if critical workflow packages linked back to a small conceptual overview.
- The docs expose internal packages; maintainers may want badges or labels that
  separate stable public CLI/API surfaces from internal implementation packages.
- Source links are available through the repo configuration, but the docs could
  add a short "generated from commit" banner to make pinned provenance visible
  to casual readers.
- `internal/core/receipt` is a high-value page; a maintainer-facing guide should
  link it from the receipt verification documentation.
- The `internal/app/validate` docs show validation mechanics, but examples of
  failing specs and expected corrections would help operators adopt it faster.
- The CLI config package docs are useful, but the docs should cross-link them
  to `configuration` and `spec-schema` pages so new users can move from API
  reference to task setup.
- The Sourcey config already covers `cmd`, `core`, `app`, `adapters`, and
  `platform`; future builds could add grouped navigation labels for these
  areas to reduce long-sidebar fatigue.
- The project should keep `docs/package-lock.json` updated with the Sourcey
  version used for the live deployment so future generated output is
  reproducible.

## Reviewer Notes

This packet avoids the known rejected shape for this bounty: it is not a
personal `<handle>.github.io` site, a fresh throwaway org, a preview domain, or
a raw file viewer. The public URL is under a project/maintainer domain that a
scafld maintainer or user could credibly link.

One interpretation risk remains: the live docs are already on the project-owned
domain, and this packet provides governed validation, evidence, and a
maintainer-facing report rather than a new personal re-host. The QA gate should
explicitly decide whether that satisfies the bounty's "Publish Sourcey docs"
wording before final delivery.
