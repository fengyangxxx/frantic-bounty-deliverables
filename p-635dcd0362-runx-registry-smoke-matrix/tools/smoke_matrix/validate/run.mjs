import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOL_VERSION = "0.1.0";

const PACKAGES = [
  {
    ref: "runx/dependency-cve-audit@sha-e11c90bbeb16",
    slug: "runx_dependency-cve-audit_sha-e11c90bbeb16",
    skillId: "runx/dependency-cve-audit",
    owner: "runx",
    trustTier: "first_party",
  },
  {
    ref: "ryde-play/dep-upgrade-plan@sha-7a1f34b0",
    slug: "ryde-play_dep-upgrade-plan_sha-7a1f34b0",
    skillId: "ryde-play/dep-upgrade-plan",
    owner: "ryde-play",
    trustTier: "community",
  },
];

function readInputs() {
  const raw = process.env.RUNX_INPUTS_PATH
    ? fs.readFileSync(process.env.RUNX_INPUTS_PATH, "utf8")
    : (process.env.RUNX_INPUTS_JSON || "{}");
  return JSON.parse(stripBom(raw));
}

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
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

function semverAtLeast(versionText, min) {
  const found = String(versionText).match(/runx-cli\s+(\d+)\.(\d+)\.(\d+)/);
  if (!found) {
    return false;
  }
  const actual = found.slice(1).map(Number);
  const required = min.split(".").map(Number);
  for (let i = 0; i < required.length; i += 1) {
    if (actual[i] > required[i]) {
      return true;
    }
    if (actual[i] < required[i]) {
      return false;
    }
  }
  return true;
}

function commandByName(summary, name) {
  const command = summary.find((item) => item.name === name);
  if (!command) {
    throw new Error(`missing command summary entry: ${name}`);
  }
  return command;
}

function artifactFile(root, relativePath, label) {
  const filePath = resolveInsidePackage(relativePath, label);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(`${label} missing: ${relativePath}`);
  }
  return filePath;
}

function fileRecord(relativePath, label) {
  const filePath = artifactFile(packageRoot(), relativePath, label);
  const text = readText(filePath);
  return {
    path: relativePath.replace(/\\/g, "/"),
    bytes: Buffer.byteLength(text, "utf8"),
    sha256: sha256File(filePath),
  };
}

function parseJsonOutput(command, label) {
  const stdoutFile = artifactFile(packageRoot(), command.stdout, `${label} stdout`);
  const text = readText(stdoutFile).trim();
  if (!text) {
    throw new Error(`${label} stdout is empty`);
  }
  return JSON.parse(text);
}

