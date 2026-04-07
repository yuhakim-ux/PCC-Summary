# Version control

## Branch model

| Branch | Purpose |
|--------|---------|
| **`main`** | Default branch. Always deployable: `prototype/` builds (`npm run build`) and matches what you expect in review. |
| **`feature/<topic>`** | Short-lived branches for changes (UI, routes, data). Open a PR into `main` when ready. |
| **`fix/<topic>`** | Bugfixes against `main`. |

Release tags (optional): `v1.0.0`, `v1.1.0` on `main` after meaningful milestones.

## Commits

- Prefer **one logical change per commit** (easier to revert and bisect).
- Message style: imperative, short subject; optional body for *why*.

## What is tracked

- **`prototype/`** — Vite + LWC app (source only; `node_modules/`, `dist/`, and generated icon bundles under `src/build/generated/` stay ignored).
- **`docs/`** — Project notes (e.g. hidden UI toggles).

## What stays out of Git

See root **`.gitignore`**: `node_modules/`, build output, `.env*`, OS junk, `.cursor/`.

## New remote (new GitHub repo)

If you want this codebase under a **new** repository name without losing local history:

1. Create an empty repo on GitHub (no README/license if you will push existing history).
2. Add a second remote and push:

```bash
git remote add new-origin https://github.com/<org>/<new-repo>.git
git push -u new-origin main
```

3. Optionally switch default remote:

```bash
git remote remove origin
git remote rename new-origin origin
```

Or use GitHub CLI: `gh repo create <name> --private --source=. --remote=origin --push` (after `gh auth login`).
