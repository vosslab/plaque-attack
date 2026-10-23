# Gamewide playful payoff plan

**Status: COMPLETE (2026-10-23).** Six independent reviews are synthesized into one bounded,
implemented and verified change: player-owned seams, a deliberate display-18 current-to-seam
payoff, and readable existing device actions. Source, corrected quality, actual-control browser,
responsive capture and repository checks are accepted. Evidence establishes bounded route
reachability and rendered state; it is not a human fun, learning, accessibility, or balance study.

## Goal and decision

Make one existing finale deliver a deliberate, player-owned current-to-seam payoff, and make
existing device actions readable at phone scale. Preserve the left/right/fire loop, surgeon and
campaign identity, authored 24-stage order, existing mechanics, and recovery rules. Keep source
content and controls authoritative as specified in [GAME_SPEC.md](../../GAME_SPEC.md).

The decisive defect is at the ownership boundary: target-only collision can spend a clearance
seam before a player fires, and target contact can remove the remaining trigger cells. This
contradicts the authored player-operated opportunity. Fix the cause contract first, then compose
display 18's existing current and seam into an intentional setup and release. Display 18 is
selected now because its phases already include small-target groups and a current; recomposition
can demonstrate the chain without changing the campaign's final recovery finale. Display 24
remains unchanged.

## Review synthesis

| Review | Evidence-backed strength | Decision |
| --- | --- | --- |
| Core | Movement, held fire, spatial choices, shelter and tool differences work; guided opening can clear quickly. | Preserve controls and balance. Make no ammo, heat, new dodge, or broad difficulty system. |
| Progression | The 24 displays have a coherent introduce/practice/combine arc and varied finales. | Preserve order and chapter content. Defer a display-13 clopidogrel refresher; forgetting is a plausible cost, not an observed failure. |
| Visual | Strong cast, artery identity and earned recovery; world captions become microtext on phones. | Implement readable device action/state cues using the existing HUD and arena symbols. Defer tissue art and result hierarchy. |
| Experience | Current wide arena becomes small in portrait; briefing duplicates device prose; retry is immediate. | Defer camera/world scaling, briefing preview, and loss advice. These are larger or less directly supported than the selected work. |
| Creativity | Actual non-firing probes spend seams at displays 9 and 18 with zero clears; current gathering is spatially separate from the seam. | Repair player ownership and compose one existing current, target fan, and seam in one finale. Preserve mechanics and ordinary clear route. |
| Overall | Recovery is emotionally strong, but the first route is not visually tied to the patient before/after play. | Defer full patient-to-arena-to-result continuity: valuable, but broader than the concrete seam defect and phone cue issue. |

Other deferrals: split/removal hit-effect distinction, danger warnings, tool-ready indicators,
mechanic-specific briefing art, maintenance transition, and additional stages. They remain
separate hypotheses, not hidden acceptance requirements. Review traces used short scripted input,
practice unlock fixtures, and limited stages; they did not measure human enjoyment or complete
the 24-stage campaign as a study. Evidence and methods remain in the local files
`output/gamewide_reviews/core.md`, `output/gamewide_reviews/progression.md`,
`output/gamewide_reviews/visual.md`, `output/gamewide_reviews/experience.md`,
`output/gamewide_reviews/creativity.md`, and `output/gamewide_reviews/overall.md`.

## Behavioral contracts

- Only an actual projectile hit can trigger a clearance pulse. Target-only contact neither
  consumes the opportunity nor destroys the future shootable trigger. Targets continue to
  reflect from seam tissue; ordinary tissue erosion and lipid reflection remain unchanged.
  This is the settled contract. The source boundary skips target erosion for designated seam
  cells while retaining reflection, and the pulse checks for projectile cause. No-key simulations
  of displays 9, 18, and 24 preserve all three seam cells without a pulse. Actual-control
  composition and integrated verification are complete as recorded below.
- One projectile hit causes at most one pulse. Keep existing pulse radius, scoring, target clear,
  phase gating, newborn-target handling, and earned-restoration semantics.
- A player can finish the selected finale with ordinary weapons if they spend or miss the seam.
  Waiting alone does not award progress, and the composition never scripts target deletion.
- Recompose only the chosen finale using existing current, seam, switch, shield, and target rules.
  The current-to-seam route should offer an understandable setup, commitment, and visible release
  while leaving the existing alternate/safe route viable.
- Derive device cues from existing state. Use the current tactics HUD and seam badge with readable
  action text; add no mechanics state. A simple arena symbol identifies the device. Avoid a second
  mechanics model, tutorial modal, unreadable canvas captions, and hazard-covering labels. Reduced
  motion retains the same meaning.
- Keep the full logical world, collision geometry, simulation scale, and campaign IDs unchanged.

## Milestones and ownership

- `clearance_payoff_impl` owns the landed seam boundary and focused regression: target contact
  reflects without eroding designated seam cells; a real projectile activates one pulse.
- `clearance_payoff_impl` owns display-18 composition and coordinates shared rendering with
  `device_cues_impl`. Actual controls must show weapon-only completion, a deliberate release that
  clears at least two active tiny targets, and completion after an early seam spend. Display 24
  stays unchanged.
