# plaque-attack

Plaque Trouble is a browser arcade game in development, where players split bouncing plaque hazards and control platelet activity with original tools.

**Status:** Implementation is in progress. There is no playable build or confirmed live site yet; final game and browser verification are pending.

<!-- screenshots:begin (managed by screenshot-docs) -->
<!-- screenshots:end -->

## The game

Plaque Trouble turns a familiar bouncing-hazard arcade loop into a colorful cardiovascular adventure. Move a cartoon surgeon along the artery, choose when to fire, and manage the faster hazards created as large plaques split. Later levels shift to platelet-activity targets and antiplatelet tools. Short captions provide optional biology context; the game does not ask players to memorize medical facts.

The planned campaign has 15 levels across three acts. Its educational framing treats the stent and drug weapons as arcade metaphors, with brief explanations of what the real interventions do. The complete behavior and accessibility targets are in the [docs/GAME_SPEC.md](docs/GAME_SPEC.md).

Planned controls are left/right arrows or A/D to move, Space to fire, P or Escape to pause, and Enter to activate a focused menu choice. Touch controls are also specified. These controls are targets from the game specification and have not yet been verified in a playable build.

## Run locally

Use Node.js and npm. From the repository root, install the development dependencies:

```bash
./devel/setup_typescript.sh
```

The intended production build and local preview commands are:

```bash
./build_github_pages.sh
./run_web_server.sh
```

The build writes the static site to `dist/`; the preview script builds it and serves that directory locally. In the current checkout, these two commands stop because the application entry point and HTML/CSS files are still being implemented. A successful build and playable preview remain acceptance gates.

## Project status

The source of truth for game behavior is the [game specification](docs/GAME_SPEC.md). The [implementation ledger](docs/active_plans/active/game_implementation.md) tracks batches and acceptance evidence. The current implementation is not yet ready to play or deploy.

## Documentation

- [docs/GAME_SPEC.md](docs/GAME_SPEC.md) describes the campaign, controls, educational framing, accessibility, and acceptance criteria.
- [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) explains how the static `dist/` build fits GitHub Pages setup.
- [docs/active_plans/active/game_implementation.md](docs/active_plans/active/game_implementation.md) tracks implementation status and pending verification.

## License

Source code: [LICENSE.MIT](LICENSE.MIT).
