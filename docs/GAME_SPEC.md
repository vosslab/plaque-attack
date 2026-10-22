# Plaque Trouble game specification

Plaque Trouble is a single-player browser arcade game inspired by Bubble Trouble: move a cartoon
cardiovascular surgeon along the floor, fire upward, dodge bouncing hazards, and turn one large
plaque into progressively smaller fragments. The campaign then shifts to antiplatelet tools and
the sustained control of small platelet hazards.

Status: implementation-ready design draft, 2026-10-21. This document specifies the proposed game;
it does not report an implemented or tested build. The supplied 15-level concept is the baseline.
Numerical physics, weapon, and spawn values below are initial playtest settings.

## Product and scope

| Item | Specification |
| --- | --- |
| Display title | Plaque Trouble |
| Repository | `plaque-attack`; keep its existing name |
| Genre | 2D arcade action with a cardiovascular theme |
| Audience | Casual players and biology learners; no medical knowledge required |
| Platform | Desktop browser first, with responsive menus and touch controls |
| Session | Approximately 15-25 minutes for a successful campaign; short individual rounds |
| Campaign | 15 levels in three acts; five-level first playable milestone |
| Visual direction | Colorful vector art, readable silhouettes, polished browser-arcade presentation |
| Delivery | Static TypeScript application, HTML5 Canvas arena, HTML menus and HUD |
| Persistence | Local settings, unlocks, and five best campaign scores |

The first release includes the whole campaign, tutorial prompts, pause, practice, local scores,
sound controls, and the three weapon modes. Multiplayer, accounts, online leaderboards, a shop,
drug dosing, clinical decision simulation, and a separate mobile app are outside this release.
Bubble Trouble is a mechanics reference. Create original characters, graphics, audio, and layouts;
Miniclip hosting or affiliation is not part of the delivery requirement.

## Player experience

The game should feel immediately understandable and increasingly demanding. The interesting
decision is where to stand and when to fire: a split removes a large obstacle but creates two
faster ones. Later, rapid aspirin shots and persistent clopidogrel shots reward different timing.
Maintenance asks the player to sustain control rather than chase a permanently empty screen.

1. Read a short objective and see the equipped tool.
2. Move left or right and fire upward while reading the bounce patterns.
3. Split plaque or suppress platelet hazards, gaining points and creating breathing room.
4. Clear the arena or satisfy the timed control objective.
5. Review the result, optionally read one medical fact, and continue immediately.

Learning stays in brief captions and optional explanation panels. There are no quizzes, required
reading screens, treatment choices, or memorization gates.

## Medical framing

