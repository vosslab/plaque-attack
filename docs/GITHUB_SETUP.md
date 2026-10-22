# GitHub Pages setup

This guide covers the repository-side build and the GitHub Pages configuration. A successful local `dist/` build is a static artifact; it does not publish the site by itself.

## Current status

The game implementation and final verification are still in progress. `build_github_pages.sh` currently stops because the required application entry point and page assets are not present yet. GitHub Pages setup can be completed after the build succeeds.

The repository's SSH remote is `git@github.com:vosslab/plaque-attack.git`. No deployed site URL has been confirmed.

## Build and preview

Install Node.js and npm, then clone the repository and install its dependencies:

```bash
git clone git@github.com:vosslab/plaque-attack.git
cd plaque-attack
./devel/setup_typescript.sh
```

Build the static site and preview it locally:

```bash
./build_github_pages.sh
./run_web_server.sh
```

`build_github_pages.sh` type-checks and bundles the TypeScript entry point, copies the HTML and stylesheet, and writes a complete static site under `dist/`, including `.nojekyll`. `run_web_server.sh` rebuilds `dist/` and serves it locally on a random port. Open the localhost address printed by the script. These commands are the intended path; the build and preview cannot succeed until implementation supplies the entry point and page assets.

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