function validatePackage(summary, pkg) {
  const registryReadCommand = commandByName(summary, `${pkg.slug}.registry-read`);
  const addCommand = commandByName(summary, `${pkg.slug}.add`);
  const inspectCommand = commandByName(summary, `${pkg.slug}.inspect`);
  const registryRead = parseJsonOutput(registryReadCommand, `${pkg.ref} registry read`);
  const add = parseJsonOutput(addCommand, `${pkg.ref} add`);
  const inspect = parseJsonOutput(inspectCommand, `${pkg.ref} inspect`);

  const checks = [
    {
      name: "registry_read_exit_zero",
      passed: registryReadCommand.exitCode === 0,
      detail: String(registryReadCommand.exitCode),
    },
    {
      name: "registry_read_success",
      passed:
        registryRead.status === "success" &&
        registryRead.registry?.ref === pkg.ref &&
        registryRead.registry?.skill?.skill_id === pkg.skillId,
      detail: `${registryRead.status || "missing-status"} ${registryRead.registry?.skill?.skill_id || "missing-skill"}`,
    },
    {
      name: "install_exit_zero",
      passed: addCommand.exitCode === 0,
      detail: String(addCommand.exitCode),
    },
    {
      name: "install_success",
      passed:
        add.status === "success" &&
        add.registry?.install?.skill_id === pkg.skillId &&
        ["installed", "unchanged"].includes(add.registry?.install?.status),
      detail: `${add.registry?.install?.status || "missing-install-status"} ${add.registry?.install?.digest || "missing-digest"}`,
    },
    {
      name: "inspect_exit_zero",
      passed: inspectCommand.exitCode === 0,
      detail: String(inspectCommand.exitCode),
    },
    {
      name: "inspect_success",
      passed:
        inspect.status === "ok" &&
        inspect.schema === "runx.skill.inspect.v1" &&
        inspect.registry_provenance?.skill_id === pkg.skillId,
      detail: `${inspect.status || "missing-status"} ${inspect.version || "missing-version"}`,
    },
    {
      name: "trust_tier_matches",
      passed:
        registryRead.registry?.skill?.trust_tier === pkg.trustTier &&
        inspect.registry_provenance?.trust_tier === pkg.trustTier,
      detail: `${registryRead.registry?.skill?.trust_tier || "missing"} / ${inspect.registry_provenance?.trust_tier || "missing"}`,
    },
  ];

  const artifacts = [
    fileRecord(registryReadCommand.stdout, `${pkg.ref} registry stdout`),
    fileRecord(registryReadCommand.stderr, `${pkg.ref} registry stderr`),
    fileRecord(addCommand.stdout, `${pkg.ref} install stdout`),
    fileRecord(addCommand.stderr, `${pkg.ref} install stderr`),
    fileRecord(inspectCommand.stdout, `${pkg.ref} inspect stdout`),
    fileRecord(inspectCommand.stderr, `${pkg.ref} inspect stderr`),
  ];

  return {
    ref: pkg.ref,
    skill_id: pkg.skillId,
    owner: pkg.owner,
    trust_tier: pkg.trustTier,
    registry_digest: registryRead.registry?.skill?.digest
      ? `sha256:${registryRead.registry.skill.digest}`
      : inspect.registry_provenance?.digest,
    profile_digest: inspect.registry_provenance?.profile_digest || registryRead.registry?.skill?.profile_digest || null,
    installed_digest: add.registry?.install?.digest || null,
    install_status: add.registry?.install?.status || null,
    inspect_version: inspect.version || null,
    install_destination: add.registry?.install?.destination || null,
    registry_read_command: registryReadCommand.command,
    install_command: addCommand.command,
    inspect_command: inspectCommand.command,
    checks,
    artifacts,
  };
}

