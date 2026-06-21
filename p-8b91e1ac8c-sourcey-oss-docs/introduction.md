# go-chi/chi Sourcey API Notes

This Sourcey build targets `github.com/go-chi/chi/v5`, a maintained
third-party Go HTTP router released under the MIT license. The generated static
site is published at:

```text
https://fengyangxxx.github.io/go-chi-sourcey-docs/
```

The source checkout is pinned to commit
`2b9fca258f92830fc8232582e9e05a4d4a572a5d`, whose latest commit timestamp in
the local checkout is `2026-06-14 12:07:26 +0200`.

The generated Go API tab is produced by Sourcey's `godoc()` adapter from real
Go source, using `go list`, `go/parser`, and `go/doc` through the local Go
toolchain. It covers the root router package and middleware package, including
router interfaces, route context types, URL parameter helpers, middleware
constructors, compression helpers, throttle controls, request ID helpers, and
examples extracted from test files.

The publication repository is public and purpose-scoped to this generated
documentation packet:

```text
https://github.com/fengyangxxx/go-chi-sourcey-docs
```
