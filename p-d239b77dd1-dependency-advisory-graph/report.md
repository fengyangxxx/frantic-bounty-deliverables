# Dependency Advisory Graph Delivery

Frantic posting: `p-d239b77dd1`

Claim: `frantic:claim:89f66400-885f-4322-979f-797a3249d317`

Deadline: `2026-06-23T03:17:43.295Z`

## Delivered Package

- Package: `dependency-advisory-graph`
- Registry ref: `fengyangxxx/dependency-advisory-graph@0.1.1`
- Public listing: <https://runx.ai/x/fengyangxxx/dependency-advisory-graph@0.1.1>
- Pull request: <https://github.com/runxhq/runx/pull/120>
- Source commit: `83c5c574fe635a6c23473f6649f2948dcfa3080d`
- Raw `X.yaml`: <https://raw.githubusercontent.com/fengyangxxx/runx/83c5c574fe635a6c23473f6649f2948dcfa3080d/skills/dependency-advisory-graph/X.yaml>
- Raw `SKILL.md`: <https://raw.githubusercontent.com/fengyangxxx/runx/83c5c574fe635a6c23473f6649f2948dcfa3080d/skills/dependency-advisory-graph/SKILL.md>

## Revision Evidence Additions

This revision addresses the auto-review evidence gaps without changing the
published skill package.

### runx CLI Version

Command:

```text
runx --version
```

Raw output:

```text
runx-cli 0.6.13
```

This satisfies the bounty requirement for `runx-cli` 0.6.13 or higher.

### Raw X.yaml Fetch

- URL: <https://raw.githubusercontent.com/fengyangxxx/runx/83c5c574fe635a6c23473f6649f2948dcfa3080d/skills/dependency-advisory-graph/X.yaml>
- Fetch result: HTTP 200
- Commit: `83c5c574fe635a6c23473f6649f2948dcfa3080d`
- Path: `skills/dependency-advisory-graph/X.yaml`
- SHA-256: `sha256:afa769aedb6bc3e0f7325ba8a572a42aad3c232de26e838ee1661f952b73a4f2`
- Key fields: `skill=dependency-advisory-graph`, `version=0.1.1`, `catalog.visibility=public`, `catalog.audience=public`, `runner.default.type=cli-tool`, `runner.default.command=node run.mjs`

### Public Output Artifacts

- `install-output.json`: HTTP 200, `sha256:6c6181c4c888df31a5c6af589eba3d7f4b3758062f4ff152198b340093c01cbd`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-d239b77dd1-dependency-advisory-graph/install-output.json>
  Summary: `status=success; install.status=installed; ref=fengyangxxx/dependency-advisory-graph@0.1.1; version=0.1.1`
- `harness-output.json`: HTTP 200, `sha256:d8fb1dad25b5b1f0f346cb949313bba0085263be11db60cbed2ef0c6d894d7c4`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-d239b77dd1-dependency-advisory-graph/harness-output.json>
  Summary: `receipt_count=3; advisory hit closed; clean manifest closed; invalid manifest failed as expected`
- `hosted-harness-output.json`: HTTP 200, `sha256:7560e80a4fa885bb4c3bbca2c82763468359855cc59f160a238e0416ff81196d`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-d239b77dd1-dependency-advisory-graph/hosted-harness-output.json>
  Summary: `status=passed; case_count=3; assertion_error_count=0; graph_case_count=0`
- `dogfood-output.json`: HTTP 200, `sha256:19ba3057392dd6d05adeca228bcb31675564d6ccfd3c3e1d510b09fa4d3883bc`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-d239b77dd1-dependency-advisory-graph/dogfood-output.json>
  Summary: `status=sealed; receipt_id=sha256:a1b3feddc1dadeb88cf239e8ce1f31035ecc6aa0fa2526e883faac5c92f54a61; package=minimist; installed_version=0.0.8; advisory_id=GHSA-vh95-rmgr-6w4m`
- `receipt-verify-output.json`: HTTP 200, `sha256:ccb72d318fda054e5ed044189ad76d98dc6ff5fa16941c51ed20d48d91cf3973`, <https://raw.githubusercontent.com/fengyangxxx/frantic-bounty-deliverables/main/p-d239b77dd1-dependency-advisory-graph/receipt-verify-output.json>
  Summary: `valid=true; digest_status=valid; signature_status=valid; signature_kid=dependency-advisory-graph-local-key`

### Graph Receipt Scope

`graph_receipt` was not produced and is not applicable for this package. The
skill is a standalone `cli-tool` runner and does not invoke or compose other
runx skills, so there is no separate composed graph receipt to cite. The
dogfood skill run receipt remains:

`runx:receipt:sha256:a1b3feddc1dadeb88cf239e8ce1f31035ecc6aa0fa2526e883faac5c92f54a61`

## What The Skill Does

The skill builds an exact-version dependency advisory graph from a dependency
manifest and advisory facts. It emits typed fields for the primary advisory
packet, graph nodes and edges, clean package records, false-positive guards,
validation metadata, optional `evidence.json`, optional `verification.json`, and
an optional Markdown report.

The dogfood run demonstrates `minimist@0.0.8` matching
`GHSA-vh95-rmgr-6w4m` from OSV/GitHub Advisory Database evidence. It also
includes two package-name-only guard cases so the result proves the skill does
not emit findings solely because a package name appears in an advisory record.

## Verification Summary

- Published to the hosted runx registry as `fengyangxxx/dependency-advisory-graph@0.1.1`.
- Clean install from `https://api.runx.ai` succeeded.
- Standalone fixtures passed for advisory hit, clean manifest, and invalid manifest stop/error.
- Harness against the clean installed registry package passed all three cases.
- Registry dogfood produced a sealed receipt.
- `runx verify` accepted the dogfood receipt.
- Targeted official catalog tests passed after moving concrete scenarios into standalone fixtures.
- Raw `runx --version` output is `runx-cli 0.6.13`.
- Raw `X.yaml` fetched from the pinned source commit returned HTTP 200 and was hash recorded.
- The five command output artifacts are listed as public raw URLs with HTTP 200, SHA-256, and inline summaries.
- `graph_receipt` is explicitly marked not applicable because the skill does not compose other runx skills.

## Receipt

`runx:receipt:sha256:a1b3feddc1dadeb88cf239e8ce1f31035ecc6aa0fa2526e883faac5c92f54a61`

## Safety Notes

The skill is read-only. It does not install target packages, execute target
project code, mutate repositories, or submit advisories. It treats zero-finding
results as "no supplied advisory matched both package name and exact installed
version," not as proof of vulnerability absence.