function main() {
  const inputs = readInputs();
  const summaryPath = resolveInsidePackage(inputs.command_summary_path, "command_summary_path");
  const artifactDir = resolveInsidePackage(inputs.artifact_dir, "artifact_dir");
  const runxHome = resolveInsidePackage(inputs.runx_home_path, "runx_home_path");
  if (!fs.statSync(artifactDir).isDirectory()) {
    throw new Error("artifact_dir is not a directory");
  }
  if (!fs.statSync(runxHome).isDirectory()) {
    throw new Error("runx_home_path is not a directory");
  }

  const summary = readJson(summaryPath);
  if (!Array.isArray(summary)) {
    throw new Error("command summary must be an array");
  }

  const versionCommand = commandByName(summary, "runx-version");
  const versionOutput = readText(artifactFile(packageRoot(), versionCommand.stdout, "runx version stdout")).trim();
  const packageResults = PACKAGES.map((pkg) => validatePackage(summary, pkg));
  const dogfoodCommand = commandByName(summary, "runx_dependency-cve-audit_sha-e11c90bbeb16.dogfood-run");
  const dogfoodStdout = readText(artifactFile(packageRoot(), dogfoodCommand.stdout, "dogfood stdout")).trim();
  const dogfoodParsed = JSON.parse(dogfoodStdout);

  const checks = [
    {
      name: "runx_version_captured",
      passed: versionCommand.exitCode === 0 && /^runx-cli\s+\d+\.\d+\.\d+$/.test(versionOutput),
      detail: versionOutput,
    },
    {
      name: "runx_version_minimum",
      passed: semverAtLeast(versionOutput, "0.6.6"),
      detail: "minimum required: runx-cli 0.6.6",
    },
    {
      name: "two_registry_packages_covered",
      passed: packageResults.length >= 2,
      detail: packageResults.map((pkg) => pkg.ref).join(", "),
    },
    {
      name: "all_required_registry_commands_succeeded",
      passed: packageResults.every((pkg) => pkg.checks.every((check) => check.passed)),
      detail: packageResults
        .flatMap((pkg) => pkg.checks.filter((check) => !check.passed).map((check) => `${pkg.ref}:${check.name}`))
        .join(", ") || "all registry read/add/inspect checks passed",
    },
    {
      name: "isolated_runx_home_recorded",
      passed:
        path.relative(packageRoot(), runxHome).replace(/\\/g, "/") === "artifacts-clean/runx-home" &&
        fs.existsSync(path.join(runxHome, "install.json")),
      detail: path.relative(packageRoot(), runxHome).replace(/\\/g, "/"),
    },
    {
      name: "published_run_path_attempt_recorded",
      passed:
        dogfoodCommand.exitCode === 1 &&
        dogfoodParsed.status === "failure" &&
        dogfoodParsed.error?.message?.includes("RUNX_RECEIPT_SIGN_KID"),
      detail: dogfoodParsed.error?.message || "missing dogfood failure",
    },
  ];

  const artifacts = [
    fileRecord(inputs.command_summary_path, "command summary"),
    fileRecord(versionCommand.stdout, "runx version stdout"),
    fileRecord(versionCommand.stderr, "runx version stderr"),
    fileRecord(dogfoodCommand.stdout, "dogfood stdout"),
    fileRecord(dogfoodCommand.stderr, "dogfood stderr"),
    ...packageResults.flatMap((pkg) => pkg.artifacts),
  ].map((artifact) => ({
    id: artifact.sha256,
    artifact_id: artifact.sha256,
    type: "command_transcript",
    artifact_type: "command_transcript",
    label: artifact.path,
    path: artifact.path,
    byte_count: artifact.bytes,
  }));

  const observations = [
    `runx --version output: ${versionOutput}`,
    `OS: ${process.platform}; Node: ${process.version}; shell: PowerShell via runx.cmd`,
    `Install method: runx add <ref> --registry https://api.runx.ai --to <isolated package dir> --json`,
    `Fresh runx home/isolation: ${path.relative(packageRoot(), runxHome).replace(/\\/g, "/")}`,
    `Packages covered: ${packageResults.map((pkg) => pkg.ref).join("; ")}`,
    "Each package has captured registry read, install, and skill inspect stdout/stderr transcripts.",
    `Published run path diagnostic: ${dogfoodParsed.error?.message || "not captured"}`,
    "No blocking registry read/install/inspect failure was observed, so no public follow-up issue was required.",
  ];

  const packet = {
    schema: "runx.registry_smoke_matrix.validation_result.v1",
    tool_version: TOOL_VERSION,
    status: "sealed",
    environment: {
      os: process.platform,
      node: process.version,
      shell: "PowerShell",
      runx_version_output: versionOutput,
      runx_home: path.relative(packageRoot(), runxHome).replace(/\\/g, "/"),
      registry: "https://api.runx.ai",
      command_summary_path: inputs.command_summary_path,
    },
    summary: {
      package_count: packageResults.length,
      command_count: summary.length,
      registry_commands_exit_zero: packageResults.every((pkg) =>
        pkg.checks
          .filter((check) => check.name.endsWith("_exit_zero"))
          .every((check) => check.passed),
      ),
      dogfood_run_exit_code: dogfoodCommand.exitCode,
    },
    packages: packageResults.map(({ artifacts: _artifacts, ...pkg }) => pkg),
    dogfood_diagnostic: {
      command: dogfoodCommand.command,
      exit_code: dogfoodCommand.exitCode,
      stdout: dogfoodCommand.stdout,
      stderr: dogfoodCommand.stderr,
      status: dogfoodParsed.status,
      error_code: dogfoodParsed.error?.code || null,
      error_message: dogfoodParsed.error?.message || null,
      registry_provenance: dogfoodParsed.registry_provenance || null,
    },
    checks,
    observations,
    artifacts,
  };

  packet.signal = {
    signal_id: `runx-registry-smoke-matrix:${sha256Text(canonicalJson(packet.summary))}`,
    source_events: packageResults.map((pkg) => ({
      provider: "runx-registry",
      source_locator: pkg.ref,
      title: `Smoke-tested registry package ${pkg.ref}`,
    })),
    artifacts,
  };
  packet.provenance = {
    output_payload_sha256: sha256Text(canonicalJson({
      environment: packet.environment,
      summary: packet.summary,
      packages: packet.packages,
      dogfood_diagnostic: packet.dogfood_diagnostic,
      checks: packet.checks,
      observations: packet.observations,
    })),
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
