# Reproduce

From `F:\work\ai_work\get_money\frantic-deliverables-public\p-8b91e1ac8c-sourcey-oss-docs`:

```powershell
npm install
npm run verify:runx-version
npm run godoc:snapshot
npm run build
```

The target source checkout was prepared with:

```powershell
git clone --depth 1 --branch master https://github.com/go-chi/chi.git source\chi
git -C source\chi rev-parse HEAD
```

Pinned target commit:

```text
2b9fca258f92830fc8232582e9e05a4d4a572a5d
```

Generated output is written to `dist/`.
