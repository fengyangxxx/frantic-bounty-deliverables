import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_VERSION = "0.2.0";

const PACKAGES = [
  {
    key: "dag",
    ref: "fengyangxxx/dependency-advisory-graph@0.1.1",
    skill_id: "fengyangxxx/dependency-advisory-graph",
    registry_read: "10-dag-registry-read",
    install: "20-dag-add-install",
    inspect: "30-dag-skill-inspect-installed",
    harness: "40-dag-harness-installed",
    run: "50-dag-skill-run",
  },
  {
    key: "cve",
    ref: "runx/dependency-cve-audit@sha-e11c90bbeb16",
    skill_id: "runx/dependency-cve-audit",
    registry_read: "11-cve-registry-read",
    install: "21-cve-add-install",
    inspect: "31-cve-skill-inspect-installed",
    harness: "41-cve-harness-installed",
    run: "51-cve-skill-run",
  },
];

function packageRoot() {
  return path.resolve(__dirname, "../../..");
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function readInputs() {
  const raw = process.env.RUNX_INPUTS_PATH
    ? fs.readFileSync(process.env.RUNX_INPUTS_PATH, "utf8")
    : (process.env.RUNX_INPUTS_JSON || "{}");
  return JSON.parse(stripBom(raw));
}

function resolveInsidePackage(inputPath, label) {
  const root = packageRoot();
  const normalized = String(inputPath || "");
  const resolved = path.isAbsolute(normalized)
    ? path.resolve(normalized)
    : path.resolve(root, normalized);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`${label} escapes the package: ${inputPath}`);
  }
  return resolved;
}

function relativeToRoot(filePath) {
  return path.relative(packageRoot(), filePath).replace(/\\/g, "/");
}

