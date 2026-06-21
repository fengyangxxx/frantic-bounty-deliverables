# Hosting Decision

Status: `PUBLISHED`

The Sourcey site is published as a public, purpose-scoped GitHub Pages site:

```text
https://fengyangxxx.github.io/go-chi-sourcey-docs/
```

The backing repository is public and named for the target documentation packet:

```text
https://github.com/fengyangxxx/go-chi-sourcey-docs
```

Why this host is used:

- The site is a static Sourcey output, and Sourcey documents static deployment
  as deployable to any durable static host.
- The repository name, README, generated pages, source config, and evidence all
  bind the site to `go-chi/chi` at pinned commit
  `2b9fca258f92830fc8232582e9e05a4d4a572a5d`.
- The URL is stranger-loadable over HTTPS without authentication.
- The static site includes the generated docs, `llms.txt`, search index,
  Sourcey CSS/JS assets, the Sourcey config, and a reproducible `godoc.json`
  evidence snapshot.

Known limitation:

- This is not an official `go-chi` maintainer domain. It is still a durable,
  public, source-bound documentation artifact rather than a preview URL,
  screenshot, raw file URL, or private-only report.
