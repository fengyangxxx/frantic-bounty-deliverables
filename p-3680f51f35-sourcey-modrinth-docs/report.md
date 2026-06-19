# Frantic #2 Delivery Draft: Modrinth API Sourcey Docs

This is a Sourcey-generated documentation site for the real Modrinth Labrinth
API OpenAPI specification.

## Target

- Library/API: Modrinth Labrinth API
- Source repository: https://github.com/modrinth/code
- Official docs: https://docs.modrinth.com/api/
- OpenAPI spec: https://docs.modrinth.com/openapi.yaml
- OpenAPI version string: `v2.7.0/366f528`

## Sourcey Build

- Sourcey version: `3.6.3`
- Adapter: `openapi()`
- Config: `sourcey.config.ts`
- Build command: `npm run build`
- Output directory: `dist/`

The generated site contains:

- `index.html`
- `introduction.html`
- `api.html`
- `llms.txt`
- `llms-full.txt`
- `search-index.json`

The Sourcey search index contains 77 endpoint entries under the `Endpoints`
category, well above the 20-endpoint Frantic requirement.

## Quality Notes

- The docs are generated from the real Modrinth OpenAPI spec, not handwritten
  placeholder content.
- The local OpenAPI copy redacts the public example `Authorization` token
  string from Modrinth's published docs to avoid false-positive secret scanning.
- The API reference, search index, and LLM context are all generated artifacts
  from Sourcey.

## Current Blocker

Public pinned site URL:

https://raw.githack.com/fengyangxxx/frantic-bounty-deliverables/c5eb04e9fa57bb3481f9033c7502387c3d3ca3f7/p-3680f51f35-sourcey-modrinth-docs/dist/index.html

Public pinned API reference URL:

https://raw.githack.com/fengyangxxx/frantic-bounty-deliverables/c5eb04e9fa57bb3481f9033c7502387c3d3ca3f7/p-3680f51f35-sourcey-modrinth-docs/dist/api.html

Frantic's previous #2 review accepted the quality of a Modrinth Sourcey build
but rejected throwaway hosting. This draft uses a pinned RawGitHack commit URL,
not `github.io` or `*.pages.dev`. Before submission, QA still needs to decide
whether Frantic is likely to accept RawGitHack as a sufficiently stable host.
