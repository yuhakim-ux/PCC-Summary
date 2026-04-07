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

Use this when you want a **different** repo name or org than the current `origin`, **without** losing local commit history.

### Before you start

- Work from the project root, branch **`main`**, with a clean working tree (`git status`).
- Decide **`<org>`** (your user or org on GitHub) and **`<new-repo>`** (the new repository name).

### Option A — Create an empty repo on github.com, then push

1. On GitHub: **New repository**.
2. Set owner to **`<org>`** and name to **`<new-repo>`**.
3. Choose **Public** or **Private**.
4. **Do not** initialize with README, `.gitignore`, or license (avoids merge conflicts on first push).
5. Create the repository and copy its HTTPS URL, e.g. `https://github.com/<org>/<new-repo>.git`.

In your terminal:

```bash
cd /path/to/this/project
git remote add new-origin https://github.com/<org>/<new-repo>.git
git push -u new-origin main
```

6. **Optional — point `origin` at the new repo only** (so `git push` goes there by default):

```bash
git remote remove origin
git remote rename new-origin origin
```

The old **AHIIS** remote URL is removed locally; the old repo on GitHub is unchanged unless you push to it again.

### Option B — GitHub CLI (`gh`)

1. `gh auth login`
2. From the project root:

```bash
gh repo create <new-repo> --private --source=. --remote=new-origin --push
```

Use `--public` instead of `--private` for a public repo. This creates the repo, adds remote `new-origin`, and pushes the current branch.

3. Optionally rename remotes as in Option A (`remove origin`, `rename new-origin origin`).

**Note:** `gh repo create ... --remote=origin` can fail if `origin` already exists; using `--remote=new-origin` avoids that.

### After pushing

- Confirm **Settings → General → default branch** is `main` if needed.
- Add description, topics, and collaborators on GitHub.
