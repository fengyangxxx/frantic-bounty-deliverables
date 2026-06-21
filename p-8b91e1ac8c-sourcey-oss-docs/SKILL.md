---
name: sourcey-docs-validation
description: Validate a published Sourcey documentation site against a pinned OSS repository and coverage evidence.
---

# Sourcey Docs Validation

This local validation skill is used for Frantic #33 evidence. It checks a
published Sourcey static site, confirms the public pages load, verifies the
target repository and pinned commit metadata, and binds the coverage evidence to
a runx receipt.

The harness reads only public URLs and local evidence files prepared for this
delivery. It does not use credentials and performs no mutations.