The game is an arcade metaphor. In clinical care, stents support narrowed arteries; aspirin and
clopidogrel reduce platelet activity and clot formation. Neither weapon's arcade animation should
be presented as the physical removal of cholesterol by those medicines.
[NHLBI: Stents](https://www.nhlbi.nih.gov/health/stents),
[NHLBI: Living with a stent](https://www.nhlbi.nih.gov/health/stents/living-with).

Preserve the requested fragmentation mechanic with these presentation rules:

- Levels 1-5 use yellow plaque tokens. The stent splits these as an explicit arcade abstraction.
- Levels 6-15 use platelet-activation tokens: small purple clusters representing developing
  platelet aggregation. A successful drug hit makes a token inactive and harmless, then it fades.
- Pharmaceutical levels contain no yellow plaque targets. Drug shots do not dissolve plaque or
  portray the dissolution of an established clot.
- The transition changes the challenge, not a patient's prescription. The implanted stent remains
  visible in the background; the game does not imply that medication replaces or removes it.
- The smaller later targets represent a different hazard class, not proof that aspirin has
  reduced plaque size. Atherosclerosis care continues beyond the arcade victory.
- The surgeon is a cartoon avatar. The arena is a schematic artery, with no anatomical scale.

The brief level-one caption reads: "Arcade model: real stents hold arteries open."
The level-six caption reads: "New target: platelet activation. Antiplatelet drugs help prevent
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
| Enter | Activate the focused menu or result button |
| Touch controls | Separate left, right, and fire buttons; simultaneous movement and fire |

Movement starts and stops immediately. There is no jumping, aiming, momentum, or weapon selection
during a round. Each level equips its tool; dual therapy alternates shots automatically. Opposite
movement inputs cancel. Firing never captures Space when a menu button or other control has focus.

Use a 960 by 540 logical arena, separate from the HTML HUD and touch bar. The surgeon's feet sit at
the arena floor. The visual character is approximately 44 by 60 units; its body hitbox is a centered
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

Use predictable gravity-driven arcs with fixed horizontal speed. Walls reverse horizontal
velocity. Floor contact restores a size-specific upward velocity; ceiling contact reflects an
upward velocity downward. Targets pass through one another, so collisions between hazards do not
introduce unpredictable trajectories. Particle effects are decorative and never collide.

Initial values use gravity of 900 logical units per second squared. Bounce rise is measured from
the target's resting center, and upward launch speed derives from the desired rise.

| Size | Radius | Horizontal speed | Bounce rise | Successful stent hit |
| --- | --- | --- | --- | --- |
| Large | 58 | 105 units/s | 310 units | Two medium plaques |
| Medium | 40 | 135 units/s | 230 units | Two small plaques |
| Small | 26 | 170 units/s | 150 units | Two tiny plaques |
| Tiny | 16 | 210 units/s | 90 units | Removed |

Each plaque takes one successful hit at its current size. The original request's repeated hits
apply to the complete fragmentation sequence: one large plaque requires 15 successful hits,
including seven splits and eight final removals. Multi-hit armor is not part of the first release.

On a split, remove the parent exactly once and create two next-size children at its position with
a small opposing horizontal offset. Give the children opposite horizontal directions and their
new size's upward launch speed. Clamp positions inside the arena. They become collision-active
on the next simulation tick and cannot be hit by the projectile that created them.

The hit consumes a stent. If several targets overlap the shot simultaneously, resolve the earliest
contact along its sweep, breaking an exact tie by stable entity ID. This prevents one shot from
clearing a whole family in one frame. A small compression, mesh expansion, and particle burst mark
the hit without delaying the simulation.

Platelet hazards use the small and tiny movement presets but have a separate target identity.
They become inactive on one eligible drug hit and never split. Inactive particles immediately leave
the objective count and collision system, even while their fade animation finishes.

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

### Act I: Coronary intervention

All levels equip the stent and end when no plaque remains. The HUD shows elapsed time, not a
countdown; there is no time-limit failure. Starting positions are authored, spaced across the
upper arena, and visible during the ready countdown. Speed multipliers affect horizontal motion.

| Level | Name | Starting plaques | Speed multiplier | New pressure |
| --- | --- | --- | --- | --- |
| 1 | First blockage | One large | 0.85 | Movement, upward shots, the splitting chain |
| 2 | Cholesterol buildup | Two large | 0.90 | Tracking opposing arcs |
| 3 | Narrowing artery | One large, two medium | 1.00 | Mixed target sizes |
| 4 | Multiple lesions | Three large | 1.00 | Managing several split families |
| 5 | Critical stenosis | Four large | 1.05 | Sustained crowd control |

Level 3 uses wall artwork to suggest narrowing without changing collision boundaries. The first
five levels keep the same arena geometry. One large plaque can produce at most eight simultaneous
tiny descendants; level 5 therefore needs support for 32 live targets.

Level-one prompts teach one action at a time: "Move with A/D or the arrow keys", "Hold Space to
fire", and "Smaller fragments move faster". Dismiss a prompt as soon as the player performs its
action. Later attempts do not repeat completed prompts unless tutorials are reset in settings.

### Act II: Pharmaceutical treatment

The artery background now includes an installed stent. Introduce the platelet target visually
before play. Small and tiny platelet hazards are the only enemies in this act.

| Level | Name | Tool | Initial hazards | Reinforcements | Objective |
| --- | --- | --- | --- | --- | --- |
| 6 | Aspirin therapy | Aspirin | Four small | None | Inactivate all four |
| 7 | Platelet activation | Aspirin | Four small | Eight tiny, one every 3 s | Clear all 12 |
| 8 | Clopidogrel | Clopidogrel | Six small | Six tiny, one every 4 s | Clear all 12 |
| 9 | Dual therapy | Alternating | Six small | Twelve tiny, one every 2.5 s | Clear all 18 |
| 10 | Stabilization | Alternating | Four tiny | One tiny every 3 s | Hold at most eight for 45 s |

Levels 6-9 use horizontal speed multiplier 0.90, increasing to 1.00 in level 10. Finite-wave levels
show "Hazards remaining", which includes scheduled but unspawned hazards. An empty arena between
waves is not a win. A cleared wave need not wait for its original schedule: when no active hazards
remain, bring the next scheduled entry forward after its spawn warning.

Level 10 introduces the same count and overload rules used in Act III, with a forgiving threshold.

### Act III: Long-term maintenance

All levels equip dual mode. Start with tiny platelet hazards and continue introducing tiny hazards
on a fixed schedule. The timer, target count, and overload countdown are the main HUD elements.

| Level | Name | Initial hazards | Safe maximum | Duration | Spawn interval |
| --- | --- | --- | --- | --- | --- |
| 11 | Recovery | Three | Eight | 60 s | 3.0 s |
| 12 | Cardiac rehabilitation | Three | Seven | 75 s | 2.7 s |
| 13 | Long-term prevention | Three | Six | 90 s | 2.4 s |
| 14 | High-risk patient | Three | Five | 90 s | 2.1 s |
| 15 | Healthy circulation | Two | Four | 120 s | 1.8 s |

These are challenge labels and tuning values, not a clinical risk classification. The finale earns
"Maintenance complete", not a claim that coronary disease has been cured.

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

Campaigns finish at level 15. Main-menu level select offers any unlocked level in practice mode.
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

A piercing shot awards each target once. Target IDs and resolved events prevent duplicate rewards.
Level completion awards its bonuses once even if the Continue button is pressed repeatedly.
For reference, one large plaque is 3,200 base target points before multipliers and level bonuses.

The local top-five list stores campaign score, level reached, completed/ended status, and date.
Rank by score, then level reached, then earlier record for an exact tie. Commit one record when a
campaign ends through defeat or completion. Practice and abandoned runs do not enter the list.
Use automatic labels rather than requiring names or accounts.

Settings and unlocked levels persist between visits. An active campaign stays in memory while
paused; a reload returns to the menu. In-progress campaign resumption is outside the first release.
If local storage is unavailable or malformed, play remains available and a quiet settings message
explains that progress cannot be saved. Keep existing unsupported save data intact.

## Screens and interface

| Screen | Main content | Primary actions |
| --- | --- | --- |
| Main menu | Title, artery illustration, short premise, best score if present | Play campaign, Practice, How to play, High scores, Settings |
| Level briefing | Level name, objective, equipped tool, one target example | Start |
| Gameplay | Arena, level, score, lives, elapsed/remaining time | Movement, fire, pause |
| Pause | Frozen arena, objective and controls | Resume, restart practice when applicable, main menu |
| Level result | Objective achieved, points earned, lives left, optional fact | Continue, read the real medicine |
| Game over | Run ended, score, level reached, record placement if earned | Retry campaign, practice level, main menu |
| Campaign result | Maintenance complete, score, final lives, record | Play again, main menu |

Gameplay HUD priority is lives and objective, then tool, then score. Intervention levels show
"Elapsed 01:25"; maintenance shows "Remaining 01:25" and `Active hazards: 4 / 6`. Finite waves show
their remaining total. The overload countdown stays visible adjacent to the count.

Use "Plaque cleared!" after Act I rounds, "Platelet activity controlled!" after Act II clear
rounds, and "Maintenance complete!" after timed rounds. Avoid "artery cured" and medical-emergency
language as a judgment of player performance.

Pause, settings, instructions, and results use real HTML buttons and headings. Focus enters a
modal when opened and returns to its triggering control when closed. Escape closes help or
settings before affecting the underlying pause state. Returning to the menu from an active
campaign confirms that the current run will end; ordinary retries and setting changes are direct.

## Vector art specification

Apply the SVG creator workflow to original editable sources under proposed `src/assets/` paths.
Every asset has a stable `viewBox`, semantic groups, descriptive unique IDs, and self-contained
colors and geometry. Avoid external fonts, embedded scripts, and externally fetched image content.

| Asset family | Proposed source | Construction and states |
| --- | --- | --- |
| Surgeon | `src/assets/surgeon.svg` | 96 by 128 viewBox; cap, mask, torso, hands, legs, and tool in named groups |
| Plaque | `src/assets/plaque.svg` | 128 by 128 viewBox; irregular yellow contour, orange center, restrained highlights |
| Platelet hazard | `src/assets/platelet.svg` | 64 by 64 viewBox; cluster of violet disks with a scalloped outline |
| Stent | `src/assets/stent.svg` | 32 by 128 viewBox; cylindrical silver mesh with clear diagonal struts |
| Drug icons | `src/assets/aspirin.svg`, `src/assets/clopidogrel.svg` | 32 by 32 viewBoxes; distinct round and oblong tablet silhouettes |
| Artery | `src/assets/artery.svg` | 960 by 540 viewBox; dark lumen, pink wall bands, sparse wall deposits |

The surgeon's silhouette is readable at actual play size: oversized cap and mask, teal scrubs,
short legs, gloved hands, and an upward-facing tool. Create idle, run, fire, hit, and victory poses
from the same proportions. Idle breathing is subtle; the run cycle is short; firing emphasizes the
tool. Skin tone is a visual choice, not a gameplay attribute.

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

The repository currently has no game stylesheet or `src/` application. Proposed `src/style.css`
owns the HTML shell; Canvas owns the arena drawing. Share a small documented palette, and keep
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

Selected facts are available on result cards and dismissible immediately:

- Level 1: "Atherosclerosis involves plaque buildup in artery walls."
- Level 3: "A coronary stent helps hold a narrowed artery open."
- Level 6: "Aspirin reduces platelet activity and helps prevent blood clots."
- Level 8: "Clopidogrel blocks the platelet P2Y12 receptor, reducing platelet activation."
- Level 11: "Long-term cardiovascular care can combine medicines with lifestyle changes."

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

| Contract area | Canonical proposed home | Responsibility |
| --- | --- | --- |
| Player and input | `src/types/player.ts` | Logical action state, player body and lives |
| Simulation | `src/types/simulation.ts` | Entity identity, plaque/platelet variants, shots, tick outcomes |
| Level rules | `src/types/level.ts` | Clear versus maintenance objectives and validated config references |
| Events | `src/types/events.ts` | Composition of feature-owned hit, damage, and completion events |
| Save boundary | `src/types/save.ts` | Versioned settings, unlocks, top-five record shape |

These are proposed ownership boundaries, not type files already present. Before parallel coding,
write concrete importable contracts for shared shapes. Co-locate private helper types with their
implementations; avoid a universal object type with optional fields for every entity.

Use discriminated unions for target kind, projectile kind, game screen, and objective kind. A
maintenance objective requires duration and safe maximum; a clear objective requires a finite
target/wave definition. Derive identifiers from configuration tables and check references where
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

1. Read actions, move the player, and emit an eligible shot.
2. Advance targets and projectiles, including their swept collision paths.
3. Resolve projectile hits once per target and apply splits or inactivation.
4. Resolve contact damage against surviving active targets.
5. Update counts, overload timers, duration, and scheduled arrivals.
6. Resolve terminal states and emit score/UI events once.

Use circle-to-rectangle collision for the player and target, and swept projectile-region tests
to avoid tunneling. New split children wait until the following tick for collisions. Contact
damage therefore cannot come from a just-spawned child before the player can see it.

Zero lives takes precedence over a simultaneous clear or timer expiry. A target removed by a
projectile during the tick cannot also damage the player. Pause freezes cooldowns, movement,
spawning, invulnerability, overload, and survival scoring together.

### Persistence and delivery

Use one versioned local-storage key, `plaque_trouble_save`, with explicit validation and bounded
record counts. Use text rendering for stored/displayed values. Store no patient information,
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

## Implementation milestones

The html-game-parallel-builder workflow applies when implementation begins. This specification
does not dispatch coding work. Before dispatch, use delegate-manager-to-subagents and parallel-plan
to assign exclusive ownership, and typescript-engineer to establish the actual shared contracts.
Use svg-creator-expert for asset construction and rendered inspection, and css-creative-expert for
the shell layout and visual acceptance. Adapt the skill's generic stage examples to this game.

1. Contracts and foundation: establish real types, configuration, state transitions, a bootable
   shell, and a clean compiler baseline before dependent agents start.
2. Presentation and utilities: author SVGs, HTML/CSS, input, timing, and persistence in independent
   assignments with an explicit owner for every file.
3. First playable: complete Act I, including all five levels, stent splitting, lives, score,
   pause, tutorial, sound effects, results, and retry. Tune the bounce/fire loop before expanding.
4. Full campaign: add platelet targets, aspirin, clopidogrel, alternating fire, finite waves,
   maintenance, educational transitions, practice, and the top-five records.
5. Acceptance: play through all 15 levels, review rendered states, verify failure/recovery paths,
   and validate the production artifact under a project subpath.

Each coding agent reports `npx tsc --noEmit -p tsconfig.json` with its actual result. At each batch
boundary, the manager runs the repository's `./check_codebase.sh`, builds, and runs the required
Playwright smoke for that batch. A failing gate stops progression until its owner repairs it.
Do not replace the browser smoke with a compiler result or call a five-level milestone complete
for the full campaign. Use fresh agents for independent implementation and review assignments.

## Acceptance and playtesting

Permanent tests protect stable behavior rather than freezing tunable speeds or spawn intervals.
Keep tuning experiments temporary and use human playtests for fun, fairness, and readability.

| Area | Acceptance evidence |
| --- | --- |
| Fragmentation | One large plaque produces two children per split, eight final tiny removals, and 15 total successful hits |
| Collision | Shots cannot tunnel or hit children immediately; removed targets cannot also inflict contact damage |
| Tools | Stent limits one active shot; aspirin hits once; clopidogrel hits distinct targets up to its limit; dual alternates on successful fires |
| Target identity | Drugs never score against plaque; platelet hazards never split into cholesterol |
| Lives | One damage event per tick, correct contact invulnerability, overload independent, zero lives ends the run |
| Finite waves | Empty intervals do not complete a level with scheduled hazards remaining |
| Maintenance | Equality is safe; continuous overload costs a life; recovery resets the warning; expiry resolves as specified |
| Pause | All simulation clocks stop; no stuck inputs or queued arrivals after focus loss and resume |
| Scoring | No duplicate hits, completion bonuses, survival seconds, or run records; practice stays unranked |
| Progress | All 15 levels are reachable and completable through normal rules; unlock and retry behavior is consistent |
| Storage | Valid records reload; invalid or unavailable storage leaves the game playable |
| Visuals | Distinct silhouettes, measured contrast, readable HUD, no cropped arena or hidden controls at required sizes |
| Accessibility | Keyboard menus, visible focus, touch parity, muted start, reduced motion, text warnings alongside sound/color |
| Build | Compiler and repository checks pass; built Pages artifact loads under a subpath with no application errors or missing assets |

Browser verification includes start, movement plus fire, splitting, damage, pause/resume, clear,
drug transitions, overload/recovery, game over/retry, and leaderboard persistence. Use controlled
fixtures for hard-to-reach failure states and a real campaign playthrough for completion evidence.
Do not claim fully nonvisual action-game accessibility from accessible menus alone.

Playtest the first five levels before locking later numbers. Observe whether new players discover
movement and firing quickly, understand why splitting increases danger, can track tiny fragments,
and can recover from overload without reading a paragraph. Compare aspirin and clopidogrel in
their introduction levels to ensure their timing feels distinct. Tune one variable at a time and
record the observed problem and resulting adjustment.

## Resolved draft details

The following choices make the supplied concept executable while keeping its central mechanics:

- Keep the supplied 15-level campaign and five-level first playable scope.
- Resolve repeated hits as the fragmentation chain, with one hit per individual plaque.
- Consume the stent on its first hit so one mesh trail cannot clear an entire descendant tree.
- Use finite reinforcements in levels 7-9 and explicit maintenance rules from level 10 onward.
- Use platelet-activation tokens for medication stages and label their inactivation as prevention.
- Treat maintenance limits as inclusive; define overload recovery and timer-expiry behavior.
- Carry three lives through the campaign and offer unranked practice for unlocked levels.
- Keep elapsed time in clear levels, countdown time in maintenance, and no optional blood-flow
  meter that could be mistaken for a simulated clinical quantity.

All balance values remain subject to playtesting. The content and rules above are the proposed
source of truth for implementation; art, runtime validation, performance, and medical-copy review
must still be completed on the actual game.
