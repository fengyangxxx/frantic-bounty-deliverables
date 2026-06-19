import { defineConfig, markdown, openapi } from "sourcey";

export default defineConfig({
  name: "Modrinth API Sourcey Docs",
  description:
    "Sourcey-generated API documentation for the real Modrinth Labrinth API OpenAPI specification.",
  theme: {
    colors: {
      primary: "#1bd96a",
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
              pages: ["introduction"],
            },
          ],
        }),
      },
      {
        tab: "API Reference",
        slug: "api",
        source: openapi("./openapi.yaml"),
      },
    ],
  },
  navbar: {
    links: [
      { type: "github", href: "https://github.com/modrinth/code" },
      { type: "custom", label: "Official API Docs", href: "https://docs.modrinth.com/api/" },
      { type: "custom", label: "OpenAPI YAML", href: "https://docs.modrinth.com/openapi.yaml" },
    ],
  },
});
