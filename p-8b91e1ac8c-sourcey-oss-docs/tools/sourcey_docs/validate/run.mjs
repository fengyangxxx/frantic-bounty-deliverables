import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import http from "node:http";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_VERSION = "0.1.0";

function readInputs() {
  const raw = process.env.RUNX_INPUTS_PATH
    ? fs.readFileSync(process.env.RUNX_INPUTS_PATH, "utf8")
    : (process.env.RUNX_INPUTS_JSON || "{}");
  return JSON.parse(raw);
}

function packageRoot() {
  return path.resolve(__dirname, "../../..");
}

function resolveInsidePackage(relativePath, label) {
  const root = packageRoot();
  const resolved = path.resolve(root, String(relativePath || ""));
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`${label} escapes the skill package`);
  }
  return resolved;
}

function sha256Bytes(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function sha256Text(text) {
  return sha256Bytes(Buffer.from(text, "utf8"));
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function normalizeRoot(url) {
  const parsed = new URL(url);
  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname += "/";
  }
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

function pageUrl(root, pagePath) {
  return new URL(pagePath || "", root).toString();
}

async function fetchPage(root, pagePath) {
  const url = pageUrl(root, pagePath);
  const response = await getText(url);
  const body = response.body;
  return {
    path: pagePath || "index.html",
    url,
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    byte_count: Buffer.byteLength(body, "utf8"),
    sha256: sha256Text(body),
    contains_sourcey: body.includes("Sourcey"),
    contains_target: body.includes("go-chi") || body.includes("github.com/go-chi/chi"),
    contains_router_symbol: body.includes("NewRouter") || body.includes("Router"),
    contains_middleware_symbol: body.includes("BasicAuth") || body.includes("RequestID") || body.includes("Throttle"),
  };
}

function getText(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "http:" ? http : https;
    const request = client.request(
      parsed,
      {
        method: "GET",
        headers: { "user-agent": "runx-sourcey-docs-validation/0.1" },
        timeout: 20000,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => {
          resolve({
            status: response.statusCode || 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    request.on("timeout", () => {
      request.destroy(new Error(`timeout fetching ${url}`));
    });
    request.on("error", reject);
    request.end();
  });
}

function countGodocItems(godoc) {
  const text = JSON.stringify(godoc);
  const candidates = [
    "NewRouter",
    "URLParam",
    "Walk",
    "Router",
    "Routes",
    "BasicAuth",
    "Compress",
    "RequestID",
    "ThrottleWithOpts",
    "WrapResponseWriter",
  ];
  return {
    candidate_symbol_hits: candidates.filter((item) => text.includes(item)),
    approximate_public_item_count: (text.match(/"name"\s*:/g) || []).length,
  };
}

async function main() {
  const input = readInputs();
  const root = normalizeRoot(input.public_url);
  const pagePaths = Array.isArray(input.page_paths) ? input.page_paths : [];
  if (!pagePaths.length) {
    throw new Error("page_paths must contain at least one page");
  }

  const godocPath = resolveInsidePackage(input.godoc_path, "godoc_path");
  const searchPath = resolveInsidePackage(input.search_index_path, "search_index_path");
  const godocBytes = fs.readFileSync(godocPath);
  const searchBytes = fs.readFileSync(searchPath);
  const godoc = JSON.parse(godocBytes.toString("utf8"));
  const searchIndex = JSON.parse(searchBytes.toString("utf8"));
  const pages = [];
  for (const pagePath of pagePaths) {
    pages.push(await fetchPage(root, pagePath));
  }

  const failedPages = pages.filter((page) => !page.ok);
  if (failedPages.length) {
    throw new Error(`public pages failed: ${failedPages.map((page) => `${page.path}:${page.status}`).join(", ")}`);
  }

  const rootPage = pages.find((page) => page.path === "index.html");
  const packagePage = pages.find((page) => page.path.includes("package-root"));
  const middlewarePage = pages.find((page) => page.path.includes("pkg-middleware"));
  const godocCounts = countGodocItems(godoc);
  const searchEntries = Array.isArray(searchIndex) ? searchIndex.length : Object.keys(searchIndex || {}).length;

  const checks = [
    {
      name: "public_url_https",
      passed: root.startsWith("https://"),
      detail: root,
    },
    {
      name: "public_pages_load",
      passed: pages.length >= 5 && pages.every((page) => page.status === 200),
      detail: `${pages.length} pages returned HTTP 200`,
    },
    {
      name: "sourcey_generator_visible",
      passed: pages.some((page) => page.contains_sourcey),
      detail: "Sourcey marker found in fetched HTML",
    },
    {
      name: "target_project_visible",
      passed: Boolean(rootPage?.contains_target),
      detail: "go-chi target text found on root page",
    },
    {
      name: "root_package_symbols",
      passed: Boolean(packagePage?.contains_router_symbol),
      detail: "root package page includes router symbols",
    },
    {
      name: "middleware_symbols",
      passed: Boolean(middlewarePage?.contains_middleware_symbol),
      detail: "middleware page includes middleware symbols",
    },
    {
      name: "godoc_symbol_coverage",
      passed: godocCounts.candidate_symbol_hits.length >= 8,
      detail: `${godocCounts.candidate_symbol_hits.length} candidate public symbols found`,
    },
    {
      name: "search_index_coverage",
      passed: searchEntries >= 20,
      detail: `${searchEntries} search index entries`,
    },
  ];

  const passed = checks.every((check) => check.passed);
  if (!passed) {
    throw new Error(`validation failed: ${checks.filter((check) => !check.passed).map((check) => check.name).join(", ")}`);
  }

  const packet = {
    schema: "runx.sourcey_docs.validation_result.v1",
    tool_version: TOOL_VERSION,
    status: "sealed",
    target: {
      repo_url: input.repo_url,
      module: input.module,
      pinned_commit: input.pinned_commit,
      sourcey_version: input.sourcey_version,
    },
    publication: {
      public_url: root,
      parent_domain: new URL(root).hostname,
      repository: "https://github.com/fengyangxxx/go-chi-sourcey-docs",
      pages,
    },
    evidence: {
      godoc_sha256: sha256Bytes(godocBytes),
      search_index_sha256: sha256Bytes(searchBytes),
      sourcey_config_sha256: sha256Bytes(fs.readFileSync(resolveInsidePackage("sourcey.config.ts", "sourcey_config"))),
      candidate_symbol_hits: godocCounts.candidate_symbol_hits,
      approximate_public_item_count: godocCounts.approximate_public_item_count,
      search_index_entries: searchEntries,
    },
    checks,
  };

  packet.artifacts = [
    {
      id: packet.evidence.sourcey_config_sha256,
      artifact_id: packet.evidence.sourcey_config_sha256,
      type: "sourcey_config",
      artifact_type: "sourcey_config",
      label: "sourcey.config.ts",
    },
    {
      id: packet.evidence.godoc_sha256,
      artifact_id: packet.evidence.godoc_sha256,
      type: "godoc_snapshot",
      artifact_type: "godoc_snapshot",
      label: "godoc.json",
    },
    {
      id: packet.evidence.search_index_sha256,
      artifact_id: packet.evidence.search_index_sha256,
      type: "search_index",
      artifact_type: "search_index",
      label: "dist/search-index.json",
    },
  ];
  packet.signal = {
    signal_id: `sourcey-docs-validation:${packet.evidence.sourcey_config_sha256}:${packet.evidence.search_index_sha256}`,
    source_events: [
      {
        provider: "github-pages",
        source_locator: root,
        title: "Published go-chi Sourcey documentation site",
      },
      {
        provider: "github",
        source_locator: input.repo_url,
        title: "Target go-chi/chi repository",
      },
    ],
    artifacts: packet.artifacts,
  };

  packet.provenance = {
    output_payload_sha256: sha256Text(canonicalJson({
      target: packet.target,
      publication: packet.publication,
      evidence: packet.evidence,
      checks: packet.checks,
    })),
  };

  process.stdout.write(JSON.stringify(packet));
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${JSON.stringify({ error: { message: error.message } })}\n`);
  process.exitCode = 1;
}