function readText(filePath) {
  return stripBom(fs.readFileSync(filePath, "utf8"));
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function sha256Bytes(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function sha256Text(text) {
  return sha256Bytes(Buffer.from(text, "utf8"));
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function commandById(index, id) {
  const command = index.find((item) => item.id === id);
  if (!command) throw new Error(`missing command transcript: ${id}`);
  return command;
}

function streamPath(command, stream) {
  const key = stream === "stdout" ? "stdout_path" : "stderr_path";
  const filePath = resolveInsidePackage(command[key], `${command.id} ${stream}`);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${command.id} ${stream} file missing: ${command[key]}`);
  }
  return filePath;
}

function readStream(command, stream) {
  return readText(streamPath(command, stream));
}

function parseStdoutJson(command, label) {
  const text = readStream(command, "stdout").trim();
  if (!text) throw new Error(`${label} stdout is empty`);
  return JSON.parse(text);
}

function semverAtLeast(versionText, min) {
  const found = String(versionText).match(/runx-cli\s+(\d+)\.(\d+)\.(\d+)/);
  if (!found) return false;
  const actual = found.slice(1).map(Number);
  const required = min.split(".").map(Number);
  for (let i = 0; i < required.length; i += 1) {
    if (actual[i] > required[i]) return true;
    if (actual[i] < required[i]) return false;
  }
  return true;
}

function collectReceiptIds(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (typeof value.receipt_id === "string") out.push(value.receipt_id);
  if (typeof value.id === "string" && value.schema === "runx.receipt.v1") out.push(value.id);
  if (Array.isArray(value.receipt_ids)) {
    out.push(...value.receipt_ids.filter((item) => typeof item === "string"));
  }
  if (Array.isArray(value)) {
    for (const item of value) collectReceiptIds(item, out);
    return out;
  }
  for (const item of Object.values(value)) collectReceiptIds(item, out);
  return out;
}

function artifactRecord(command, stream, label) {
  const filePath = streamPath(command, stream);
  return {
    id: sha256File(filePath),
    artifact_id: sha256File(filePath),
    type: "command_transcript",
    artifact_type: "command_transcript",
    label,
    path: relativeToRoot(filePath),
    byte_count: fs.statSync(filePath).size,
  };
}

function commandSummary(command) {
  return {
    id: command.id,
    command: command.command,
    exit_code: command.exit_code,
    stdout_path: command.stdout_path,
    stderr_path: command.stderr_path,
  };
}

function verifyRows(index, sourceId) {
  return index
    .filter((item) => item.id.startsWith(`90-verify-${sourceId}-`))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function validatePackage(index, pkg) {
  const registryCommand = commandById(index, pkg.registry_read);
  const installCommand = commandById(index, pkg.install);
  const inspectCommand = commandById(index, pkg.inspect);
  const harnessCommand = commandById(index, pkg.harness);
  const runCommand = commandById(index, pkg.run);
  const registry = parseStdoutJson(registryCommand, `${pkg.ref} registry read`);
  const install = parseStdoutJson(installCommand, `${pkg.ref} install`);
  const inspect = parseStdoutJson(inspectCommand, `${pkg.ref} inspect`);
  const harness = parseStdoutJson(harnessCommand, `${pkg.ref} harness`);
  const run = parseStdoutJson(runCommand, `${pkg.ref} run`);
  const runReceipts = [...new Set(collectReceiptIds(run))];
  const harnessReceipts = [...new Set(collectReceiptIds(harness))];
  const verifyCommands = verifyRows(index, pkg.run);
  const verifyResults = verifyCommands.map((command) => ({
    command: commandSummary(command),
    verdict: parseStdoutJson(command, `${pkg.ref} receipt verify`),
  }));

  const registryText = JSON.stringify(registry);
  const installText = JSON.stringify(install);
  const inspectText = JSON.stringify(inspect);
  const checks = [
    {
      name: "registry_read_exit_zero",
      passed: registryCommand.exit_code === 0,
      detail: String(registryCommand.exit_code),
    },
    {
      name: "registry_read_matches_ref",
      passed: registry.status === "success" && registryText.includes(pkg.skill_id),
      detail: registry.registry?.ref || registry.registry?.skill?.skill_id || "registry output parsed",
    },
    {
      name: "install_exit_zero",
      passed: installCommand.exit_code === 0,
      detail: String(installCommand.exit_code),
    },
    {
      name: "install_output_matches_ref",
      passed: install.status === "success" && installText.includes(pkg.skill_id),
      detail: install.registry?.install?.status || install.status || "install output parsed",
    },
    {
      name: "inspect_exit_zero",
      passed: inspectCommand.exit_code === 0,
      detail: String(inspectCommand.exit_code),
    },
    {
      name: "inspect_output_matches_ref",
      passed: inspectCommand.exit_code === 0 && inspectText.includes(pkg.skill_id),
      detail: inspect.status || inspect.schema || "inspect output parsed",
    },
    {
      name: "harness_or_usage_path_exit_zero",
      passed: harnessCommand.exit_code === 0 || runCommand.exit_code === 0,
      detail: `harness=${harnessCommand.exit_code}; run=${runCommand.exit_code}`,
    },
    {
      name: "run_path_receipt_recorded",
      passed: runCommand.exit_code === 0 && runReceipts.length > 0,
      detail: runReceipts.join(", ") || "missing receipt",
    },
    {
      name: "run_receipt_verify_valid",
      passed: verifyResults.length > 0 && verifyResults.every((item) => item.verdict.valid === true),
      detail: verifyResults.map((item) => `${item.verdict.receipt_id}:${item.verdict.valid}`).join(", ") || "missing verify output",
    },
  ];

  const artifacts = [
    artifactRecord(registryCommand, "stdout", `${pkg.ref} registry read stdout`),
    artifactRecord(registryCommand, "stderr", `${pkg.ref} registry read stderr`),
    artifactRecord(installCommand, "stdout", `${pkg.ref} install stdout`),
    artifactRecord(installCommand, "stderr", `${pkg.ref} install stderr`),
    artifactRecord(inspectCommand, "stdout", `${pkg.ref} inspect stdout`),
    artifactRecord(inspectCommand, "stderr", `${pkg.ref} inspect stderr`),
    artifactRecord(harnessCommand, "stdout", `${pkg.ref} harness stdout`),
    artifactRecord(harnessCommand, "stderr", `${pkg.ref} harness stderr`),
    artifactRecord(runCommand, "stdout", `${pkg.ref} run stdout`),
    artifactRecord(runCommand, "stderr", `${pkg.ref} run stderr`),
    ...verifyCommands.flatMap((command) => [
      artifactRecord(command, "stdout", `${pkg.ref} verify stdout`),
      artifactRecord(command, "stderr", `${pkg.ref} verify stderr`),
    ]),
  ];

  return {
    ref: pkg.ref,
    skill_id: pkg.skill_id,
    registry_read_command: commandSummary(registryCommand),
    install_command: commandSummary(installCommand),
    inspect_command: commandSummary(inspectCommand),
    harness_command: commandSummary(harnessCommand),
    run_command: commandSummary(runCommand),
    run_receipt_ids: runReceipts,
    harness_receipt_ids: harnessReceipts,
    verify_results: verifyResults,
    checks,
    artifacts,
  };
}

function main() {
  const inputs = readInputs();
  const summaryPath = resolveInsidePackage(inputs.command_summary_path, "command_summary_path");
  const artifactDir = resolveInsidePackage(inputs.artifact_dir, "artifact_dir");
  const runxHomePath = String(inputs.runx_home_path || "");
  if (!fs.statSync(artifactDir).isDirectory()) {
    throw new Error("artifact_dir is not a directory");
  }
  const index = readJson(summaryPath);
  if (!Array.isArray(index)) throw new Error("command index must be an array");

  const versionCommand = commandById(index, "01-runx-version");
  const environmentCommand = commandById(index, "02-os-shell");
  const versionOutput = readStream(versionCommand, "stdout").trim();
  const environmentOutput = readStream(environmentCommand, "stdout").trim();
  const packages = PACKAGES.map((pkg) => validatePackage(index, pkg));
  const checks = [
    {
      name: "runx_version_captured",
      passed: versionCommand.exit_code === 0 && /^runx-cli\s+\d+\.\d+\.\d+$/.test(versionOutput),
      detail: versionOutput,
    },
    {
      name: "runx_version_minimum",
      passed: semverAtLeast(versionOutput, "0.6.6"),
      detail: "minimum required: runx-cli 0.6.6",
    },
    {
      name: "environment_captured",
      passed: environmentCommand.exit_code === 0 && environmentOutput.includes("os=") && environmentOutput.includes("shell="),
      detail: environmentOutput.split(/\n/).join("; "),
    },
    {
      name: "two_public_registry_packages_covered",
      passed: packages.length >= 2,
      detail: packages.map((pkg) => pkg.ref).join("; "),
    },
    {
      name: "all_package_checks_passed",
      passed: packages.every((pkg) => pkg.checks.every((check) => check.passed)),
      detail: packages.flatMap((pkg) => pkg.checks.filter((check) => !check.passed).map((check) => `${pkg.ref}:${check.name}`)).join(", ") || "all package checks passed",
    },
    {
      name: "isolated_runx_home_recorded",
      passed: runxHomePath === "artifacts-docker/docker-runx-home",
      detail: runxHomePath,
    },
  ];

  const artifacts = [
    {
      id: sha256File(summaryPath),
      artifact_id: sha256File(summaryPath),
      type: "command_index",
      artifact_type: "command_index",
      label: "docker command index",
      path: relativeToRoot(summaryPath),
      byte_count: fs.statSync(summaryPath).size,
    },
    artifactRecord(versionCommand, "stdout", "runx --version stdout"),
    artifactRecord(versionCommand, "stderr", "runx --version stderr"),
    artifactRecord(environmentCommand, "stdout", "environment stdout"),
    artifactRecord(environmentCommand, "stderr", "environment stderr"),
    ...packages.flatMap((pkg) => pkg.artifacts),
  ];

  const observations = [
    `runx --version output: ${versionOutput}`,
    `Environment: ${environmentOutput.split(/\n/).join("; ")}`,
    "Install method: npm install -g @runxhq/cli@0.6.13 inside node:24-bookworm, then runx add <ref> --registry https://api.runx.ai --to <isolated package dir> --json.",
    `Fresh isolation path: ${runxHomePath}; Docker workdir: ${packageRoot()}`,
    `Packages covered: ${packages.map((pkg) => pkg.ref).join("; ")}`,
    "Each package includes captured registry read, install, inspect, harness or published usage path, run receipt, and runx verify output.",
    "No blocking registry, install, run, or verify failure was observed in the Docker smoke run, so no new follow-up issue is required for this pass.",
  ];

  const payloadForHash = {
    versionOutput,
    environmentOutput,
    packages: packages.map(({ artifacts: _artifacts, ...pkg }) => pkg),
    checks,
    observations,
  };
  const packet = {
    schema: "runx.registry_smoke_matrix.validation_result.v1",
    tool_version: TOOL_VERSION,
    status: "sealed",
    environment: {
      os_shell_stdout: environmentOutput,
      runx_version_output: versionOutput,
      runx_home: runxHomePath,
      registry: "https://api.runx.ai",
      command_summary_path: relativeToRoot(summaryPath),
      artifact_dir: relativeToRoot(artifactDir),
    },
    summary: {
      package_count: packages.length,
      command_count: index.length,
      package_refs: packages.map((pkg) => pkg.ref),
      run_receipt_ids: packages.flatMap((pkg) => pkg.run_receipt_ids),
      verify_valid_count: packages.flatMap((pkg) => pkg.verify_results).filter((item) => item.verdict.valid === true).length,
    },
    packages: packages.map(({ artifacts: _artifacts, ...pkg }) => pkg),
    checks,
    observations,
    artifacts,
    signal: {
      signal_id: `runx-registry-smoke-matrix:${sha256Text(canonicalJson(payloadForHash))}`,
      source_events: packages.map((pkg) => ({
        provider: "runx-registry",
        source_locator: pkg.ref,
        title: `Smoke-tested public registry package ${pkg.ref}`,
      })),
      artifacts,
    },
    provenance: {
      output_payload_sha256: sha256Text(canonicalJson(payloadForHash)),
    },
  };

  const failed = checks.filter((check) => !check.passed);
  if (failed.length) {
    throw new Error(`validation failed: ${failed.map((check) => check.name).join(", ")}`);
  }
  process.stdout.write(JSON.stringify(packet));
}

try {
  main();
} catch (error) {
  process.stderr.write(`${JSON.stringify({ error: { message: error.message } })}\n`);
  process.exitCode = 1;
}
