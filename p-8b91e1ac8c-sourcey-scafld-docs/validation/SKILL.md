---
name: sourcey-docs-validation
description: Validate the live project-owned Sourcey docs proof for Frantic #33.
source:
  type: cli-tool
  command: python3
  cwd: /work
  args:
    - run.py
  timeout_seconds: 90
inputs:
  public_url:
    type: string
    required: true
    description: Live Sourcey documentation URL to validate.
  parent_url:
    type: string
    required: true
    description: Parent project or documentation domain URL.
  repo_url:
    type: string
    required: true
    description: Public source repository URL.
  commit:
    type: string
    required: true
    description: Pinned public source commit.
  min_pages:
    type: string
    required: true
    description: Minimum Sourcey package/page count.
runx:
  category: ops
  input_resolution:
    required:
      - public_url
      - parent_url
      - repo_url
      - commit
      - min_pages
---

# sourcey-docs-validation

Validates the live Sourcey public proof candidate for Frantic #33 without using
private credentials. The runner fetches the project-owned docs URL, parent
project URL, and GitHub repository metadata, then emits JSON observations for
the final evidence packet.