- `device_cues_impl` owns readable existing-state action cues on phone, landscape, and desktop.
  Reduced motion keeps the same static meaning without new mechanics state.
- `browser` owns integrated startup, device-state, finale, retry, and responsive capture routes.
- `spec` owns a fresh GAME_SPEC contract and evidence-limit review.
- `quality` owns focused and required repository checks against the reviewed build.
- `integration` owns the final ownership, regression, artifact, evidence, and scope report.

Keep dependent work serialized after the seam contract lands. The manager coordinates corrections;
source owners coordinate the selected finale and cue boundary directly. No human approval or
playtest is an implementation gate.

## Acceptance evidence

- Existing focused behavior coverage passes, including the new target-contact preservation and
  projectile-only one-pulse regression. Do not add permanent tests for authored coordinates,
  exact timing, score, or subjective appearance.
- Actual keyboard controls demonstrate: selected-finale weapon-only clear; selected-finale setup,
  current activation, and seam release with at least two targets cleared; early seam consumption
  followed by ordinary completion; and retry restores the opportunity.
- At displays 18 and 24, verify target contact cannot consume the seam. Verify ordinary tissue
  erosion/reflection, score, phase clear gating, newborn rules, shield collection, and earned
  restoration retain their existing contracts.
- Capture and inspect opening, device, and selected-finale cues at 390x844, 844x390, and
  desktop width of at least 1280px at normal screenshot size. The main matrix uses 1280x800;
  the opening/support supplement uses 1280x900 at the same desktop breakpoint.
  Check ready/active or cooldown/used/collected states, no
  cue overlap with hazards or controls, no overflow, and readable static meaning under reduced
  motion. Include a 390x844 phone screenshot in the evidence.
- Re-run prior startup and finale browser journeys, TypeScript and repository checks, and the
  production build. Report exact outcomes and artifacts; screenshots demonstrate layout and
  state only, not usability or enjoyment.

## Completion ledger

All named milestones are complete. Detailed local evidence is retained in
`output/gamewide_reviews/integration.md`, `output/gamewide_reviews/after/REPORT.md`, and
`output/gamewide_reviews/after/support/REPORT.md`; these generated reports are not published docs.

| Milestone or gate | Accepted evidence |
| --- | --- |
| `clearance_payoff_impl`: ownership | Target contact preserves seam and reflection; real projectile triggers once. Focused regression covers ordinary erosion, scoring and eligibility. No-input probes preserve seams at displays 9/18/24. |
| `clearance_payoff_impl`: composition | Display 18 ordinary clear: 114.450 active seconds, three lives, seam unused. Deliberate current/seam removes two active tiny targets in one tick at 44.850 seconds; all three phases complete at 111.983 seconds, one life. |
| Early spend and retry | Separate phase-one shot spends the seam at 1.617 seconds with all three targets/lives present. Ordinary weapons complete at 111.417 seconds, three lives; retry restores the opportunity. The earlier phase-three spend route is excluded as early-spend proof. |
| `device_cues_impl` | Existing HUD/state and arena symbols cover ready, active, cooling, spent, released, collected and armed states. Final CSS computed badge sizes are 12.8px phone/desktop and 12px landscape; no page/cue overflow or controls overlap. |
| `browser`: motion and matrix | Main current/seam matrix uses 390x844, 844x390 and 1280x800. Reduced-motion two-tiny release completes at 107.817 seconds, two lives. Opening/support supplement adds 15 captures at 390x844, 844x390 and 1280x900 using actual controls and all support states. |
| `browser`: regression | Seven existing startup/recovery browser tests pass. Display 24 no-input observation at 11.483 seconds preserves all three seam cells, unused pulse and zero score; it does not claim full display-24 completion. |
| `spec` | Fresh source specification ACCEPT; 17 focused simulation/Remix tests pass. |
| `quality` | Original phone CSS and canvas-fixture findings corrected at their owners; fresh bounded recheck ACCEPT. Post-fixture full Node suite: 92 pass. Both TypeScript configurations pass; full lint/format before corrections plus scoped correction checks pass. |
| `integration` | Final reviewed source and built JS fingerprints agree across receipts. Earlier mechanics captures use earlier CSS; final typography acceptance uses rebuilt CSS captures. Final Markdown links, guidance format and ASCII checks: 343 pass. |

The startup/finale regression scope is fresh startup, the changed display-18 three-phase finale,
and display-24's shared seam boundary. It does not require or claim an entire campaign traversal.
The practice unlock and surgeon selection are disclosed localStorage fixtures; a detached,
source-assisted predictive planner guides actual keyboard events without mutating the live
simulation. These methods establish reachable controls, not unaided human discoverability.
The six reviews' ranked deferrals remain out of scope, with no hidden follow-up gate.

## Out of scope

Do not redesign controls, camera/world scale, collision geometry, overall difficulty, campaign
order, recovery progression, cast, backgrounds, or touch interaction. Do not add a new tutorial,
weapon, target behavior, stage, generic damage-tip system, or separate mobile mode. Reconsider a
deferred item only if implementation uncovers evidence that it blocks one of these contracts.
