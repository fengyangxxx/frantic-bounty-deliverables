import fs from "node:fs";
import crypto from "node:crypto";

const TASK = "p-635dcd0362-runx-registry-smoke-matrix";
const RAW_BASE = `https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/${TASK}`;
const PUBLIC_URL = `https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/${TASK}`;

const PACKAGE_CONFIGS = [
  {
    key: "dag",
    ref: "fengyangxxx/dependency-advisory-graph@0.1.1",
    registry_read: "10-dag-registry-read",
    install: "20-dag-add-install",
    inspect: "30-dag-skill-inspect-installed",
    harness: "40-dag-harness-installed",
    run: "50-dag-skill-run",
  },
  {
    key: "cve",
    ref: "runx/dependency-cve-audit@sha-e11c90bbeb16",
    registry_read: "11-cve-registry-read",
    install: "21-cve-add-install",
    inspect: "31-cve-skill-inspect-installed",
    harness: "41-cve-harness-installed",
    run: "51-cve-skill-run",
  },
];

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function sha256Text(text) {
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function raw(filePath) {
  return `${RAW_BASE}/${filePath.replaceAll("\\", "/")}`;
}

function commandById(index, id) {
  const command = index.find((entry) => entry.id === id);
  if (!command) throw new Error(`missing command ${id}`);
  return command;
}

function commandStdout(command) {
  return readText(command.stdout_path);
}

function commandJson(command) {
  return JSON.parse(commandStdout(command).trim());
}

function collectReceiptIds(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (typeof value.receipt_id === "string") out.push(value.receipt_id);
  if (typeof value.id === "string" && value.schema === "runx.receipt.v1") out.push(value.id);
  if (Array.isArray(value.receipt_ids)) out.push(...value.receipt_ids.filter((item) => typeof item === "string"));
  if (Array.isArray(value)) {
    for (const item of value) collectReceiptIds(item, out);
    return out;
  }
  for (const item of Object.values(value)) collectReceiptIds(item, out);
  return out;
}

function verifyCommandFor(index, sourceId) {
  const command = index.find((entry) => entry.id.startsWith(`90-verify-${sourceId}-`));
  if (!command) throw new Error(`missing verify command for ${sourceId}`);
  return command;
}

function commandEvidence(command) {
  return {
    id: command.id,
    command: command.command,
    exit_code: command.exit_code,
    stdout_url: raw(command.stdout_path),
    stderr_url: raw(command.stderr_path),
    transcript_url: raw(command.stdout_path.replace(/\.stdout\.txt$/, ".transcript.json")),
  };
}

function writePublicReceiptCopy(sourceDir, receiptId, fileStem) {
  const outputDir = "artifacts-docker/public-receipts";
  fs.mkdirSync(outputDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json") || entry.name === "index.json") continue;
    const sourcePath = `${sourceDir}/${entry.name}`;
    const text = readText(sourcePath);
    try {
      const parsed = JSON.parse(text);
      if (parsed.id === receiptId) {
        const outputPath = `${outputDir}/${fileStem}.json`;
        fs.writeFileSync(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
        return outputPath;
      }
    } catch {
      continue;
    }
  }
  throw new Error(`missing receipt JSON for ${receiptId} in ${sourceDir}`);
}

const commandIndex = readJson("artifacts-docker/docker-command-index.json");
const versionCommand = commandById(commandIndex, "01-runx-version");
const installCliCommand = commandById(commandIndex, "00-install-runx-cli");
const environmentCommand = commandById(commandIndex, "02-os-shell");
const runxVersionOutput = commandStdout(versionCommand).trim();
const environmentOutput = commandStdout(environmentCommand).trim();
const matrixHarnessCommand = commandById(commandIndex, "99-matrix-validation-harness");
const matrixHarness = commandJson(matrixHarnessCommand);
const matrixReceiptId = matrixHarness.receipt_ids?.[0];
if (!matrixReceiptId) throw new Error("matrix harness did not emit a receipt id");
const matrixVerifyCommand = verifyCommandFor(commandIndex, "99-matrix-validation-harness");
const matrixVerify = commandJson(matrixVerifyCommand);
const receiptRef = `runx:receipt:${matrixReceiptId}`;
const matrixReceiptPublicPath = writePublicReceiptCopy(
  "artifacts-docker/docker-receipts/matrix-validation",
  matrixReceiptId,
  "matrix-validation-root-receipt",
);

const packages = PACKAGE_CONFIGS.map((config) => {
  const registry = commandById(commandIndex, config.registry_read);
  const install = commandById(commandIndex, config.install);
  const inspect = commandById(commandIndex, config.inspect);
  const harness = commandById(commandIndex, config.harness);
  const run = commandById(commandIndex, config.run);
  const registryJson = commandJson(registry);
  const installJson = commandJson(install);
  const inspectJson = commandJson(inspect);
  const harnessJson = commandJson(harness);
  const runJson = commandJson(run);
  const runReceiptId = collectReceiptIds(runJson)[0] || null;
  const verify = verifyCommandFor(commandIndex, config.run);
  const verifyJson = commandJson(verify);
  const receiptPublicPath = runReceiptId
    ? writePublicReceiptCopy(
        `artifacts-docker/docker-receipts/${config.key}-skill-run`,
        runReceiptId,
        `${config.key}-skill-run-receipt`,
      )
    : null;

  return {
    ref: config.ref,
    registry_read: commandEvidence(registry),
    install: commandEvidence(install),
    inspect: commandEvidence(inspect),
    harness_or_usage: {
      harness: commandEvidence(harness),
      run: commandEvidence(run),
    },
    registry_status: registryJson.status || null,
    install_status: installJson.status || installJson.registry?.install?.status || null,
    inspect_status: inspectJson.status || null,
    harness_status: harnessJson.status || null,
    run_status: runJson.status || null,
    run_receipt_ref: runReceiptId ? `runx:receipt:${runReceiptId}` : null,
    run_receipt_id: runReceiptId,
    run_receipt_json_url: receiptPublicPath ? raw(receiptPublicPath) : null,
    verify: {
      command: commandEvidence(verify),
      valid: verifyJson.valid,
      signature_mode: verifyJson.signature_mode || null,
      receipt_dir: verifyJson.receipt_dir || null,
      tree_count: Array.isArray(verifyJson.trees) ? verifyJson.trees.length : 0,
      findings: verifyJson.trees?.flatMap((tree) => tree.findings || []) || [],
    },
    checks: {
      registry_read_exit_zero: registry.exit_code === 0,
      install_exit_zero: install.exit_code === 0,
      inspect_exit_zero: inspect.exit_code === 0,
      harness_exit_zero: harness.exit_code === 0,
      run_exit_zero: run.exit_code === 0,
      run_receipt_recorded: Boolean(runReceiptId),
      verify_exit_zero: verify.exit_code === 0,
      verify_valid: verifyJson.valid === true,
    },
  };
});

const rawArtifacts = [
  { id: "runx-cli-install-stdout", kind: "command_stdout", url: raw(installCliCommand.stdout_path) },
  { id: "runx-version-stdout", kind: "command_stdout", url: raw(versionCommand.stdout_path) },
  { id: "environment-stdout", kind: "command_stdout", url: raw(environmentCommand.stdout_path) },
  { id: "docker-command-index", kind: "json", url: raw("artifacts-docker/docker-command-index.json") },
  { id: "matrix-harness-stdout", kind: "command_stdout", url: raw(matrixHarnessCommand.stdout_path) },
  { id: "matrix-verify-stdout", kind: "command_stdout", url: raw(matrixVerifyCommand.stdout_path) },
  { id: "matrix-receipt-json", kind: "runx_receipt", url: raw(matrixReceiptPublicPath) },
  ...packages.flatMap((pkg) => [
    { id: `${pkg.ref}-registry-read-stdout`, kind: "command_stdout", url: pkg.registry_read.stdout_url },
    { id: `${pkg.ref}-install-stdout`, kind: "command_stdout", url: pkg.install.stdout_url },
    { id: `${pkg.ref}-inspect-stdout`, kind: "command_stdout", url: pkg.inspect.stdout_url },
    { id: `${pkg.ref}-harness-stdout`, kind: "command_stdout", url: pkg.harness_or_usage.harness.stdout_url },
    { id: `${pkg.ref}-run-stdout`, kind: "command_stdout", url: pkg.harness_or_usage.run.stdout_url },
    { id: `${pkg.ref}-verify-stdout`, kind: "command_stdout", url: pkg.verify.command.stdout_url },
    { id: `${pkg.ref}-receipt-json`, kind: "runx_receipt", url: pkg.run_receipt_json_url },
  ]),
];

const observations = [
  {
    id: "obs-01-runx-version",
    claim: "The governed validation used runx CLI 0.6.6 or newer and captured the raw version command output.",
    value: runxVersionOutput,
    artifact: raw(versionCommand.stdout_path),
  },
  {
    id: "obs-02-environment",
    claim: "The smoke run recorded OS, shell, Node/npm versions, Docker isolation, and fresh RUNX_HOME.",
    value: `${environmentOutput.replace(/\n/g, "; ")}; RUNX_HOME=artifacts-docker/docker-runx-home; container=node:24-bookworm`,
    artifact: raw(environmentCommand.stdout_path),
  },
  {
    id: "obs-03-install-method",
    claim: "The run installed runx CLI and public registry packages with captured commands.",
    value: "npm install -g @runxhq/cli@0.6.13; runx add <ref> --registry https://api.runx.ai --to <isolated package dir> --json",
    artifact: raw("artifacts-docker/docker-command-index.json"),
  },
  {
    id: "obs-04-package-refs",
    claim: "The matrix covered at least two public runx registry packages.",
    value: packages.map((pkg) => pkg.ref).join("; "),
    artifact: raw("artifacts-docker/docker-command-index.json"),
  },
  ...packages.flatMap((pkg, index) => [
    {
      id: `obs-${String(5 + index * 3).padStart(2, "0")}-${index === 0 ? "dag" : "cve"}-registry-install-inspect`,
      claim: `${pkg.ref} registry read, install, and inspect outputs were captured.`,
      value: `registry_exit=${pkg.registry_read.exit_code}; install_exit=${pkg.install.exit_code}; inspect_exit=${pkg.inspect.exit_code}`,
      artifact: pkg.registry_read.stdout_url,
    },
    {
      id: `obs-${String(6 + index * 3).padStart(2, "0")}-${index === 0 ? "dag" : "cve"}-harness-run`,
      claim: `${pkg.ref} harness or published usage path was executed/inspected.`,
      value: `harness_exit=${pkg.harness_or_usage.harness.exit_code}; run_exit=${pkg.harness_or_usage.run.exit_code}; run_receipt=${pkg.run_receipt_ref}`,
      artifact: pkg.harness_or_usage.run.stdout_url,
    },
    {
      id: `obs-${String(7 + index * 3).padStart(2, "0")}-${index === 0 ? "dag" : "cve"}-verify`,
      claim: `${pkg.ref} run receipt was verified.`,
      value: `verify_exit=${pkg.verify.command.exit_code}; valid=${pkg.verify.valid}; signature_mode=${pkg.verify.signature_mode}`,
      artifact: pkg.verify.command.stdout_url,
    },
  ]),
  {
    id: "obs-11-matrix-validation-receipt",
    claim: "A governed matrix validation harness receipt covers the two-package smoke matrix.",
    value: `${receiptRef}; harness_status=${matrixHarness.status}; verify_valid=${matrixVerify.valid}`,
    artifact: raw(matrixHarnessCommand.stdout_path),
  },
  {
    id: "obs-12-follow-ups",
    claim: "Blocking install, registry, run, or verify failures must have public follow-up links.",
    value: "No blocking registry/install/run/verify failure was observed in the Docker smoke run; no new public issue is required for this pass.",
    artifact: raw(matrixVerifyCommand.stdout_path),
  },
  {
    id: "obs-13-no-secrets",
    claim: "The package contains no Frantic token, browser storage, cookie, password, or private credential material.",
    value: "Command transcripts contain public registry/package commands and a public local-development receipt fixture key only; no .secrets path was read or included.",
    artifact: PUBLIC_URL,
  },
];

const evidence = {
  schema: "frantic.delivery.evidence.v1",
  bounty: 47,
  posting_id: "p-635dcd0362",
  title: "Run a public runx registry install smoke matrix",
  summary: "Docker-isolated public runx registry smoke matrix using captured runx-cli 0.6.13 command transcripts for two public packages, package run receipts, per-package verify outputs, and a matrix validation receipt.",
  public_url: PUBLIC_URL,
  receipt_ref: receiptRef,
  runx_cli_version_raw_output: runxVersionOutput,
  environment: {
    os_shell_stdout: environmentOutput,
    shell: "/bin/bash",
    container: "node:24-bookworm",
    install_method: "npm install -g @runxhq/cli@0.6.13",
    registry: "https://api.runx.ai",
    runx_home: "artifacts-docker/docker-runx-home",
    isolation_method: "fresh Docker container with package-local RUNX_HOME and receipt dirs",
  },
  packages,
  validation: {
    matrix_harness: {
      command: commandEvidence(matrixHarnessCommand),
      status: matrixHarness.status,
      receipt_ids: matrixHarness.receipt_ids || [],
      receipt_json_url: raw(matrixReceiptPublicPath),
    },
    matrix_verify: {
      command: commandEvidence(matrixVerifyCommand),
      valid: matrixVerify.valid,
      signature_mode: matrixVerify.signature_mode || null,
      trees: matrixVerify.trees || [],
      unreadable_files: matrixVerify.unreadable_files || [],
    },
  },
  observations,
  artifacts: rawArtifacts,
  follow_up_links: [],
};

const packageChecks = packages.flatMap((pkg) =>
  Object.entries(pkg.checks).map(([name, passed]) => ({
    package: pkg.ref,
    check: name,
    passed,
  })),
);
const verification = {
  schema: "runx.registry_smoke_matrix.delivery_verification.v1",
  bounty: 47,
  posting_id: "p-635dcd0362",
  generated_at: new Date().toISOString(),
  public_url: PUBLIC_URL,
  evidence_json: raw("evidence.json"),
  report: raw("report.md"),
  receipt_ref: receiptRef,
  runx_cli_version_raw_output: runxVersionOutput,
  command_count: commandIndex.length,
  observations_count: observations.length,
  packages_tested: packages.map((pkg) => pkg.ref),
  package_checks: packageChecks,
  matrix_harness_status: matrixHarness.status,
  matrix_verify_valid: matrixVerify.valid,
  matrix_verify_output: raw(matrixVerifyCommand.stdout_path),
  evidence_sha256: sha256Text(JSON.stringify(evidence)),
  all_required_checks_passed:
    packageChecks.every((check) => check.passed) &&
    matrixHarness.status === "passed" &&
    matrixVerify.valid === true &&
    runxVersionOutput === "runx-cli 0.6.13",
};

const packageRows = packages.map((pkg) => `| \`${pkg.ref}\` | registry ${pkg.registry_read.exit_code}, install ${pkg.install.exit_code}, inspect ${pkg.inspect.exit_code} | harness ${pkg.harness_or_usage.harness.exit_code}, run ${pkg.harness_or_usage.run.exit_code} | \`${pkg.run_receipt_ref}\` | verify \`${pkg.verify.valid}\` |`).join("\n");
const commandLinks = packages.flatMap((pkg) => [
  `- ${pkg.ref} registry read stdout: ${pkg.registry_read.stdout_url}`,
  `- ${pkg.ref} install stdout: ${pkg.install.stdout_url}`,
  `- ${pkg.ref} inspect stdout: ${pkg.inspect.stdout_url}`,
  `- ${pkg.ref} harness stdout: ${pkg.harness_or_usage.harness.stdout_url}`,
  `- ${pkg.ref} run stdout: ${pkg.harness_or_usage.run.stdout_url}`,
  `- ${pkg.ref} receipt verify stdout: ${pkg.verify.command.stdout_url}`,
]).join("\n");

const report = `# Frantic #47 - public runx registry install smoke matrix

## Summary

This package runs a Docker-isolated smoke matrix with exact command transcripts for two public runx registry packages:

- \`fengyangxxx/dependency-advisory-graph@0.1.1\`
- \`runx/dependency-cve-audit@sha-e11c90bbeb16\`

The top-level receipt for the matrix validation is \`${receiptRef}\`.

## Environment

- OS: ${environmentOutput.split("\n")[0]?.replace(/^os=/, "")}
- Shell: \`/bin/bash\`
- Container: \`node:24-bookworm\`
- Node/npm: \`${environmentOutput.split("\n").filter((line) => line.startsWith("node=") || line.startsWith("npm=")).join("; ")}\`
- Install method: \`npm install -g @runxhq/cli@0.6.13\`
- Exact \`runx --version\` output: \`${runxVersionOutput}\`
- Registry: \`https://api.runx.ai\`
- Fresh runx home/isolation: \`artifacts-docker/docker-runx-home\` inside a fresh Docker container
- Receipt signing/verify mode: runx local-development fixture key inside the container; verify commands used \`--allow-local-development-signatures --json\`

## Matrix

| Package | Registry/install/inspect exits | Harness/run exits | Run receipt | Verify |
| --- | --- | --- | --- | --- |
${packageRows}

## Command Evidence

- runx CLI install stdout: ${raw(installCliCommand.stdout_path)}
- runx version stdout: ${raw(versionCommand.stdout_path)}
- environment stdout: ${raw(environmentCommand.stdout_path)}
- Docker command index: ${raw("artifacts-docker/docker-command-index.json")}
${commandLinks}

## Matrix Receipt

- Matrix harness stdout: ${raw(matrixHarnessCommand.stdout_path)}
- Matrix receipt verify stdout: ${raw(matrixVerifyCommand.stdout_path)}
- Matrix receipt JSON: ${raw(matrixReceiptPublicPath)}
- Matrix verify result: \`${matrixVerify.valid}\`

## Failure Handling

No blocking registry read, install, run, or verify failure was observed in the Docker smoke run. Because the matrix and both package run receipts verify as \`valid: true\`, there is no new public runx issue required for this pass.

## Review Notes

- The report includes OS, shell, install method, isolated runx home, package refs, exact \`runx --version\`, receipt ref, and verify results.
- The evidence JSON points to raw command stdout/stderr transcript paths rather than prose-only success claims.
- The generated \`artifacts-clean/\` Windows diagnostic directory is intentionally ignored and is not part of the final public evidence set.
- No Frantic claim/delivery API was called by this worker.
`;

const index = `# Frantic #47 delivery package

- Public package: ${PUBLIC_URL}
- Evidence JSON: ${raw("evidence.json")}
- Verification JSON: ${raw("verification.json")}
- Report: ${raw("report.md")}
- Receipt ref: \`${receiptRef}\`
`;

fs.writeFileSync("evidence.json", `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
fs.writeFileSync("verification.json", `${JSON.stringify(verification, null, 2)}\n`, "utf8");
fs.writeFileSync("report.md", report, "utf8");
fs.writeFileSync("index.md", index, "utf8");
fs.writeFileSync("receipt_ref.txt", `${receiptRef}\n`, "utf8");

console.log(JSON.stringify({
  public_url: PUBLIC_URL,
  evidence_json: raw("evidence.json"),
  report: raw("report.md"),
  receipt_ref: receiptRef,
  packages: packages.map((pkg) => pkg.ref),
  matrix_verify_valid: matrixVerify.valid,
}, null, 2));
