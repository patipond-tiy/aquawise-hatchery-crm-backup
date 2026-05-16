# Personal-account backup mirror

The org repo `aquawise-tech/aquawise-nursery-crm` is mirrored to a personal-account backup at `patipond-tiy/aquawise-nursery-crm-backup` for redundancy.

The mirror is a **complete copy**: every branch, every tag, every commit. It is force-synced — anything in the backup that doesn't exist in the source is deleted. Treat the backup as read-only; never push to it directly.

## How it works

GitHub Actions workflow `.github/workflows/mirror.yml` runs:

- On every push to any branch
- On every tag push
- Daily at 02:00 UTC (cron, as a safety net)
- On manual dispatch from the Actions tab

It clones the source as a `--mirror` (bare) and pushes that to the backup.

## One-time setup

### 1. Create a fine-grained Personal Access Token

On the `patipond-tiy` account:

1. Go to https://github.com/settings/personal-access-tokens/new
2. **Token name**: `aquawise-nursery-crm mirror`
3. **Resource owner**: `patipond-tiy`
4. **Repository access**: **Only select repositories** → pick `aquawise-nursery-crm-backup`
5. **Repository permissions**:
   - Contents: **Read and write**
   - Metadata: Read-only (auto)
6. **Expiration**: 1 year (set a calendar reminder to rotate)
7. Generate and copy the token (`github_pat_...`)

### 2. Add the token as a repo secret

On the source repo (`aquawise-tech/aquawise-nursery-crm`):

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. **Name**: `MIRROR_TOKEN`
4. **Value**: paste the PAT
5. Save

### 3. Trigger the first run

Either push a commit to `main` or go to **Actions → Mirror to personal backup → Run workflow**.

The first run takes ~30 s to clone + push. Subsequent runs are faster (only deltas).

## Verifying

After a successful run:

```bash
git ls-remote https://github.com/patipond-tiy/aquawise-nursery-crm-backup.git | head
```

Should show `refs/heads/main` with the same SHA as the source.

## Rotating the PAT

When the PAT is about to expire:

1. Generate a new one (same permissions as above)
2. Replace the `MIRROR_TOKEN` secret value
3. Delete the old PAT

If the workflow ever fails with "remote: invalid credentials", the token has expired or been revoked.

## Troubleshooting

**"MIRROR_TOKEN secret is not set"** — the workflow's first sanity-check failed. Add the secret per § One-time setup.

**"403 — refusing to allow a Personal Access Token to create or update workflow"** — your PAT doesn't have the `workflows` permission. The mirror workflow does NOT push workflow files (it pushes whatever is on the source), but if the source's `.github/workflows/` ever needs to overwrite the backup's workflow files, you'd hit this. Solution: use a **classic** PAT with `repo` + `workflow` scopes, or grant the fine-grained PAT `Workflows: Read and write` permission.

**Diverged backup** — if someone accidentally pushes to the backup directly, the next mirror run will force-delete those changes. The backup is intentionally not a working copy.
