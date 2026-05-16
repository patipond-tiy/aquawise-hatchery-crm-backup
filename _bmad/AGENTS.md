<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-16 | Updated: 2026-05-16 -->

# _bmad

## Purpose
**Installer-managed BMAD method tooling.** This directory is regenerated on every BMAD install — `config.toml` carries an explicit "Installer-managed. Regenerated on every install — treat as read-only" header. It holds the BMAD module configs, manifests, and Python config-resolution scripts that back the `bmad-*` skills used during planning/QA. It is *tooling*, not product code; the actual execution artifacts (PRD, architecture, stories, QA gates) live under `docs/bmad/`, not here.

## Key Files

| File | Description |
|------|-------------|
| `config.toml` | Installer-managed base config — **read-only**, overwritten on reinstall |
| `config.user.toml` | Personal config overrides (gitignored) |
| `bmm/config.yaml`, `core/config.yaml` | Per-module config + `module-help.csv` |
| `_config/manifest.yaml` | Install manifest + `bmad-help.csv`, `files-manifest.csv`, `skill-manifest.csv` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `bmm/`, `core/`, `custom/` | BMAD module configs (`custom/` holds team/personal overrides that survive reinstall) |
| `_config/` | Generated install manifests and help CSVs |
| `scripts/` | `resolve_config.py`, `resolve_customization.py` — config-resolution helpers invoked by the tooling |

## For AI Agents

### Working In This Directory
- **Treat as read-only.** Do not hand-edit `config.toml` or generated manifests — they are overwritten on the next BMAD install. Durable changes go in `_bmad/custom/config.toml` (team) or `_bmad/custom/config.user.toml` (personal).
- **This is not where work happens.** Product/execution artifacts are `docs/bmad/` (PRD, architecture, code-design, security, stories, QA, UAT). Enter via `docs/README.md` → `docs/bmad/README.md`.
- Subdirectories are pure regenerated config — they are intentionally not given child `AGENTS.md` files.

### Testing Requirements
- None. No runtime code; not covered by Vitest.

### Common Patterns
- Config precedence: installer base (`config.toml`) → team overrides (`custom/config.toml`) → personal overrides (`custom/config.user.toml`), resolved by `scripts/resolve_config.py`.

## Dependencies

### Internal
- Consumed by the `bmad-*` skills; produces context that feeds `docs/bmad/` workflows.

### External
- Python 3 (for the `resolve_*.py` helpers); the BMAD installer toolchain.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
