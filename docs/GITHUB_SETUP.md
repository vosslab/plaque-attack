# GitHub Pages setup

This guide covers the repository-side build and the GitHub Pages configuration. A successful local `dist/` build is a static artifact; it does not publish the site by itself.

## Current status

The 24-level expansion is integrated in source and under local verification. The accepted
15-level baseline has passing build and acceptance evidence; that evidence does not establish
acceptance of the expansion. Fresh repository, build, browser, and full-campaign replay gates are
tracked in [the expansion ledger](active_plans/active/organic_expansion.md).

The repository's SSH remote is `git@github.com:vosslab/plaque-attack.git`. No deployed site URL has been confirmed.

## Build and preview

Install Node.js 24 or newer, npm, and Python 3 for the preview server. Clone the repository and
install its dependencies:

```bash
git clone git@github.com:vosslab/plaque-attack.git
cd plaque-attack
./devel/setup_typescript.sh
source source_me.sh
```

Build the static site and preview it locally:

```bash
./build_github_pages.sh
./run_web_server.sh
```

`build_github_pages.sh` type-checks and bundles the TypeScript entry point, copies the HTML,
stylesheet, and SVG assets, and writes a complete static site under `dist/`, including `.nojekyll`.
`run_web_server.sh` rebuilds `dist/` and serves it locally on a random port. Open the localhost
address printed by the script, choose **Play campaign**, and start level 1. Stop the server with
Ctrl+C. To choose a port explicitly, use `PORT=8728 ./run_web_server.sh`.

## Configure Pages

The repository contains a workflow definition at `deploy-pages.yml`. GitHub only discovers workflow files under `.github/workflows/`, so install it there from the repository root:

```bash
mkdir -p .github/workflows
cp deploy-pages.yml .github/workflows/deploy-pages.yml
```

Commit that workflow with the game source. In the GitHub repository settings, open **Pages** and set **Build and deployment** source to **GitHub Actions**. The workflow runs on pushes to `main` and manual dispatch. It installs npm dependencies, runs `build_github_pages.sh`, and uploads `dist/` as the Pages artifact; GitHub's deploy action publishes that artifact when the workflow runs successfully.

Before relying on publication, confirm the workflow succeeds in the Actions tab, then confirm the published URL in **Settings > Pages** and open it in a browser. Do not infer a live URL from the repository name alone.

## What `dist/` means

`dist/` is generated output for a static web host. It can be inspected or served locally after a successful build. Creating it does not configure Pages, push files to GitHub, run an Actions workflow, or make a public site. Publication requires the configured Pages source and a successful authorized workflow run.
