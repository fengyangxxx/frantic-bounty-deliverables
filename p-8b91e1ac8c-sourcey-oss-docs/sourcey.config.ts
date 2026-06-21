import { defineConfig, godoc, markdown } from "sourcey";

const chiCommit = "2b9fca258f92830fc8232582e9e05a4d4a572a5d";

export default defineConfig({
  name: "go-chi/chi Sourcey API Notes",
  description:
    "Sourcey-generated documentation for go-chi/chi v5 at a pinned public commit.",
  repo: "https://github.com/go-chi/chi",
  editBranch: chiCommit,
  theme: {
    colors: {
      primary: "#0f766e",
    },
  },
  navigation: {
    tabs: [
      {
        tab: "Overview",
        slug: "",
        source: markdown({
          groups: [
            {
              group: "Project",
              pages: ["introduction", "hosting-decision", "reproduce"],
            },
          ],
        }),
      },
      {
        tab: "Go API",
        slug: "go-api",
        source: godoc({
          module: "./source/chi",
          packages: ["./..."],
          mode: "live",
          includeTests: true,
          includeUnexported: false,
          sourceBasePath: "",
        }),
      },
    ],
  },
  navbar: {
    links: [
      { type: "github", href: "https://github.com/go-chi/chi" },
      { type: "custom", label: "Go Reference", href: "https://pkg.go.dev/github.com/go-chi/chi/v5" },
      { type: "custom", label: "Examples", href: `https://github.com/go-chi/chi/tree/${chiCommit}/_examples` },
    ],
  },
});
