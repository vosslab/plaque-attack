# Human guidance

<!-- VENDORED HEADER: START -->
Record the durable guidance Neil Voss states, or approves for preservation here, in his own words:
first person or close paraphrase, one to three lines per bullet. Material he supplies as a source
may inform [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) once it is settled, and an entry of uncertain
origin belongs there too. Rules: [REPO_STYLE.md](REPO_STYLE.md).
[PROPAGATED HEADER - ENTRIES BELOW ARE YOURS]
<!-- VENDORED HEADER: END -->

- Make durable changes in starter-repo-template; consumer copies are vendored.
- A temporary, easily removable wrapper is acceptable for the Graphify crash.
  Make the edited node count match the expected normalized count.
- Turn the Bubble Trouble-style cardiovascular game concept into a full specification.
  Use a surgeon, a stent weapon, progressively smaller plaque fragments, antiplatelet tools,
  and advanced levels focused on maintaining a manageable hazard count.
- Use the TypeScript engineer, SVG creator expert, CSS creative expert, and
  HTML game parallel builder skills for this work.
- After the game work, refresh the README and prepare the GitHub setup.
- Update all screenshots to WebP and keep the README's surgeon screenshot current with the
  delivered character designs; the old roster image made the redesign look unchanged.
- The GitHub Pages game is live at https://vosslab.github.io/plaque-attack/. Link it in the README
  and write for gamers and biology enthusiasts.
- The root `test-results` directory is not ignored; account for that in the project setup.
- Use the UI/UX engineer review skill for runtime flows and the final interface audit.
- Expand the game with more levels and an ordered challenge curve; keep the game fun, since
  learning does not need to be boring.
- The first three levels are pretty easy; low, fast, small balls are hard. Put fun first.
- Give the expansion more organic medical-inspired scenes and a broader variety of lipid art, with
  editable SVGs. Use Barnsy Ink as artistic inspiration.
- Imagine the inside of the body as a fluid, gravityless space for lipids and bubbles; gravity matters
  less than bouncing-ball motion. Keep the first three levels easy and prioritize fun.
- Add Space Invaders-style tissue shelters that erode when hazards hit them. The surgeon cannot
  shoot through tissue: a shot removes a visible piece, so carving a lane trades cover for firing.
- Make the cellular floor wavy or sloped, with the surgeon moving up and down automatically while
  moving left and right. Do not add jumping or a jump control.
- Let colliding lipid balls sometimes merge: tiny into small, small into medium, medium into large.
  Make merging possible across lipid levels, with probabilities changing by level; keep the opening easy.
- "The messages small > 2 tiny are stupid and superfluous." Keep split-size callouts off the play
  field; "merge on break SHOULD NEVER HAPPEN." Let a merge roll only when floating lipids collide.
- Finish every milestone through the manager and subagents. Remove visible and hidden human
  approval or playtesting dependencies; optional feedback must not hold up completion.
- Give players a diverse choice of six surgeon characters. Start them with identical gameplay
  abilities so character preference never changes the game's difficulty.
- Make campaign victories visibly heal the patient in a distinct cardiovascular recovery view.
  Borrow the satisfaction of a body-progress map without copying Bad Cell Day's artwork or rubric.
- When I ask for work, do it. Queued requests are intended as work to complete, not options that
  wait for me to notice or choose them.
- Make the play view 16:10 and keep popups compact enough to fit the viewport.
- Review all my previous comments and make sure they are implemented. Make the plan ambitious,
  practical and complete, with no human dependencies.
- Let me go to the next level with Enter or Space. Keep the final lipid pop visible, then give the
  surgeon a short celebration before results. Keep movement automatic over the floor without jumping.
- Explore non-flat floors more deeply and assess whether they add enough to the game.
- Survey other games in `~/nsh/TYPESCRIPT` for more fun game ideas. The more fun the game,
  the happier I will be!
- The game should be called Plaque Attack because it rhymes. Keep that name in the game and
  its current documentation.
- Give the six surgeons distinct personalities through varied height, body, face, hair, posture
  and accessories, so choosing among characters with the same abilities feels meaningful.
- Preserve the current chunky arcade visual style, which I call pixel art. Show the actual
  44x60 grayscale and silhouette lineup, and add a few individual idle motions and reactions.

- Use the game-design-expert and SVG-creator-expert skills together for the surgeon redesign.
- Ask the player to pick a surgeon first thing, before starting level 1.
- Prioritize Luna subagents, use Sol 6.1 for hard coding tasks, and use Astra for SVG artwork.
- Keep working independently while I am away; finish the requested work and verification.
- Git commands and staging are out of scope, except for `git mv`.
- Make rubrics and have agents test the game.
- Make the stent more organic; the existing design looks more like a trellis than a stent.
- "one frustration I have is that one can play 6 levels, give up, and never see the new weapons."
- Zoom in on the surgeon after level completion so their celebration actions are easier to see.
- Keep HUMAN_GUIDANCE for durable guidance, not one-off requests or individual bug fixes.
- I like the charm of the surgeons, but their shapes could be more polished, especially the
  awkwardly tapered arms. Normal bilateral symmetry can be broken when it adds character; repeated
  plus pockets are optional, shooters can vary, and larger heads can use an NBA Jam style.
