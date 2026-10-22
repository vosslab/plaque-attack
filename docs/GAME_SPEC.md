# Plaque Attack game specification

Plaque Attack is a single-player browser arcade game inspired by Bubble Trouble: move a cartoon
cardiovascular surgeon along the floor, fire upward, dodge drifting hazards, and turn one large
plaque into progressively smaller fragments. The campaign then shifts to antiplatelet tools and
the sustained control of small platelet hazards.

Status: current source contract, 2026-10-22. The expanded game has 24 stages in four chapters,
with deterministic fluid motion, original organic SVG art, tissue shelter, automatic floor
following, optional membrane pockets, and bounded plaque merging. Six cosmetic surgeons and a
persistent patient recovery map extend that baseline. Current delivery evidence is in
[RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md); historical mechanics evidence
is in [MECHANICS_ACCEPTANCE.md](MECHANICS_ACCEPTANCE.md).
[EXPANSION_PLAN.md](EXPANSION_PLAN.md) owns the exact stage matrix, stable IDs, chapter metadata,
and migration contract; [DIFFICULTY_RUBRIC.md](DIFFICULTY_RUBRIC.md) owns challenge measurements.
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md#stage-placement-matrix) owns the single
mechanics placement matrix. Numerical balance values remain tunable.

## Product and scope

| Item | Specification |
| --- | --- |
| Display title | Plaque Attack |
| Repository | `plaque-attack`; keep its existing name |
| Genre | 2D arcade action with a cardiovascular theme |
| Audience | Casual players and biology learners; no medical knowledge required |
| Platform | Desktop browser first, with responsive menus and touch controls |
| Session | Short individual rounds; total campaign duration remains subject to playtesting |
| Campaign | 24 stages in four six-stage chapters; three mechanical acts |
| Visual direction | Colorful vector art, readable silhouettes, polished browser-arcade presentation |
| Delivery | Static TypeScript application, HTML5 Canvas arena, HTML menus and HUD |
| Persistence | Local surgeon selection, recovery IDs, settings, unlocks, and five best campaign scores |

The first release includes the whole campaign, tutorial prompts, pause, practice, local scores,
sound controls, and the three weapon modes. Multiplayer, accounts, online leaderboards, a shop,
drug dosing, clinical decision simulation, and a separate mobile app are outside this release.
Bubble Trouble is a mechanics reference. Create original characters, graphics, audio, and layouts;
Miniclip hosting or affiliation is not part of the delivery requirement.

## Player experience

The game should feel immediately understandable and increasingly demanding. The interesting
decision is where to stand and when to fire: a split removes a large obstacle but creates two
smaller ones. Later, rapid aspirin shots and persistent clopidogrel shots reward different timing.
Maintenance asks the player to sustain control rather than chase a permanently empty screen.

1. Read a short objective and see the equipped tool.
2. Move left or right and fire upward while reading the fluid drift patterns.
3. Split plaque or suppress platelet hazards, gaining points and creating breathing room.
4. Clear the arena or satisfy the timed control objective.
5. See the last pop and surgeon celebration, then see the patient recovery and continue.

Learning stays in brief captions and optional explanation panels. There are no quizzes, required
reading screens, treatment choices, or memorization gates.

## Surgeon and recovery

Choose Dr. Maya Chen, Dr. Jules Okafor, Dr. Imani Patel, Dr. Leo Rivera, Dr. Samira Haddad,
or Dr. Alex Morgan from the menu, briefing, result, or settings. The roster controls say that all
surgeons have the same abilities. The selected appearance persists locally and is used in the
arena and chooser previews. The same full chooser is accessible from briefing and results. Movement, hitbox, muzzle, fire cadence, weapon behavior, scoring,
and progression belong to shared gameplay configuration; roster entries contain presentation only.

A campaign clear adds its stable level ID once to the patient's recovery map. Every successful
result displays the patient and coronary recovery artwork directly, emphasizing the cleared
route before the player continues. The detailed browsing map remains available by button.
Replayed clears, failed runs, and practice cannot duplicate or remove recovery; practice results
show saved progress with an explicit unchanged-recovery label.
Its available stage buttons launch unranked
practice, with normal leave-campaign handling when a run is active. Recovery persists across
reload; an active campaign still does not resume.

The editable heart illustration has 24 fixed territories, restored-route text and patient
portrait tiers. Patient tiers advance at 6, 12, 18, and 24 cleared routes. This is an arcade
progress illustration, never a clinical model or a treatment outcome claim.

## Medical framing

