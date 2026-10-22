## 2026-10-21

### Additions and New Features

- Add [GAME_SPEC.md](GAME_SPEC.md) for Plaque Trouble: a 15-level cardiovascular arcade campaign
  with plaque fragmentation, antiplatelet tools, and timed maintenance objectives.
- Specify controls, collision rules, lives, scoring, local records, educational framing, SVG art,
  CSS presentation, TypeScript ownership, implementation milestones, and acceptance criteria.

### Decisions and Failures

- Preserve one-hit fragmentation and distinguish plaque targets from platelet-activation hazards.
  Treat numerical balance values as proposed playtest settings.
- Record human-stated project guidance and establish the specification's authority in
  [HUMAN_GUIDANCE.md](HUMAN_GUIDANCE.md) and [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md).

### Developer Tests and Notes

- Documentation checks: Markdown links and ASCII compliance pass (118 tests).
- This change defines the game; it does not implement or publish it. Runtime, art rendering,
  compiler acceptance, and the complete campaign playthrough remain implementation checks.
