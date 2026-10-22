# Plaque Trouble organic expansion plan

**Goal:** Extend the accepted Plaque Trouble campaign with a larger, deliberately paced campaign
and richer organic medical-inspired scenes and lipid artwork. Keep the experience playful and make
challenge progression clear. The existing 15-level campaign is the accepted baseline.

**Status:** Design contracts accepted; campaign tuning and asset integration are active. The 12 new
SVG assets passed art specification and quality review but are not integrated. **Updated:**
2026-10-22.

## Product direction

- Use 24 total levels across four chapters, expanding the accepted 15-level baseline. The canonical
  stable-ID play order is `[1, 16, 2, 3, 4, 5, 6, 17, 7, 18, 19, 20, 8, 21, 9, 22, 23, 10, 11,
  12, 13, 14, 24, 15]`.
- Preserve the original Act III maintenance mechanics and use Chapter 4 for presentation. Plan a
  coherent migration for legacy version-1 saves; migration implementation and verification remain
  pending.
- Document an ordered challenge curve and chapter progression in the difficulty rubric.
- Expand organic artery scenes and lipid variety through original, editable SVG art. Use Barnsy Ink
  as artistic inspiration, not as a source to copy.
- Keep the game fun as well as informative. Learning does not need to feel like a lecture or a
  memorization test.
- Keep medical framing accurate at an arcade-metaphor level. New lipid forms and scenes should not
  imply that a game object, intervention, or level outcome represents an individual diagnosis or
  treatment recommendation.

## Delivery sequence

| Stage | Work and owner | Exit evidence |
| --- | --- | --- |
| 1. Design contracts | Accepted: `docs/EXPANSION_PLAN.md`, `docs/DIFFICULTY_RUBRIC.md`, and `docs/ART_DIRECTION.md` define the scope, chapter structure, challenge measures, progression rules, art requirements, and medical-art guardrails. | Contract review accepted; campaign implementation proceeds against these settled contracts. |
| 2. Campaign content and runtime | Active: campaign metadata/order and wave pacing are landed; the beginner owner is adjusting the first three levels toward fewer small fragments, higher bounce arcs, and a simpler policy. The progression test was corrected and 10 simulation runs completed; the earlier 13-test baseline predates this tuning. Preserve stable IDs and plan the legacy version-1 save migration. | Verify the canonical order in consumers and evaluate the beginner curve with progression evidence. Do not report the expansion accepted until the campaign checks are complete. |
| 3. Art production and integration | Active: 12 editable SVG assets passed art specification and quality review. Renderer integration is pending. | Integrate and load all assets; verify rendered sizes, distinguishable lipid forms, contrast, and gameplay readability. |
| 4. Integrated acceptance | Fresh reviewers compare the complete expanded game with the accepted contracts. Run the repository's required checks and browser journeys against the integrated campaign, and record actual play evidence and any limits. | All contract gaps are resolved; the expanded campaign is playable from start to finish; progression, art, interface, and medical framing pass review. Record measured evidence and unresolved limitations in the implementation ledger. |

## Dispatch and dependency rules

- Keep Stage 1 contract authors separate from runtime implementation owners. The expansion designer
  owns the expansion plan and rubric; the organic art direction owner owns the art direction.
- Design contracts are accepted. Keep campaign tuning and art integration tied to those contracts;
  ask focused questions when level pacing, lipid interpretation, scene variety, or visual legibility
  is unclear.
- Once the contracts are accepted, content/runtime and SVG production may proceed as separate
  workstreams with named, non-overlapping file ownership. Renderer integration follows both outputs.
- Run tests and independent acceptance reviews after integration, not as a substitute for the
  design and content questions that shape the expansion.
- Keep the existing 15-level acceptance record intact. Record expansion evidence separately and do
  not treat the old campaign's replay as evidence for new levels.
- Route complex gameplay, campaign, or art judgments to `gpt-6.1-sol`; use `gpt-6-luna` for bounded
  documentation work.

## Review checkpoints

At the contract boundary, ask: Does each chapter add a meaningful kind of challenge? Does the
rubric explain why later levels are harder, rather than only assigning larger numbers? Do new lipid
forms communicate a visual difference without suggesting a clinical classification? Do the new
scenes enrich the setting while keeping hazards, targets, and player actions easy to read? Does each
change keep play enjoyable for learners with varied backgrounds?

Raise unresolved questions to the manager before dependent work begins. Record settled product
decisions in [../../DESIGN_DECISIONS.md](../../DESIGN_DECISIONS.md), human-stated preferences in
[../../HUMAN_GUIDANCE.md](../../HUMAN_GUIDANCE.md), and implementation evidence in
[game_implementation.md](game_implementation.md) when expansion work is dispatched.

## Completion

This plan is complete when the accepted design contracts, expanded campaign, integrated artwork,
and fresh acceptance evidence are all in place. Until then, report each stage as planned, active,
or accepted based on its evidence; do not infer implementation completion from the completed
15-level baseline.
