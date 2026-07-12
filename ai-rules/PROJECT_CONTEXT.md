# Project Context

This file provides guidance to AI coding agents when working with code in this
repository.

Shared Home Assistant integration rules (scaffold layout, vendored
`custom_components` guard, Python/ruff, dev commands, Hassfest, versioning,
Lovelace-card registration) come from
`.btb-pipeline/client-rules/optional/ha-integration.md` via
[HA-INTEGRATION.md](./HA-INTEGRATION.md); only repo-specific facts live here.

## Project Overview

This repo is a single Home Assistant **custom integration**,
`btoddb_ha_reminders` (HACS-installable), that allows the user to set up
reminders and have Home Assistant remind them at the specified time.

## Repo-specific facts

- **Engine unit tests:** `python3 -m pytest` from the repo root. `pytest.ini`
  sets `testpaths`, and `conftest.py` inserts its own directory into `sys.path`
  so `load_module` is importable regardless of working directory.
- **Build the card:** `scripts/deploy-card` builds, bumps the card version, and
  copies the generated bundle into `www/`. Edit TypeScript source at
  `custom_components/btoddb_ha_reminders/card/src/*.ts`.
- **Ship a release:** `scripts/ship` bumps the integration version in
  `custom_components/btoddb_ha_reminders/manifest.json`; it requires exactly
  one bump flag and supports `--public-release`.
