# GIT rules (repo-local)

Shared git rules come from `.btb-pipeline/client-rules/GIT.md`; only rules
specific to this repository live here.

## Before committing

- **constraint** **Hassfest locally (Docker):** `scripts/validate` runs CI's Hassfest check
  (`ghcr.io/home-assistant/hassfest`) against the working tree — use it to catch
  manifest/dependency/translation errors before pushing. Requires Docker.
