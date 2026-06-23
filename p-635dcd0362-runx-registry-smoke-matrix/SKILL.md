---
name: runx-registry-smoke-matrix-validation
description: Validate a public runx registry install smoke matrix from captured command transcripts.
source:
  type: cli-tool
  command: node
  args:
    - tools/smoke_matrix/validate/run.mjs
runx:
  tags:
    - runx
    - registry
    - smoke-test
---

## What this skill does

This validation skill reads captured command transcripts from a public runx
registry smoke test and emits a receipt-bound matrix result. It is designed for
review packets where the important evidence is the exact command output rather
than a prose summary.

The validator checks:

- the exact `runx --version` output and the minimum required CLI version,
- two public registry package references,
- registry read output for each package,
- clean install command output for each package,
- skill inspect output for each package,
- the isolated `RUNX_HOME` and install destination used during the smoke test,
- the diagnostic result from the attempted published run path.

The skill is read-only. It does not call the registry, install packages, mutate
the tested packages, publish artifacts, or submit anything to Frantic. It only
validates files already captured in this package.

## Inputs

- `command_summary_path`: package-relative path to `command-summary.json`.
- `artifact_dir`: package-relative path to the directory containing stdout and
  stderr captures.
- `runx_home_path`: package-relative isolated runx home used for the test.
- `follow_up_issue_url`: public `runxhq/runx` issue URL for any captured
  blocking run/install/verify failure.

## Output

The primary output is `smoke_matrix_validation_result` with schema
`runx.registry_smoke_matrix.validation_result.v1`.
