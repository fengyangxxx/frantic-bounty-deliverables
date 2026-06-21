# Frantic #33 Delivery Report: go-chi/chi Sourcey Docs

## Delivery Summary

This delivery publishes a Sourcey-generated documentation site for
`go-chi/chi`, a maintained third-party Go OSS router and middleware library.
The generated site is public, navigable, and bound to the pinned upstream commit
`2b9fca258f92830fc8232582e9e05a4d4a572a5d`.

Final artifacts:

- `public_url`: https://fengyangxxx.github.io/go-chi-sourcey-docs/
- `evidence_json`: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-8b91e1ac8c-sourcey-oss-docs/evidence.json
- `receipt_ref`: `runx:receipt:sha256:5a6d4a05fdba03bb2cbd0fcb24a3409ba5833b57ff93a4aa392774477a05eadf`
- `report`: https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-8b91e1ac8c-sourcey-oss-docs/report.md

## Target And Sourcey Run

- Target repository: https://github.com/go-chi/chi
- Module: `github.com/go-chi/chi/v5`
- Pinned commit: `2b9fca258f92830fc8232582e9e05a4d4a572a5d`
- Commit date: `2026-06-14T12:07:26+02:00`
- License: MIT
- Source shape: 78 Go source files and two public Go packages
- Sourcey version: `3.6.3`
- Adapter: `godoc()`
- Config: `sourcey.config.ts`
- Commands: `npm run godoc:snapshot` and `npm run build`

## Published Site

The public site is a GitHub Pages project site backed by a public repository:

- Site: https://fengyangxxx.github.io/go-chi-sourcey-docs/
- Backing repo: https://github.com/fengyangxxx/go-chi-sourcey-docs

The site is not a private preview, screenshot, raw file dump, or empty stub
page. It includes the Sourcey static output, `llms.txt`, `llms-full.txt`, a
search index, Sourcey CSS/JS assets, the Sourcey config, and reproduction notes.

Live pages to spot-check:

- https://fengyangxxx.github.io/go-chi-sourcey-docs/
- https://fengyangxxx.github.io/go-chi-sourcey-docs/go-api.html
- https://fengyangxxx.github.io/go-chi-sourcey-docs/go-api/package-root.html
- https://fengyangxxx.github.io/go-chi-sourcey-docs/go-api/pkg-middleware.html
- https://fengyangxxx.github.io/go-chi-sourcey-docs/llms.txt

## Coverage

- `godoc.json` records 76 public API items.
- `dist/search-index.json` contains 215 Sourcey search entries.
- The root package page covers `NewRouter`, `URLParam`, `URLParamFromCtx`,
  `Walk`, `Routes`, `Router`, `Context`, and middleware composition concepts.
- The middleware package page covers auth, compression, request IDs, logging,
  heartbeat, redirect handling, throttling, request size, response wrapping,
  stripping slashes, URL format handling, and profiler helpers.
- The site exceeds the Frantic #33 minimum of 20 documented APIs, endpoints,
  modules, examples, or configuration concepts.

## Runx Receipt

The governed validation harness was run with `npx -y @runxhq/cli@0.6.6`.
The exact version check output recorded in `evidence_json.observations` is:

```text
runx-cli 0.6.6
```

The harness passed one validation case named `go-chi-sourcey-pages` and emitted:

```text
runx:receipt:sha256:5a6d4a05fdba03bb2cbd0fcb24a3409ba5833b57ff93a4aa392774477a05eadf
```

The receipt store is public at:

- https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-8b91e1ac8c-sourcey-oss-docs/receipts/index.json
- https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-8b91e1ac8c-sourcey-oss-docs/receipts/sha256_5a6d4a05fdba03bb2cbd0fcb24a3409ba5833b57ff93a4aa392774477a05eadf.json

## Maintainer-Facing Gaps

- Sourcey produced a solid API reference baseline, but `go-chi` maintainers
  would likely want task-oriented routing examples layered above the API index.
- Middleware docs should be split into security, request lifecycle,
  observability, compression, throttling, and response-writing sections for
  easier maintainer linking.
- Route pattern examples should connect `NewRouter`, `Route`, `Mount`,
  `URLParam`, `URLParamFromCtx`, and `Walk` to real routing workflows.
- Middleware pages should add warnings around `BasicAuth`, `Compress`,
  `ThrottleWithOpts`, and request body limits because these are operationally
  important integration points.
- The generated site is version-bound to one pinned commit; a maintainer-owned
  deployment should rebuild from CI whenever `go-chi/chi` releases.
- Search and `llms.txt` are useful for ecosystem users, but maintainers should
  review generated summaries for project voice before linking from official
  docs.
- Source links are pinned and reproducible, but an official docs handoff should
  add a small contribution note explaining how to update Sourcey config and
  regenerate the godoc snapshot.

## Acceptance Mapping

- Runx CLI requirement: satisfied by `runx-cli 0.6.6` and the governed
  validation receipt.
- Maintained OSS target: satisfied by `go-chi/chi` at pinned public commit
  `2b9fca258f92830fc8232582e9e05a4d4a572a5d`.
- License: satisfied by MIT license in the upstream repository.
- Source depth: satisfied by 78 Go source files, two public packages, 76
  documented public API items, and 215 search index entries.
- Public docs: satisfied by the GitHub Pages project site at
  https://fengyangxxx.github.io/go-chi-sourcey-docs/.
- Evidence JSON: includes repo URL, commit, license, adapter, commands, config,
  page list, coverage notes, observations, and artifact URLs.
- Receipt: `runx:receipt:sha256:5a6d4a05fdba03bb2cbd0fcb24a3409ba5833b57ff93a4aa392774477a05eadf`
  binds the validation harness to the final public URL, Sourcey output, and
  coverage evidence.
