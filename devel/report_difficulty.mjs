#!/usr/bin/env node
// Run: node devel/report_difficulty.mjs [output-directory]
// Default output: output/difficulty/report.json and report.md. No browser/build needed.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

function number(value) {
  return value === undefined ? "-" : value.toFixed(3);
}

function markdown(report) {
  const lines = [
    "# Campaign difficulty report",
    "",
    "Generated from canonical configs. Regenerate: `node devel/report_difficulty.mjs`.",
    "",
    "W expands the complete plaque removal tree; L counts final descendants. Q is hit-weighted target diameters/second. V is tiny vertical player-zone overlap over one complete real fluid-motion cycle. A is arena width divided by target diameter plus projectile width (alternating mean for dual). R is nominal arrivals/second; H is arrivals per overload window divided by safe capacity. Maintenance W/L are initial only, Q/A recurring-entry means. JSON includes per-size flat-only analytic fluid estimates and floor-aware sampled cycles, raw entry patterns, per-axis block ratios, weapon ceilings, nominal exposure, and separately labelled scheduler samples.",
    "",
    ...report.method.limits.map((limit) => `- ${limit}`),
    "",
    `Fixed step: ${report.method.fixedStep} s. Arena: ${report.method.arenaWidth} x ${report.method.arenaHeight}. Fluid angular speed: ${report.method.fluidAngularSpeed} rad/s before stage multiplier. Hitbox height: ${report.method.playerHitboxHeight}. Capacity: ${report.method.maxTargets}. Overload: ${report.method.overloadDuration} s. Current target and weapon constants are included in JSON.`,
    "",
    "| Stage / ID | Chapter / scene | Name | Tool / objective / block | W | L | Q | V | A | R | H | Exposure | Transition / review |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
  ];
  for (const stage of report.stages) {
    const a = stage.axes;
    const exposure =
      stage.exposure === undefined
        ? "finite clear"
        : `${stage.exposure.duration}s; ${stage.exposure.nominalOpportunities} nominal opportunities`;
    lines.push(
      `| ${stage.ordinal} / ${stage.id} | ${stage.chapter} / ${stage.scene} | ${stage.name} | ${stage.tool} / ${stage.objective} / ${stage.comparableBlock} | ${number(a.workload)} | ${number(a.leafCeiling)} | ${number(a.movement)} | ${number(a.verticalExposure)} | ${number(a.precision)} | ${number(a.arrivals)} | ${number(a.sustainedPressure)} | ${exposure} | ${stage.transition}; ${stage.reviewFlags.join("; ") || "no aggregate flag"} |`,
    );
  }
  lines.push(
    "",
    "## Arena and optional encounter measurements",
    "",
    "F is floor relief in pixels; S is maximum absolute smoothstep slope. C counts occupied tissue cells; carve bounds describe productive shots to remove ALL cover, not required completion work. Lanes are raw geometric x gaps before weapon-width/player-bound trimming. Pocket W/L are optional extra removal work/leaves. Merge is the finite extra-hit budget bound; clear bounds share that budget, rather than adding it twice. Plaque capacity includes all finite and optional plaque leaves; maintenance recurring plaque has no finite authored total.",
    "",
    "| Stage / ID | F | S | C | Full carve shots | Open lane widths | Optional pocket W / L | Merge extra hits | Mandatory / all-open hit bound | Maximum plaque leaves | All finite leaves |",
    "| --- | ---: | ---: | ---: | --- | --- | --- | ---: | --- | ---: | ---: |",
  );
  for (const stage of report.stages) {
    const m = stage.mechanics;
    const a = m.arena;
    lines.push(
      `| ${stage.ordinal} / ${stage.id} | ${number(a.floorRelief)} | ${number(a.maximumFloorSlope)} | ${a.tissueOccupiedCells} | ${a.fullTissueRemovalShotBounds.min}..${a.fullTissueRemovalShotBounds.max} | ${a.openFiringLaneWidths.map(number).join(", ")} | ${m.optionalPocketTargets.workload} / ${m.optionalPocketTargets.leafCeiling} | ${m.mergeExtraHitBound} | ${number(m.mandatoryRemovalHitBound)} / ${number(m.allPocketsOpenedRemovalHitBound)} | ${number(m.maximumPlaqueLeafCapacity)} | ${number(m.allAuthoredLeafCapacity)} |`,
    );
  }
  lines.push("", "## Authored teaching reasons and normalized vectors", "");
  for (const stage of report.stages) {
    const ratios = Object.entries(stage.ratios)
      .map(([key, value]) => `${key}=${number(value)}`)
      .join(", ");
    lines.push(
      `- Stage ${stage.ordinal} (ID ${stage.id}): ${stage.authoredTeachingReason} Ratios to block introduction: ${ratios}.`,
    );
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const destination = path.resolve(process.argv[2] ?? path.join(root, "output/difficulty"));
  const temporary = await mkdtemp(path.join(tmpdir(), "plaque-difficulty-"));
  try {
    const bundle = path.join(temporary, "difficulty.mjs");
    await build({
      entryPoints: [path.join(root, "src/difficulty.ts")],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: bundle,
    });
    const { difficultyReport } = await import(pathToFileURL(bundle).href);
    const report = difficultyReport();
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(path.join(destination, "report.md"), markdown(report));
    console.log(`Wrote ${report.stages.length} stages to ${destination}/report.{json,md}`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

await main();
