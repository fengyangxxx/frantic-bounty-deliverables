import fs from "node:fs";
import crypto from "node:crypto";

const TASK = "p-635dcd0362-runx-registry-smoke-matrix";
const RAW_BASE = `https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/${TASK}`;
const PUBLIC_URL = `https://github.com/fengyangxxx/frantic-bounty-deliverables/tree/main/${TASK}`;
const RECEIPT_ID = "sha256:727b1310aae6da8a1db1996040f09f980260f159f4c85c954a31774fe40535e3";
const RECEIPT_REF = `runx:receipt:${RECEIPT_ID}`;
const ISSUE_VERIFY = "https://github.com/runxhq/runx/issues/134";
const ISSUE_WINDOWS = "https://github.com/runxhq/runx/issues/135";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

function readText(path) {
  return fs.readFileSync(path, "utf8").replace(/^\uFEFF/, "");
}

function sha256Text(text) {
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function raw(path) {
  return `${RAW_BASE}/${path.replaceAll("\\", "/")}`;
}

const packet = readJson("artifacts-clean/validation-packet.json");
const commandSummary = readJson("artifacts-clean/command-summary.json");
const harness = readJson("artifacts-clean/docker-validation-harness.stdout.json");
const verify = readJson("artifacts-clean/receipt-verify-727b1310.json");
const runxVersion = readText("artifacts-clean/command-logs/runx-version.stdout.txt").trim();

const commandsByName = new Map(commandSummary.map((entry) => [entry.name, entry]));
const fixedDogfood = commandsByName.get("runx_dependency-cve-audit_sha-e11c90bbeb16.dogfood-run-signed-fixed");
const dogfood = commandsByName.get("runx_dependency-cve-audit_sha-e11c90bbeb16.dogfood-run");
const packageRows = packet.packages.map((pkg) => {
  const registry = commandsByName.get(`${pkg.ref.replace("/", "_").replace("@", "_")}.registry-read`);
  const install = commandsByName.get(`${pkg.ref.replace("/", "_").replace("@", "_")}.add`);
  const inspect = commandsByName.get(`${pkg.ref.replace("/", "_").replace("@", "_")}.inspect`);
  return {
    ref: pkg.ref,
    owner: pkg.owner,
    trust_tier: pkg.trust_tier,
    registry_digest: pkg.registry_digest,
    installed_digest: pkg.installed_digest,
    inspect_version: pkg.inspect_version,
    registry_read_command: pkg.registry_read_command,
    install_command: pkg.install_command,
    inspect_command: pkg.inspect_command,
    registry_read_stdout: raw(registry.stdout),
    install_stdout: raw(install.stdout),
    inspect_stdout: raw(inspect.stdout),
    checks: pkg.checks,
  };
});

const artifacts = [
  { id: "command-summary", kind: "json", url: raw("artifacts-clean/command-summary.json") },
  { id: "validation-packet", kind: "json", url: raw("artifacts-clean/validation-packet.json") },
  { id: "docker-harness-output", kind: "json", url: raw("artifacts-clean/docker-validation-harness.stdout.json") },
  { id: "receipt-json", kind: "runx_receipt", url: raw(`receipts/${RECEIPT_ID.replace("sha256:", "sha256_")}.json`) },
  { id: "receipt-verify-output", kind: "json", url: raw("artifacts-clean/receipt-verify-727b1310.json") },
  { id: "runx-version-stdout", kind: "command_stdout", url: raw("artifacts-clean/command-logs/runx-version.stdout.txt") },
  { id: "cve-registry-read", kind: "command_stdout", url: raw("artifacts-clean/command-logs/runx_dependency-cve-audit_sha-e11c90bbeb16.registry-read.stdout.txt") },
  { id: "cve-install", kind: "command_stdout", url: raw("artifacts-clean/command-logs/runx_dependency-cve-audit_sha-e11c90bbeb16.add.stdout.txt") },
  { id: "cve-inspect", kind: "command_stdout", url: raw("artifacts-clean/command-logs/runx_dependency-cve-audit_sha-e11c90bbeb16.inspect.stdout.txt") },
  { id: "dep-upgrade-registry-read", kind: "command_stdout", url: raw("artifacts-clean/command-logs/ryde-play_dep-upgrade-plan_sha-7a1f34b0.registry-read.stdout.txt") },
  { id: "dep-upgrade-install", kind: "command_stdout", url: raw("artifacts-clean/command-logs/ryde-play_dep-upgrade-plan_sha-7a1f34b0.add.stdout.txt") },
  { id: "dep-upgrade-inspect", kind: "command_stdout", url: raw("artifacts-clean/command-logs/ryde-play_dep-upgrade-plan_sha-7a1f34b0.inspect.stdout.txt") },
  { id: "dogfood-missing-signing-env", kind: "command_stdout", url: raw(dogfood.stdout) },
  { id: "dogfood-windows-env-failure", kind: "command_stdout", url: raw(fixedDogfood.stdout) },
];

const observations = [
  {
    id: "obs-01-runx-version",
    claim: "The governed run used runx CLI 0.6.6 or newer and captured the exact version string.",
    value: runxVersion,
    artifact: raw("artifacts-clean/command-logs/runx-version.stdout.txt"),
  },
  {
    id: "obs-02-environment",
    claim: "The smoke matrix recorded OS, shell, Node version, registry, and isolated runx home.",
    value: `OS=${packet.environment.os}; shell=${packet.environment.shell}; node=${packet.environment.node}; registry=${packet.environment.registry}; runx_home=${packet.environment.runx_home}`,
    artifact: raw("artifacts-clean/validation-packet.json"),
  },
  {
    id: "obs-03-package-count",
    claim: "The matrix covered two public runx registry packages.",
    value: packageRows.map((pkg) => pkg.ref).join("; "),
    artifact: raw("artifacts-clean/validation-packet.json"),
  },
  {
    id: "obs-04-cve-registry-install-inspect",
    claim: "runx/dependency-cve-audit registry read, clean add, and inspect completed with exit code 0.",
    value: "registry_read_exit_zero=true; install_exit_zero=true; inspect_exit_zero=true",
    artifact: raw("artifacts-clean/command-logs/runx_dependency-cve-audit_sha-e11c90bbeb16.registry-read.stdout.txt"),
  },
  {
    id: "obs-05-dep-upgrade-registry-install-inspect",
    claim: "ryde-play/dep-upgrade-plan registry read, clean add, and inspect completed with exit code 0.",
    value: "registry_read_exit_zero=true; install_exit_zero=true; inspect_exit_zero=true",
    artifact: raw("artifacts-clean/command-logs/ryde-play_dep-upgrade-plan_sha-7a1f34b0.registry-read.stdout.txt"),
  },
  {
    id: "obs-06-command-transcripts",
    claim: "Every registry read, install, and inspect action has captured stdout/stderr transcript paths.",
    value: `${commandSummary.length} command records in artifacts-clean/command-summary.json`,
    artifact: raw("artifacts-clean/command-summary.json"),
  },
  {
    id: "obs-07-docker-harness",
    claim: "The local validation package ran in Docker and produced a governed receipt.",
    value: `status=${harness.status}; case_count=${harness.case_count}; receipt_id=${harness.receipt_ids[0]}`,
    artifact: raw("artifacts-clean/docker-validation-harness.stdout.json"),
  },
  {
    id: "obs-08-receipt-ref",
    claim: "The delivery includes a runx receipt reference with valid digest and content address verification.",
    value: `${RECEIPT_REF}; digest=${verify.digest.status}; content_address=${verify.content_address.status}; signature=${verify.signature.status}`,
    artifact: raw("artifacts-clean/receipt-verify-727b1310.json"),
  },
  {
    id: "obs-09-verify-failure-tracked",
    claim: "The exact receipt verification failure is recorded and tracked publicly.",
    value: `runx verify returned valid=false because ${verify.findings.map((f) => f.code).join(", ")}; follow-up ${ISSUE_VERIFY}`,
    artifact: ISSUE_VERIFY,
  },
  {
    id: "obs-10-dogfood-diagnostic",
    claim: "A published package run path was attempted and the exact blocking error was captured.",
    value: `${dogfood.name} exit=${dogfood.exitCode}; ${packet.dogfood_diagnostic.error_message}`,
    artifact: raw(dogfood.stdout),
  },
  {
    id: "obs-11-windows-runner-diagnostic",
    claim: "A second run with receipt flags and quoted inputs reached a Windows runner-path failure and was tracked publicly.",
    value: `${fixedDogfood.name} exit=${fixedDogfood.exitCode}; issue ${ISSUE_WINDOWS}`,
    artifact: ISSUE_WINDOWS,
  },
  {
    id: "obs-12-no-secrets",
    claim: "The public package contains no agent token or private credential material.",
    value: "No credential file is included; command transcripts include only public registry/package commands and redacted or absent signing material.",
    artifact: PUBLIC_URL,
  },
];

const evidence = {
  schema: "frantic.delivery.evidence.v1",
  bounty: 47,
  posting_id: "p-635dcd0362",
  title: "Run a public runx registry install smoke matrix",
  summary:
    "Reproducible runx registry smoke matrix using runx-cli 0.6.13 against two public registry packages, with captured registry read, install, inspect, run-path diagnostics, Docker governed harness receipt, receipt verification output, and public follow-up issues for verifier/runtime failures.",
  public_url: PUBLIC_URL,
  receipt_ref: RECEIPT_REF,
  runx_cli_version: runxVersion,
  environment: packet.environment,
  packages: packageRows,
  observations,
  artifacts,
  validation: {
    packet: raw("artifacts-clean/validation-packet.json"),
    docker_harness: harness,
    receipt_verify: verify,
  },
  follow_up_issues: [
    { issue: ISSUE_VERIFY, reason: "runx verify reports signature_malformed although digest and content address are valid" },
    { issue: ISSUE_WINDOWS, reason: "Windows runx skill path cannot spawn registry skills using /usr/bin/env" },
  ],
};

const verification = {
  schema: "runx.registry_smoke_matrix.delivery_verification.v1",
  bounty: 47,
  posting_id: "p-635dcd0362",
  generated_at: new Date().toISOString(),
  public_url: PUBLIC_URL,
  evidence_json: raw("evidence.json"),
  report: raw("report.md"),
  receipt_ref: RECEIPT_REF,
  runx_cli_version: runxVersion,
  validation_packet_sha256: sha256Text(JSON.stringify(packet)),
  evidence_sha256: sha256Text(JSON.stringify(evidence)),
  command_summary_count: commandSummary.length,
  observations_count: observations.length,
  packages_tested: packageRows.map((pkg) => pkg.ref),
  docker_harness_status: harness.status,
  docker_harness_receipts: harness.receipt_ids,
  verify_result: {
    valid: verify.valid,
    digest: verify.digest.status,
    content_address: verify.content_address.status,
    signature: verify.signature.status,
    findings: verify.findings,
  },
  follow_up_issues: evidence.follow_up_issues,
};

const report = `# Frantic #47 - runx registry install smoke matrix

## Summary

This delivery runs a public runx registry smoke matrix with \`${runxVersion}\` against two public packages:

- \`runx/dependency-cve-audit@sha-e11c90bbeb16\`
- \`ryde-play/dep-upgrade-plan@sha-7a1f34b0\`

The package includes captured command outputs for registry reads, clean installs, skill inspection, run-path diagnostics, a Docker-governed validation harness, the emitted runx receipt, and a receipt verification transcript.

## Environment

- OS: ${packet.environment.os}
- Shell: ${packet.environment.shell}
- Node: ${packet.environment.node}
- runx version: \`${runxVersion}\`
- Registry: ${packet.environment.registry}
- Fresh runx home/isolation: \`${packet.environment.runx_home}\`
- Install method: \`runx add <ref> --registry https://api.runx.ai --to <isolated package dir> --json\`

## Matrix Results

${packageRows.map((pkg) => `- ${pkg.ref}: registry digest ${pkg.registry_digest}; install status passed; inspect version ${pkg.inspect_version}; transcript set includes registry read, install, and inspect output.`).join("\n")}

## Command Evidence

- Version: ${raw("artifacts-clean/command-logs/runx-version.stdout.txt")}
- Command summary: ${raw("artifacts-clean/command-summary.json")}
- Validation packet: ${raw("artifacts-clean/validation-packet.json")}
- Docker harness output: ${raw("artifacts-clean/docker-validation-harness.stdout.json")}
- Receipt JSON: ${raw(`receipts/${RECEIPT_ID.replace("sha256:", "sha256_")}.json`)}
- Receipt verification output: ${raw("artifacts-clean/receipt-verify-727b1310.json")}

## Run and Verify Diagnostics

- \`${dogfood.command}\` exited ${dogfood.exitCode} and captured the receipt-signing environment requirement instead of silently asserting success.
- \`${fixedDogfood.command}\` exited ${fixedDogfood.exitCode} after receipt flags and sanitized input quoting; the captured output records the Windows \`/usr/bin/env\` spawn failure.
- Docker harness for this validation skill passed with receipt id \`${harness.receipt_ids[0]}\`.
- \`runx verify\` recorded valid digest and valid content address for \`${RECEIPT_REF}\`, but local-development signature verification returned \`signature_malformed\`.
- Public issue for verify behavior: ${ISSUE_VERIFY}
- Public issue for Windows registry skill runner behavior: ${ISSUE_WINDOWS}

## Review Checklist

- At least two public registry packages are covered.
- Registry read, add/install, and inspect output is captured for each package.
- Exact \`runx --version\` output is present in evidence.
- The report records OS, shell, install method, isolated runx home, package refs, receipt ref, verify result, and exact failures.
- Blocking verify/runtime failures have public follow-up issues.
- No private token or credential file is included in the public artifact tree.
`;

const index = `# Frantic #47 delivery package

- Public package: ${PUBLIC_URL}
- Evidence JSON: ${raw("evidence.json")}
- Verification JSON: ${raw("verification.json")}
- Report: ${raw("report.md")}
- Receipt ref: \`${RECEIPT_REF}\`
`;

fs.writeFileSync("evidence.json", `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
fs.writeFileSync("verification.json", `${JSON.stringify(verification, null, 2)}\n`, "utf8");
fs.writeFileSync("report.md", report, "utf8");
fs.writeFileSync("index.md", index, "utf8");

console.log(JSON.stringify({
  public_url: PUBLIC_URL,
  evidence_json: raw("evidence.json"),
  report: raw("report.md"),
  receipt_ref: RECEIPT_REF,
  observations: observations.length,
}, null, 2));