The game is an arcade metaphor. In clinical care, stents support narrowed arteries; aspirin and
clopidogrel reduce platelet activity and clot formation. Neither weapon's arcade animation should
be presented as the physical removal of cholesterol by those medicines.
[NHLBI: Stents](https://www.nhlbi.nih.gov/health/stents),
[NHLBI: Living with a stent](https://www.nhlbi.nih.gov/health/stents/living-with).

Preserve the requested fragmentation mechanic with these presentation rules:

- Stages 1-6 use golden plaque tokens. The stent splits these as an explicit arcade abstraction.
- Stages 7-24 use platelet-activation tokens: small purple clusters representing developing
  platelet aggregation. A successful drug hit makes a token inactive and harmless, then it fades.
- Pharmaceutical levels contain no yellow plaque targets. Drug shots do not dissolve plaque or
  portray the dissolution of an established clot.
- The transition changes the challenge, not a patient's prescription. The implanted stent remains
  visible in the background; the game does not imply that medication replaces or removes it.
- The smaller later targets represent a different hazard class, not proof that aspirin has
  reduced plaque size. Atherosclerosis care continues beyond the arcade victory.
- The surgeon is a cartoon avatar. The arena is a schematic artery, with no anatomical scale.

The brief level-one caption reads: "Arcade model: real stents hold arteries open."
The first aspirin-stage caption reads: "New target: platelet activation. Antiplatelet drugs help prevent
clot formation." A dismissible "The real medicine" panel explains the difference in more detail.
The screen label is "Active platelet hazards", shortened to "Active hazards" in compact layouts;
avoid presenting the counter as a clinical measurement of clot burden or blood flow.

The educational panel explains that plaque contains more than cholesterol and that long-term care
can include lipid management and lifestyle changes. Drug timing, projectile range, and relative
strength are game balance choices, not comparisons of real medication efficacy.
[AHA: Atherosclerosis](https://www.heart.org/en/health-topics/cholesterol/about-cholesterol/atherosclerosis),
[AHA: Vascular health](https://www.heart.org/en/health-topics/vascular-health).

## Controls and arena

| Input | Action |
| --- | --- |
| Left arrow / A | Move left |
| Right arrow / D | Move right |
| Space | Fire; holding repeats at the tool's allowed rate |
| P / Escape | Pause or resume active play |
| Enter / fresh Space press | Start from a briefing or activate the result's primary action |
| Tab, then Enter / Space | Focus and activate native buttons |
| Touch controls | Separate left, right, and fire buttons; simultaneous movement and fire |

Movement starts and stops immediately. There is no jumping, aiming, momentum, or weapon selection
during a round. Each level equips its tool; dual therapy alternates shots automatically. Opposite
movement inputs cancel. Firing never captures Space when a menu button or other control has focus.

Continuation requires a fresh physical press after release. Ignore auto-repeat and presses carried
through the clear or another screen transition. One press advances results to briefing; a separate
press starts play. Contextual shortcuts yield to dialogs, editable fields and focused controls.
Final campaign, game-over and practice results use their own play-again/retry actions rather than
a next-level action. The shortcut activates on release of the fresh press.

Successful clears freeze terminal gameplay state while rendering the final pop for approximately
0.3 seconds, followed by a brief cosmetic surgeon celebration; results appear at approximately
1.2 seconds total. The celebration changes presentation only, with no gameplay jump, collider,
hazard, timer, health or score change. Reduced motion shows static victory feedback. Game over
keeps its immediate result path. These durations are tunable presentation defaults. Task rationale
and acceptance evidence belong to [CLEAR_FLOW.md](CLEAR_FLOW.md).

Use a 960 by 540 logical arena, separate from the HTML HUD and touch bar. Present it inside a
16:10 canvas with uniform scale and centered organic wall margins; circular targets retain their
shape and the simulation bounds stay fixed. The surgeon's feet sit at
the sampled floor, following slopes automatically without jumping. One geometry owner samples
the highest support across the 44-unit footprint, and the muzzle and hitbox follow the feet.
The visual character is approximately 44 by 60 units; its body hitbox is a centered
28 by 46 rectangle aligned to the feet. The held tool and decorative limbs do not cause damage.
Initial movement speed is 300 units per second.

Fit the entire arena without cropping or changing world geometry. Resizing changes presentation,
not velocities, positions, or difficulty. At narrow portrait sizes the arena scales down, with a
nonblocking landscape suggestion. Menus remain usable in portrait; landscape is the preferred
touch-play orientation. Keep touch controls outside the arena with at least 56 CSS-pixel targets.

Leaving the tab or losing window focus pauses the simulation and clears held inputs. Resuming
requires an explicit action. Each level starts with a three-second ready countdown. Ordinary
damage and contact invulnerability do not interrupt play or introduce another countdown.

## Target physics and splitting

Use steady lateral drift and smooth sinusoidal vertical circulation. There is no gravity,
ballistic launch, or floor impact. Walls reflect lateral travel while retaining overshoot.
Size-based lateral speeds are 72/84/94/104 units/s from large to tiny, with a shared angular
rate of 0.6 radians/s; both scale by the level speed multiplier. Targets normally pass through
each other; all lipid stages permit occasional equal-size plaque coalescence. Decorative particles do not collide.

On flat floors, the orbit is centered at half the arena height with amplitude
`H/2 - radius - FLUID_WALL_INSET`. On raised floors, its center and amplitude follow the local
ceiling/floor envelope. The shared 24-unit inset keeps bodies suspended; vertical speed reaches
zero smoothly at each turn. Tissue contacts deflect the same continuous fluid path. Initial phase derives from clamped
spawn height and stable target ID. Every size visits the lower firing and player-contact region,
including aspirin's shorter range. This is a predictable arcade model, not a fluid solver.

| Size | Radius | Successful stent hit |
| --- | --- | --- |
| Large | 58 | Two medium plaques |
| Medium | 40 | Two small plaques |
| Small | 26 | Two tiny plaques |
| Tiny | 16 | Removed |

Each plaque takes one successful hit at its current size. The original request's repeated hits
apply to the complete fragmentation sequence: one large plaque requires 15 successful hits,
including seven splits and eight final removals. Multi-hit armor is not part of the first release.

On a split, remove the parent exactly once and create two next-size children at its position with
a small opposing horizontal offset. Give the children opposite horizontal directions and a
fluid circulation phase derived from their spawn positions. Clamp positions inside the arena.
They become collision-active
on the next simulation tick and cannot be hit by the projectile that created them.

The hit consumes a stent. If several targets overlap the shot simultaneously, resolve the earliest
contact along its sweep, breaking an exact tie by stable entity ID. This prevents one shot from
clearing a whole family in one frame. A small compression, mesh expansion, and particle burst mark
the hit without delaying the simulation.

Platelet hazards use the small and tiny movement presets but have a separate target identity.
They become inactive on one eligible drug hit and never split. Inactive particles immediately leave
the objective count and collision system, even while their fade animation finishes.

## Floor variety

The first three stages retain flat footing. Later stages mix gentle folds and central rises
with three distinct profiles: a low central basin at stages 10/23, a broad raised shelf at
14/24, and an off-center shoulder at 17. All slopes remain smooth, with at most 48 pixels
of relief and a 0.20 maximum gradient. Horizontal speed stays constant; feet and muzzle
follow the floor automatically. There is no jump control. A pale cellular surface follows
the collision contour, with darker tissue below it. Cover and floor heights jointly affect
firing lanes; terrain height alone does not guarantee safety.

## Tissue, pockets, and coalescence

Stages 1-3 keep their flat arena, slow fluid drift and original workload. Tissue first appears at
stage 4, a gentle floor at stage 5, merging at stage 6, and an optional pocket at stage 9. Later
stages interleave mechanics with breathing spaces at tool/objective introductions. The complete
opening workload is 7, 10, 15, 25, 37, and 60 mandatory hits; speeds are 0.55, 0.60, 0.65,
0.75, 0.85, and 1.00. [DIFFICULTY_REVIEW.md](DIFFICULTY_REVIEW.md) records the stage-4/5
correction and its evidence. The placement matrix lives only in [STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md#stage-placement-matrix).

Tissue consists of visible 12x12 solid cells, separate from decorative scenery and the permanent
floor. Every projectile, including stents and piercing clopidogrel, ends at its first tissue
contact. An impact removes the contacted cell and its occupied horizontal neighbors, up to three
cells, without hit points or streak credit. A clopidogrel shot can hit targets before reaching
tissue. Hazard contact also erodes tissue and deflects the hazard; separation and a cooldown are
required before another erosion entry. All contacts use occupancy frozen at tick start, then
commit deduplicated erosion once. A new hole admits shots and hazards on the following tick.
Reflected motion keeps normalized continuous segments for shot, merge, and player collision.

Membrane pockets show their enclosed contents. Sealed pockets are optional and do not prevent
completion or count toward overload. Once breached by a shot or hazard, their finite contents are
committed: a 0.75-second warning precedes release, and pending contents block completion. Releases
wait for capacity and a safe player clearance without dropping hazards or allowing immediate
contact damage. Only active hazards count toward overload; unopened contents remain optional.

Only same-size plaque below large can merge into the next preset size; platelets never merge.
Stages 1-6 use a 5%, 8%, 12%, 16%, 20%, and 25% chance per eligible new contact entry.
Their cooldowns are 3, 3, 2.5, 2, 1.75, and 1.5 seconds; successful-merge budgets are
1, 1, 2, 3, 4, and 5. Stage 6 retains four large initial plaques and 32 leaf units.
Persistent overlap does not reroll. Merged direction follows averaged parent horizontal velocity,
with lower-ID direction breaking a near-zero tie; speed comes from the new size preset times level
speed. Splits inherit remaining cooldown, and new merged targets activate next tick. Merges
conserve leaf mass and add one future hit each, bounding removal work by the baseline/opened-pocket
hit tree plus merge budget. Tissue carving and size coalescence are arcade abstractions, not
claims about drugs destroying tissue or literal physical droplet size.

## Weapons and hit rules

### Coronary stent

The stent device launches a silver mesh tip upward at 900 units per second. An 8-unit-wide mesh trail
extends from the original firing point to the tip, forming a vertical harpoon-like hit region.
The entire grown segment can hit plaque. Its base stays at the firing position as the surgeon
moves away. Limit the player to one active stent and a minimum 0.35-second firing interval.

On contact, the stent expands briefly and disappears. A miss disappears 0.25 seconds after the tip
reaches the ceiling, with an overall maximum lifetime of one second. Holding fire launches the
next shot only after both the active-shot restriction and cooldown permit it.

### Aspirin

Aspirin fires a small white, scored tablet token vertically at 700 units per second. Initial firing
interval is 0.22 seconds, range is 340 logical units, and the maximum is three active shots. Each
shot inactivates one small or tiny platelet hazard and disappears. The player succeeds by moving
beneath low targets and firing frequent, precise shots.

### Clopidogrel

Clopidogrel fires a blue oblong tablet token with a distinct outline and pulse trail. Initial firing
interval is 0.75 seconds, speed is 320 units per second, lifetime is 1.5 seconds, and the maximum is
two active shots. A shot can inactivate up to three distinct platelet hazards before disappearing.
It leaves the arena at the ceiling. Repeated overlap with the same target never produces more hits.

This tool rewards lining up several hazards along a persistent shot. Its silhouette is symbolic;
the drawing does not identify a commercial pill or prescribe a formulation.

### Dual antiplatelet mode

Alternate aspirin and clopidogrel shots on a shared 0.35-second firing interval, starting with
aspirin on each level. Retain each shot's range, lifetime, and target limit, with a shared maximum
of five live projectiles. A shot-cap block does not advance the alternation. This is an arcade
pattern, not an instruction to alternate real medication doses.

| Tool | Plaque target | Platelet hazard |
| --- | --- | --- |
| Stent | Split or remove according to size | No effect |
| Aspirin | No effect | Inactivate one small or tiny hazard |
| Clopidogrel | No effect | Inactivate up to three small or tiny hazards per shot |

Ordinary levels never equip an incompatible tool. A rejected hit changes no target or score.
Tools have unlimited ammunition; cooldowns and active-shot limits define the firing rhythm.

## Campaign progression

### Ordered chapters and mechanical acts

Campaign display order is separate from stable level ID. The canonical 24-row matrix lives in
[EXPANSION_PLAN.md](EXPANSION_PLAN.md#concrete-stage-matrix); update that matrix and its owning
configuration together rather than maintaining a second numeric table here.

| Display stages | Chapter | Tools and objectives |
| --- | --- | --- |
| 1-6 | Plaque Patrol | Stent; clear all plaque families |
| 7-12 | Platelet Pop | Aspirin; clear initial hazards and finite reinforcements |
| 13-18 | Pulse Partners | Clopidogrel, then dual; finite clears and a 40-second maintenance introduction |
| 19-24 | Flow State | Dual; maintain inclusive safe limits for 40-60 seconds |

The first three stages require seven, ten, and fifteen plaque hits, respectively, with speed
multipliers 0.55, 0.60, and 0.65. They remain ordinary clear rounds with no forced lesson timer.
Later chapters introduce tools with explicit difficulty resets. The rubric explains those resets
and within-block progression; a single increasing number is not a substitute for varied play.

The mechanical `act` field remains 1-3 for plaque intervention, pharmaceutical treatment, and
maintenance. The `chapter` field owns the four-part presentation. Six new scene SVGs and six
editable lipid SVGs supply the organic visual variety. Lipid form selection uses stable target IDs
in the renderer; appearance changes neither target identity nor collision or weapon behavior.

The stent rounds use authored visible starting positions and unlimited elapsed time. Four large
plaques can create 32 tiny descendants, so the existing 32-target capacity remains necessary.
Tooltips teach movement, firing, and fragmentation without requiring reading before play.

Drug stages retain the installed stent and use only small/tiny platelet targets. Finite clears count
scheduled hazards as remaining: an empty interval is not a win. If the arena is empty, the next
finite arrival may advance after its warning. Maintenance entries cycle through authored locations,
starting at the first list entry; seeded selection remains supported by the simulation contract.
The final result says "Maintenance complete", with no claim that coronary disease is cured.

### Maintenance state rules

- A count equal to the safe maximum is allowed. Only a count greater than the maximum starts an
  overload episode. For example, `Active hazards: 6 / 6` is safe; `7 / 6` starts the warning.
- Show a five-second countdown with an amber border and text: "Reduce hazards: 5.0 s".
- Returning to the safe maximum or below cancels the warning immediately and fully resets it.
- Five continuous seconds above the maximum removes one life, resets the multiplier, and begins
  another five-second warning if the arena is still overloaded. Targets remain in play.
- Overload penalties are independent of contact invulnerability. If contact and overload damage
  occur in the same simulation tick, lose at most one life and reset the overload countdown.
- When the level timer reaches zero, stop spawning. Win immediately if the count is safe. If it is
  overloaded, continue play and the existing warning until the count becomes safe or lives run out.
- During this final recovery, show "Time complete - reduce hazards to finish". Survival points
  stop at the nominal duration. Do not reset the warning or grant extra time at the timer boundary.

The objective is sustained management with recoverable overload, not a requirement to keep at
least one hazard alive. Clearing everything is always safe; the next scheduled wave still arrives.

### Fair spawning

New hazards enter from marked upper-arena locations. Telegraph each entry for 0.75 seconds with
an outlined platelet icon and directional marker. A spawn uses a safe vertical separation from
the surgeon and never appears directly inside the player's body. Spawn timing uses simulation
time, so pausing cannot accumulate arrivals.

Campaign configurations stay within 32 active targets. Splitting always creates both children;
never silently discard a child to satisfy a cap. If a timed spawn would exceed capacity, defer it
and preserve its order; do not release a burst of deferred spawns. Maintenance stops and discards
unspawned entries at the end of its duration. Finite waves still require their full configured total.

## Lives and recovery

A campaign starts with three lives. Lives carry across levels and do not automatically refill.
Contact with an active hazard removes one life and gives two seconds of contact invulnerability.
Use an outline pulse and recoil rather than rapid flashing. The player can move and fire during
invulnerability; no knockback pushes the surgeon into another hazard.

If the player remains overlapped when invulnerability expires, another contact can cause damage.
The HUD shows three heart slots plus a text count; hearts represent game lives, not a clinical
measurement. Decorative blood flow is not a second health meter.

At zero lives, freeze the arena and show "Run ended" with the score and level reached. "Retry
campaign" starts at level 1 with three lives and zero score. "Practice this level" restarts the
current unlocked level with three lives and an unranked score. This makes difficult levels
learnable without changing the campaign's survival challenge.

Campaigns finish at display stage 24 (stable level ID 15). Main-menu level select offers any unlocked level in practice mode.
Practice success never unlocks later campaign levels or enters the campaign leaderboard.

## Scoring and records

| Event | Base points |
| --- | --- |
| Split large plaque | 100 |
| Split medium plaque | 150 |
| Split small plaque | 200 |
| Remove tiny plaque | 250 |
| Inactivate small platelet hazard | 200 |
| Inactivate tiny platelet hazard | 250 |
| Complete a level | 1,000 |
| Complete a level without life loss | 500 additional |
| Maintenance survival | 10 per completed second of the nominal timer |

Consecutive successful target hits build the multiplier. Hits 1-4 use x1, hits 5-9 use x2, and
hit 10 onward uses x3. Contact or overload damage resets the streak before later hits are counted.
Misses do not reset it. Reset the streak at each level boundary. Multiply target-hit points only;
completion, no-damage, and survival bonuses are not multiplied.

Present the current hit streak in the compact HUD. Announce the transitions at exactly five
and ten successful hits with a brief cue and optional effects sound. Bounded point feedback
shows the actual awarded target points, including the existing multiplier; it never awards points
itself. Keep reduced-motion feedback stationary. Pause freezes feedback lifetime; retry and level
transitions clear stale cues. These presentation rules add no scoring or balance changes. The
source-grounded rationale and future candidates are in [FUN_SURVEY.md](FUN_SURVEY.md).

A piercing shot awards each target once. Target IDs and resolved events prevent duplicate rewards.
Level completion awards its bonuses once even if the Continue button is pressed repeatedly.
For reference, one large plaque is 3,200 base target points before multipliers and level bonuses.

The local top-five list stores campaign score, level reached, completed/ended status, and date.
Rank by score, then position reached, then earlier record for an exact tie. Expanded records use
canonical order; classic records retain their original 15-level order. Commit one record when a
campaign ends through defeat or completion. Practice and abandoned runs do not enter the list.
Use automatic labels rather than requiring names or accounts.

Settings and unlocked levels persist between visits. An active campaign stays in memory while
paused; a reload returns to the menu. In-progress campaign resumption is outside the first release.
If local storage is unavailable or malformed, play remains available and a quiet settings message
explains that progress cannot be saved. Keep existing unsupported save data intact.

## Screens and interface

| Screen | Main content | Primary actions |
| --- | --- | --- |
| Main menu | Title, artery illustration, short premise, best score if present | Play campaign, Practice, Choose your surgeon, Patient recovery, How to play, High scores, Settings |
| Level briefing | Level name, objective, equipped tool, one target example | Start |
| Gameplay | Arena, level, score, lives, elapsed/remaining time | Movement, fire, pause |
| Successful clear | Last pop, then brief surgeon victory; frozen terminal gameplay state | Wait briefly for result |
| Pause | Frozen arena, objective and controls | Resume, restart practice when applicable, main menu |
| Level result | Patient recovery art, cleared route, objective achieved, points, lives, keyboard hint, optional fact | Continue, patient recovery, choose surgeon, read the real medicine |
| Game over | Run ended, score, level reached, record placement if earned | Retry campaign, practice level, main menu |
| Campaign result | Patient recovery art, maintenance complete, score, final lives, record | Play again, main menu |

Gameplay HUD priority is lives and objective, then tool, then score. Intervention levels show
"Elapsed 01:25"; maintenance shows "Remaining 01:25" and `Active hazards: 4 / 6`. Finite waves show
their remaining total. The overload countdown stays visible adjacent to the count.

Use "Plaque cleared!" after Act I rounds, "Platelet activity controlled!" after Act II clear
rounds, and "Maintenance complete!" after timed rounds. Avoid "artery cured" and medical-emergency
language as a judgment of player performance.

Pause, settings, instructions, and results use real HTML buttons and headings. Keep dialogs
compact and bounded to the viewport, with internal vertical scrolling when necessary. The recovery
dialog places art and the chapter/stage ledger side by side on wide screens and stacks them on
narrow screens. The recovery header and Close footer remain visible while its map scrolls.
Focus enters a
modal when opened and returns to its triggering control when closed. Escape closes help or
settings before affecting the underlying pause state. Returning to the menu from an active
campaign confirms that the current run will end; ordinary retries and setting changes are direct.

## Vector art specification

Apply the SVG creator workflow to original editable sources under `src/assets/` paths.
Every asset has a stable `viewBox`, semantic groups, descriptive unique IDs, and self-contained
colors and geometry. Avoid external fonts, embedded scripts, and externally fetched image content.

| Asset family | Source | Construction and states |
| --- | --- | --- |
| Surgeons | Six base `src/assets/surgeon_*.svg` sources and six `surgeon_*_victory.svg` variants | Shared 96 by 128 viewBox and anchors; distinct identities with raised-arm victory poses |
| Recovery | `src/assets/cardiac_recovery.svg` | Editable heart, vessels and patient-tier symbols; stable-ID territory overlays |
| Plaque | `src/assets/plaque.svg` | 128 by 128 viewBox; irregular yellow contour, orange center, restrained highlights |
| Platelet hazard | `src/assets/platelet.svg` | 64 by 64 viewBox; cluster of violet disks with a scalloped outline |
| Stent | `src/assets/stent.svg` | 32 by 128 viewBox; cylindrical silver mesh with clear diagonal struts |
| Drug icons | `src/assets/aspirin.svg`, `src/assets/clopidogrel.svg` | 32 by 32 viewBoxes; distinct round and oblong tablet silhouettes |
| Artery | `src/assets/artery.svg` | 960 by 540 viewBox; dark lumen, pink wall bands, sparse wall deposits |
| Organic scenes | Six `src/assets/scene-*.svg` assets | Editable wall, lining, lesion, stent, and healing motifs; manifest in [ART_DIRECTION.md](ART_DIRECTION.md) |
| Lipid variants | Six `src/assets/lipid-*.svg` assets | Distinct playful forms, visual-only selection; retain collision-readable silhouettes |

At the actual 44x60 play size, varied stature, body mass, face, hair and posture distinguish the
six surgeons in grayscale and solid silhouette. Shared PPE, gloved hands and an upward-facing
tool preserve the chunky arcade style. Each 96x128 source retains the y123 foot baseline,
x77 tool anchor, y100 upper-body seam and x48 leg split used by the Canvas renderer.
Individual idle and victory cadences are cosmetic; reduced motion uses static poses. The chooser
pairs larger portraits with personality copy and states that all six have the same abilities.
Skin tone is a visual choice, not a gameplay attribute. Concepts and current evidence status
belong to [ART_DIRECTION.md](ART_DIRECTION.md).

Plaque retains a roughly circular occupied silhouette despite an irregular contour. Decorative
protrusions stay close to its collision circle. Tiny targets simplify to a bold outline and a
single highlight. Platelets use clustered disks, making them distinguishable without color.
The artery is a stylized longitudinal corridor; depth, cell size, and surgeon scale are fictional.

Author SVG geometry as the source, then preload it into renderer-owned image resources for Canvas.
Animation may select exported poses or transform renderer-owned layers; CSS does not reach inside
an SVG loaded as an image. A sprite atlas, if used, is derived output and does not replace editable
sources. DOM icons use labeled host controls; decorative images have empty alternatives.

Before accepting art, parse the SVG, check referenced IDs, and inspect browser renders at actual
minimum and maximum display sizes. Verify that the surgeon, plaque, platelet, and tool silhouettes
remain distinct on the artery background, with no clipped strokes or unreadable fine mesh.

## CSS and presentation contract

Use the portable interaction principles in [FUN_VIBES_DESIGN_STYLE.md](FUN_VIBES_DESIGN_STYLE.md)
and the concise learning feedback in [PLAYFUL_TRAINING_GAME_STYLE.md](PLAYFUL_TRAINING_GAME_STYLE.md).
This is a colorful arcade game; a coin shop, daily tasks, and competency certification are not
requirements. Score is the single arcade reward measure.

`src/style.css` owns the HTML shell; Canvas owns the arena drawing. Share a small documented palette, and keep
CSS from controlling collision geometry or simulation timing.

| Color role | Starting value | Use |
| --- | --- | --- |
| Page and panel base | `#15152b` | Menus, HUD, modal surfaces |
| Artery lumen | `#461d32` | Quiet playing field |
| Artery wall | `#b84460` | Peripheral anatomy |
| Main text | `#fff5e8` | Labels and instructions |
| Plaque | `#ffc857` | Yellow hazard with dark outline |
| Platelet | `#c49bff` | Clustered hazard with light edge |
| Primary action | `#38d6c4` | Start and continue, with dark text |
| Stent | `#d7edf4` | Metallic mesh and bright firing trail |
| Warning | `#ffbf69` | Overload outline, count, and icon |

Treat these as proposed tokens, not measured contrast results. Verify normal text at 4.5:1,
large text and essential controls at 3:1, including focus indicators and the real playing field.
Use shape, text, and icons alongside color for weapon identity, damage, and overload.

Use scoped component selectors such as `.game_shell`, `.game_hud`, `.arena_frame`, `.touch_controls`,
`.game_dialog`, and `.action_button`. Define shared color, space, radius, and typography custom
properties at the shell boundary. Keep global rules limited to baseline sizing, typography, and
focus. Start with one stylesheet and low specificity; add cascade layers only if they clarify real
ownership. Avoid scattered overrides and per-element inline presentation rules.

The page uses a centered, width-constrained shell and a grid of HUD, arena, and controls. The HUD
wraps into readable rows instead of shrinking labels. Menus use fluid content height and scroll
within short viewports. Match the Canvas backing dimensions to the displayed size and device pixel
ratio while retaining the fixed logical coordinate system.

Use a rounded, readable system sans-serif stack, bold headings, tabular HUD numerals, generous
button padding, and strong outlines. Motion explains firing, splits, damage, and successful
completion. Keep background cells subdued; avoid large blur filters and screen shake during play.
Respect reduced motion by removing decorative drift, bounce-in panels, and particle showers while
retaining essential target movement. Sound begins muted and is never the only warning channel.

Required rendered checks cover 1440 by 900, 1024 by 768, 844 by 390, and 390 by 844 viewports,
keyboard focus, long level names, 200% browser zoom on menus, normal/reduced motion, and both OS
color preferences. The arcade palette remains intentional in either preference; no separate light
theme is required. Inspect actual screenshots before calling the visual design accepted.

## Sound and educational copy

Provide separate persisted music and effects toggles, both off initially. Audio starts only after
a user action. Pause suspends music and gameplay effects. Limit overlapping impact sounds so a
multi-target hit remains clear. All audio assets must be original or have recorded licenses.

| Event | Sound direction |
| --- | --- |
| Stent fire / impact | Short metallic spring / mesh expansion click |
| Plaque split / tiny removal | Soft crack / bright pop |
| Aspirin / clopidogrel | Light tick / longer electronic pulse |
| Life lost | Low impact tone |
| Overload warning | Sparse, calm warning pulse |
| Level / campaign complete | Short rising phrase / fuller victory variation |

Optional facts are available on result cards and dismissible immediately. Stable IDs identify these
cards independently of campaign display order:

- Level 1: "Atherosclerosis involves plaque buildup in artery walls."
- Level 3: "A coronary stent helps hold a narrowed artery open."
- Level 6: "Aspirin reduces platelet activity and helps prevent blood clots."
- Level 8: "Clopidogrel blocks the platelet P2Y12 receptor, reducing platelet activation."
- Level 11: "Long-term cardiovascular care can combine medicines with lifestyle changes."
- The expanded medicine panel provides six optional sourced cards; reading them never gates play.

The receptor statement and dual-therapy explanation follow
[AHA: Aspirin and dual antiplatelet therapy](https://www.heart.org/en/health-topics/heart-attack/treatment-of-a-heart-attack/aspirin-and-heart-disease).
Keep the education panel focused on treatment roles, with a brief statement that the game is not
a treatment guide. Show references in that panel rather than overlaying citations on the arena.

## Technical architecture

Use strict TypeScript, Canvas 2D, and semantic HTML. Prefer small modules over a game engine or UI
framework for this scope. Retain repository-owned setup and build scripts. Follow
[TYPESCRIPT_STYLE.md](TYPESCRIPT_STYLE.md) and inspect the actual compiler configuration before
implementation; keep canonical vendored configuration changes with their upstream owner.

The dependency direction is input to simulation to events/state to presentation. One simulation
owner mutates gameplay state. Rendering reads snapshots and does not award points, spawn targets,
or advance timers. Persistence stores records and settings, not a copy of live simulation objects.

| Contract area | Canonical home | Responsibility |
| --- | --- | --- |
| Player and input | `src/types/player.ts` | Logical action state, player body and lives |
| Simulation | `src/types/simulation.ts` | Entity identity, plaque/platelet variants, shots, tick outcomes |
| Level rules | `src/types/level.ts` | Clear versus maintenance objectives and validated config references |
| Events | `src/types/events.ts` | Composition of feature-owned hit, damage, and completion events |
| Save boundary | `src/types/save.ts` | Versioned settings, unlocks, top-five record shape |

These feature-owned type files are present in source. Keep shared shapes importable across their
owning modules. Co-locate private helper types with their
implementations; avoid a universal object type with optional fields for every entity.

Use discriminated unions for target kind, projectile kind, game screen, and objective kind. A
maintenance objective requires duration and safe maximum; a clear objective requires a finite
target/wave definition. Keep the `LevelId` union and complete configuration `Record` aligned, and check references where
defined. Exhaustive handling should catch a new objective or weapon that lacks behavior.

Brand entity IDs and distinguish logical coordinates from display coordinates where crossing the
input/render boundary could mix them. Keep tagging assertions in their constructors. Use
`import type`, explicit exported signatures, narrowed indexed access, and `unknown` at storage
boundaries. Do not weaken strictness or assert imported data into the simulation model.

### Simulation and collision order

Advance with a fixed 1/60-second simulation step and render through `requestAnimationFrame`.
Cap accumulated work after stalls; pausing and backgrounding never cause a catch-up spawn burst.
Use an explicit seed for any randomized entry selection, with stable ordering for reproducibility.

Within each tick:

1. Read actions, place the player on the floor, emit an eligible shot, and freeze tissue occupancy.
2. Advance floor-aware target paths with tissue reflection, and advance projectiles.
3. Resolve earliest shot/solid/target contacts, splits and inactivation against the frozen cells.
4. Resolve eligible surviving merge entries and player contacts using the same piecewise paths.
5. Commit erosion and pocket breaches; update releases, arrivals, counts and objective timers.
6. Resolve terminal states and emit score/UI events once.

Use circle-to-rectangle collision for the player and target, and swept projectile-region tests
to avoid tunneling. New split children wait until the following tick for collisions. Contact
damage therefore cannot come from a just-spawned child before the player can see it.

Zero lives takes precedence over a simultaneous clear or timer expiry. A target removed by a
projectile during the tick cannot also damage the player. Pause freezes cooldowns, movement,
spawning, invulnerability, overload, and survival scoring together.

### Persistence and delivery

Use one versioned local-storage key, `plaque_trouble_save`, with explicit validation and bounded
record counts. Version-3 saves include `settings.surgeonId` and a canonical-order
`completedLevelIds` set. Missing or invalid cosmetic IDs use Maya without losing earned progress.
Version-1 migration restores known classic IDs before its historical unlocked level; a completed
classic record restores all 15 classic IDs. Version-2 migration conservatively restores only
classic IDs before its canonical unlocked identity, plus any expanded prefix proved by an
expanded record. A completed expanded record restores all 24 IDs; a completed classic record restores classic IDs only. No unlock-only inference
awards inserted stages. Duplicate or unknown V3 completion IDs make the save malformed. Preserve
legacy settings, tutorial flags, stable unlocked IDs, and records. Tag historical records as `classic` and current records as `expanded`; a legacy
completed record is not a 24-stage completion. Invalid or newer unknown versions retain their
original bytes under read-only failure behavior. Use text rendering for stored/displayed values. Store no patient information,
credentials, analytics identifiers, or personal player details. Storage failures affect saving,
not the ability to start a game.

`src/main.ts` is the application entry, `src/index.html` the host, and `src/style.css` the shell.
Keep asset URLs relative so GitHub Pages project subpaths work. Preload required art before the
Start button enables; present an actionable retry if essential assets fail to load.

- `run_web_server.sh` serves the live local preview.
- `build_github_pages.sh` produces the canonical `dist/` artifact.
- A portable single-file export in `dist-single/` is a separate, optional future request.
- Publishing is a distinct delivery step; a local build does not establish a live deployment.

Target smooth 60 FPS on a representative desktop at the worst campaign density: 32 targets,
five drug shots, and bounded decorative particles. Profile an actual browser run before accepting
performance. Prioritize input and collision stability over effects if frame time exceeds budget.

## Implementation and evidence ownership

Historical 15-level evidence remains in
[game_implementation.md](active_plans/active/game_implementation.md). The accepted earlier
24-stage expansion and mechanics records predate the current roster/recovery delivery. Follow
[organic_expansion.md](active_plans/active/organic_expansion.md) and
[STAGE_MECHANICS_PLAN.md](STAGE_MECHANICS_PLAN.md) for current implementation and evidence status.

Each source owner reports focused compilation and meaningful behavior checks. Final acceptance
requires repository checks, a production build, browser journeys and rendered review. The current
roster/recovery delivery additionally verifies map transitions and migration, with ordinary-input
simulation scoped to the opening six stages. The earlier 24-stage completion/replay belongs to
the mechanics baseline and is not a fresh full-campaign run of this tuning. A failed gate returns
to its source owner.
Keep isolated art rendering, fixture enumeration, automated completion, and human playtesting
separate when describing what passed.

## Acceptance and playtesting

Permanent tests protect stable behavior rather than freezing tunable speeds or spawn intervals.
Keep tuning experiments temporary. Use browser play and agent review for pacing and readability;
optional human feedback may improve tuning but never blocks a milestone.

| Area | Acceptance evidence |
| --- | --- |
| Fragmentation | One large plaque produces two children per split, eight final tiny removals, and 15 total successful hits |
| Collision | Shots cannot tunnel or hit children immediately; removed targets cannot also inflict contact damage |
| Arena | Feet, muzzle and hitbox follow smooth floors; first-three-stage exact state stays unchanged |
| Tissue | Every shot kind stops at first solid, cuts up to three cells, and uses frozen occupancy; hazard entry erosion and reflected paths remain consistent |
| Pockets | Sealed contents optional; breached contents warn, wait safely at capacity, release once and block completion while pending |
| Merging | Equal-size eligible plaque only; seeded entry attempts, inherited cooldown, conserved leaf mass, finite work bound and new-size speed |
| Tools | Stent limits one active shot; aspirin hits once; clopidogrel hits distinct targets up to its limit; dual alternates on successful fires |
| Target identity | Drugs never score against plaque; platelet hazards never split into cholesterol |
| Lives | One damage event per tick, correct contact invulnerability, overload independent, zero lives ends the run |
| Finite waves | Empty intervals do not complete a level with scheduled hazards remaining |
| Maintenance | Equality is safe; continuous overload costs a life; recovery resets the warning; expiry resolves as specified |
| Pause | All simulation clocks stop; no stuck inputs or queued arrivals after focus loss and resume |
| Scoring | No duplicate hits, completion bonuses, survival seconds, or run records; practice stays unranked |
| Progress | All 24 stages are reachable and completable through normal rules; unlock and retry behavior is consistent |
| Storage | Valid records reload; invalid or unavailable storage leaves the game playable |
| Visuals | Distinct silhouettes, measured contrast, readable HUD, no cropped arena or hidden controls at required sizes |
| Accessibility | Keyboard menus, visible focus, touch parity, muted start, reduced motion, text warnings alongside sound/color |
| Build | Compiler and repository checks pass; built Pages artifact loads under a subpath with no application errors or missing assets |

Browser verification includes start, movement plus fire, splitting, damage, pause/resume, clear,
drug transitions, overload/recovery, game over/retry, and leaderboard persistence. Use controlled
fixtures for hard-to-reach failure states and a real campaign playthrough for completion evidence.
Do not claim fully nonvisual action-game accessibility from accessible menus alone.

Inspect ordinary-input play of the first three stages before locking later numbers. Optional human
feedback can test whether new players discover
movement and firing quickly, understand why splitting increases danger, can track tiny fragments,
and can recover from overload without reading a paragraph. Compare aspirin and clopidogrel in
their introduction levels to ensure their timing feels distinct. Tune one variable at a time and
record the observed problem and resulting adjustment.

## Preserved gameplay rules

The following choices make the supplied concept executable while keeping its central mechanics:

- Extend the accepted baseline to 24 stages with four chapters and a gentle opening.
- Resolve repeated hits as the fragmentation chain, with one hit per individual plaque.
- Consume the stent on its first hit so one mesh trail cannot clear an entire descendant tree.
- Use finite reinforcements in authored drug stages and explicit maintenance objectives for timed rounds.
- Use platelet-activation tokens for medication stages and label their inactivation as prevention.
- Treat maintenance limits as inclusive; define overload recovery and timer-expiry behavior.
- Carry three lives through the campaign and offer unranked practice for unlocked levels.
- Keep elapsed time in clear levels, countdown time in maintenance, and no optional blood-flow
  meter that could be mistaken for a simulated clinical quantity.

All balance values remain subject to playtesting. This specification and the canonical expansion
contracts define current behavior. Fresh integrated browser review, repository gates, and the
current roster/recovery evidence belong to [RECOVERY_ROSTER_ACCEPTANCE.md](RECOVERY_ROSTER_ACCEPTANCE.md).
The earlier 24-stage mechanics completion/replay predates the stage-4/5 tuning and does not
constitute a fresh full-campaign run of this delivery.
