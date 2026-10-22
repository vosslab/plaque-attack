# GitHub Pages setup

This guide covers the repository-side build and the GitHub Pages configuration. A successful local `dist/` build is a static artifact; it does not publish the site by itself.

## Current status

The 24-stage expansion and mechanics are locally accepted in
[MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md). The surgeon roster, patient recovery map,
gentler stages 4/5 and presentation work are locally accepted in
[RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md), which records the evidence limits.

The repository's SSH remote is `git@github.com:vosslab/plaque-attack.git`. The user confirms the
[live game](https://vosslab.github.io/plaque-attack/). The deployed revision has not been verified;
local acceptance does not establish that these changes are deployed. No push or deployment was
performed during this local work.

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

The repository already contains the discoverable workflow at
[deploy-pages.yml](../.github/workflows/deploy-pages.yml). A clone includes this workflow; it does
not need to be copied from the root-level template.

For a new fork, open **Pages** in its GitHub repository settings and set **Build and deployment**
source to **GitHub Actions**. The workflow runs on pushes to `main` and manual dispatch. It
installs npm dependencies, runs `build_github_pages.sh`, and uploads `dist/` as the Pages artifact;
GitHub's deploy action publishes that artifact when the workflow runs successfully.

Before relying on publication, confirm the workflow succeeds in the Actions tab, then confirm the published URL in **Settings > Pages** and open it in a browser. Do not infer a live URL from the repository name alone.

## What `dist/` means

`dist/` is generated output for a static web host. It can be inspected or served locally after a successful build. Creating it does not configure Pages, push files to GitHub, run an Actions workflow, or make a public site. Publication requires the configured Pages source and a successful authorized workflow run.
