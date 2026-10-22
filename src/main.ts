import { loadAssets } from "./assets";
import { createAudio } from "./audio";
import { campaignPosition, getLevel, isLevelUnlocked, LEVEL_IDS, nextLevelId } from "./constants";
import {
  createDialogs,
  firstSurgeonChooser,
  medicine,
  paragraph,
  scoresPanel,
  settingsPanel,
  surgeonChooser,
} from "./dialogs";
import { advanceLevel, createSimulation, pauseSimulation, resumeSimulation } from "./game_state";
import { createInputController } from "./input";
import { createRecoveryMap } from "./recovery";
import { createRenderer } from "./renderer";
import { addRecord, loadSave, markLevelCompleted, saveSave, storageMessage } from "./save_load";
import { stepSimulation } from "./simulation";
import { createFixedLoop } from "./timer";
import {
  action,
  button,
  CHAPTER_NAMES,
  element,
  showBriefing,
  showResult,
  showScreen,
  updateHud,
} from "./ui";
import type { LevelId } from "./types/level";
import type {
  ArenaRenderer,
  AppScreen,
  AssetLoadState,
  CelebrationPresentation,
  RuntimeState,
} from "./types/runtime";
import type { TutorialPrompt } from "./types/save";
import type { RunMode } from "./types/simulation";

function main(): void {
  const loaded = loadSave();
  const runtime: RuntimeState = {
    screen: { kind: "menu" },
    dialog: undefined,
    simulation: undefined,
    save: loaded.save,
    storageStatus: loaded.status,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
  const canvas = element("arena");
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Game canvas is missing");
  const arena: HTMLCanvasElement = canvas;
  let assets: AssetLoadState = { kind: "loading" };
  let renderer: ArenaRenderer | undefined;
  let campaignStarted = false;
  let recordRank: number | undefined;
  let newlyRestoredLevelId: LevelId | undefined;
  let celebration: CelebrationPresentation | undefined;
  let celebrationRendered = false;
  const heldAdvanceKeys = new Set<string>();
  let pendingAdvance: { code: string; screen: AppScreen; primary: HTMLButtonElement } | undefined;
  const bestScore = document.createElement("p");
  bestScore.className = "control_hint";
  bestScore.id = "menu_best_score";
  button("play_campaign").insertAdjacentElement("beforebegin", bestScore);
  function updateBestScore(): void {
    const best = runtime.save.records[0];
    bestScore.hidden = best === undefined;
    bestScore.textContent = best === undefined ? "" : `Best score: ${best.score.toLocaleString()}`;
  }
  updateBestScore();
  const audio = createAudio();
  audio.setSettings(runtime.save.settings);
  const persist = (): void => {
    runtime.storageStatus = saveSave(runtime.save, runtime.storageStatus);
  };
  const dialogs = createDialogs((open): void => {
    pendingAdvance = undefined;
    if (!open) runtime.dialog = undefined;
  });
  const isActive = (): boolean => runtime.screen.kind === "gameplay" && !dialogs.isOpen();
  const input = createInputController(
    arena,
    togglePause,
    { left: button("touch_left"), right: button("touch_right"), fire: button("touch_fire") },
    isActive,
  );
  function screen(next: AppScreen, focus?: HTMLElement): void {
    input.clear();
    pendingAdvance = undefined;
    runtime.screen = next;
    showScreen(next);
    element("celebration_status").hidden =
      celebration === undefined || (next.kind !== "celebration" && next.kind !== "pause");
    audio.setPaused(
      next.kind !== "gameplay",
      next.kind === "celebration" ||
        next.kind === "level_result" ||
        next.kind === "game_over" ||
        next.kind === "campaign_result",
    );
    focus?.focus({ preventScroll: true });
  }
  function menu(): void {
    runtime.simulation = undefined;
    celebration = undefined;
    campaignStarted = false;
    element("overlay").hidden = true;
    updateBestScore();
    screen({ kind: "menu" }, button("play_campaign"));
  }
  function leaveCampaign(destination: () => void): void {
    if (!campaignStarted || runtime.simulation?.mode !== "campaign") {
      destination();
      return;
    }
    runtime.dialog = "confirm_quit";
    let confirmed = false;
    dialogs.open(
      "Leave this campaign?",
      (body, close, footer): void => {
        paragraph(
          body,
          "Your current run will end without a high-score record. Unlocked levels and settings stay saved on this device.",
        );
        footer.append(
          action("Keep playing", close, true),
          action("Leave campaign", (): void => {
            confirmed = true;
            close();
          }),
        );
      },
      (): void => {
        if (confirmed) {
          campaignStarted = false;
          destination();
        } else if (runtime.simulation?.phase === "paused" || celebration !== undefined) resume();
      },
    );
  }
  function quit(): void {
    leaveCampaign(menu);
  }
  function briefing(level: LevelId, mode: RunMode): void {
    recordRank = undefined;
    celebration = undefined;
    runtime.simulation = createSimulation(getLevel(level), mode);
    screen({ kind: "briefing", levelId: level });
    showBriefing(getLevel(level), mode === "practice");
  }
  function begin(): void {
    if (assets.kind !== "ready" || runtime.screen.kind !== "briefing") return;
    if (runtime.simulation?.mode === "campaign") campaignStarted = true;
    screen({ kind: "gameplay" }, arena);
    if (renderer === undefined)
      renderer = createRenderer(arena, assets.images, runtime.reducedMotion);
    renderer.resize();
    audio.unlock();
  }
  function resume(): void {
    const state = runtime.simulation;
    if (state === undefined) return;
    if (celebration !== undefined) {
      screen({ kind: "celebration" }, arena);
      return;
    }
    if (!resumeSimulation(state)) return;
    screen({ kind: "gameplay" }, arena);
    audio.unlock();
  }
  function togglePause(): void {
    if (runtime.screen.kind === "pause") {
      dialogs.close();
      return;
    }
    const state = runtime.simulation;
    const celebrating = runtime.screen.kind === "celebration" && !dialogs.isOpen();
    if (state === undefined || (!isActive() && !celebrating)) return;
    if (!celebrating && !pauseSimulation(state)) return;
    screen({ kind: "pause" });
    dialogs.open(
      "Take a breather",
      (body, close, footer): void => {
        paragraph(
          body,
          "Game paused. Press P or Escape to resume. Move with A/D or arrows; hold Space to fire.",
        );
        footer.append(action("Resume game", close, true));
        if (state.mode === "practice")
          footer.append(
            action("Restart practice", (): void => {
              runtime.screen = { kind: "gameplay" };
              close();
              briefing(state.level.id, "practice");
              begin();
            }),
          );
        settingsPanel(
          body,
          runtime.save.settings,
          settingsChanged,
          storageMessage(runtime.storageStatus),
        );
        footer.append(
          action("Main menu", (): void => {
            // Dismiss the pause first; its close handler leaves the simulation frozen.
            runtime.screen = { kind: celebration === undefined ? "gameplay" : "celebration" };
            close();
            window.setTimeout(quit, 0);
          }),
        );
      },
      (): void => {
        if (runtime.screen.kind === "pause") resume();
      },
    );
  }
  function settingsChanged(): void {
    persist();
    audio.setSettings(runtime.save.settings);
    audio.unlock();
  }
  function openMedicine(): void {
    runtime.dialog = "medicine";
    dialogs.open("The real medicine", (body, close, footer): void => {
      medicine(body);
      footer.append(action("Close", close, true));
    });
  }
  function openSurgeonChooser(): void {
    runtime.dialog = "surgeon";
    dialogs.open("Choose your surgeon", (body, close, footer): void => {
      surgeonChooser(
        body,
        runtime.save.settings.surgeonId,
        (surgeonId): void => {
          runtime.save.settings.surgeonId = surgeonId;
          runtime.save.settings.surgeonChosen = true;
          settingsChanged();
        },
        close,
        footer,
      );
    });
  }
  function chooseFirstSurgeon(): void {
    runtime.dialog = "surgeon";
    dialogs.open("Choose your surgeon", (body, close, footer): void => {
      firstSurgeonChooser(
        body,
        (surgeonId): void => {
          runtime.save.settings.surgeonId = surgeonId;
          runtime.save.settings.surgeonChosen = true;
          settingsChanged();
        },
        (): void => {
          if (!runtime.save.settings.surgeonChosen) return;
          close();
        },
        footer,
      );
    });
  }
  function openRecovery(selectedLevelId?: LevelId, includeNewlyRestored = false): void {
    dialogs.open("Patient recovery", (body, close, footer): void => {
      body.append(
        createRecoveryMap({
          completedLevelIds: runtime.save.completedLevelIds,
          unlockedLevel: runtime.save.unlockedLevel,
          selectedLevelId,
          newlyCompletedLevelId: includeNewlyRestored ? newlyRestoredLevelId : undefined,
          onStageSelected: (levelId): void => {
            if (!isLevelUnlocked(levelId, runtime.save.unlockedLevel)) return;
            close();
            leaveCampaign((): void => {
              campaignStarted = false;
              briefing(levelId, "practice");
            });
          },
        }),
      );
      paragraph(
        body,
        "Select an available route to practice it. Practice is unranked and does not change recovery.",
      );
      footer.append(action("Close", close, true));
    });
  }
  function completeTutorial(prompt: TutorialPrompt): void {
    const completed = runtime.save.settings.completedTutorials;
    if (completed.includes(prompt)) return;
    completed.push(prompt);
    persist();
  }
  const tutorial = document.createElement("p");
  tutorial.className = "control_hint";
  tutorial.setAttribute("role", "status");
  element("gameplay").append(tutorial);
  const prompts: Record<TutorialPrompt, string> = {
    move: "Move with A/D or the arrow keys",
    fire: "Hold Space to fire",
    split: "Smaller fragments move faster",
  };
  function finish(): void {
    const state = runtime.simulation;
    if (
      state === undefined ||
      (runtime.screen.kind !== "gameplay" && runtime.screen.kind !== "celebration")
    )
      return;
    input.clear();
    newlyRestoredLevelId = undefined;
    if (state.mode === "campaign") {
      const campaignCompleted = state.phase === "campaign_complete";
      const clearedStage = state.phase === "level_complete" || campaignCompleted;
      if (clearedStage) {
        const wasRestored = runtime.save.completedLevelIds.includes(state.level.id);
        runtime.save = markLevelCompleted(runtime.save, state.level.id);
        newlyRestoredLevelId = wasRestored ? undefined : state.level.id;
        if (state.phase === "level_complete") {
          const next = nextLevelId(state.level.id);
          if (next !== undefined && !isLevelUnlocked(next, runtime.save.unlockedLevel)) {
            runtime.save.unlockedLevel = next;
          }
        }
        persist();
      }
      if ((state.phase === "game_over" || campaignCompleted) && !state.recordCommitted) {
        const date = new Date().toISOString();
        runtime.save = addRecord(runtime.save, {
          campaign: "expanded",
          score: state.score,
          levelReached: state.level.id,
          outcome: campaignCompleted ? "completed" : "ended",
          date,
        });
        const rank = runtime.save.records.findIndex(
          (record) =>
            record.campaign === "expanded" &&
            record.date === date &&
            record.score === state.score &&
            record.levelReached === state.level.id &&
            record.outcome === (campaignCompleted ? "completed" : "ended"),
        );
        recordRank = rank < 0 ? undefined : rank + 1;
        state.recordCommitted = true;
        persist();
        campaignStarted = false;
      }
    }
    screen({
      kind:
        state.phase === "game_over"
          ? "game_over"
          : state.phase === "campaign_complete"
            ? "campaign_result"
            : "level_result",
    });
    showResult(state, recordRank);
    element("result_recovery_note").hidden = newlyRestoredLevelId === undefined;
    celebration = undefined;
  }
  const loop = createFixedLoop(
    (dt): void => {
      const state = runtime.simulation;
      if (state === undefined || dialogs.isOpen()) return;
      if (runtime.screen.kind === "celebration" && celebration !== undefined) {
        if (celebrationRendered)
          celebration.elapsed = Math.min(celebration.duration, celebration.elapsed + dt);
        return;
      }
      if (!isActive()) return;
      const controls = input.read();
      const beforeX = state.player.position.x;
      const events = stepSimulation(state, controls, dt);
      renderer?.consumeEvents(events);
      audio.consumeEvents(events);
      if (state.level.id === 1) {
        if (state.player.position.x !== beforeX) completeTutorial("move");
        if (events.some((event) => event.type === "shot")) completeTutorial("fire");
        if (events.some((event) => event.type === "target_hit" && event.split))
          completeTutorial("split");
      }
      if (state.phase === "game_over") {
        renderer?.render(state, 0, runtime.save.settings.surgeonId);
        finish();
      } else if (state.phase === "level_complete" || state.phase === "campaign_complete") {
        celebration = { elapsed: 0, duration: 2.2 };
        celebrationRendered = false;
        screen({ kind: "celebration" }, arena);
      }
    },
    (alpha): void => {
      const state = runtime.simulation;
      if (
        state === undefined ||
        (runtime.screen.kind !== "gameplay" &&
          runtime.screen.kind !== "celebration" &&
          runtime.screen.kind !== "pause")
      )
        return;
      renderer?.render(state, alpha, runtime.save.settings.surgeonId, celebration);
      if (celebration !== undefined) {
        celebrationRendered = true;
        if (runtime.screen.kind === "celebration" && celebration.elapsed >= celebration.duration) {
          finish();
          return;
        }
      }
      updateHud(state);
      const prompt = (["move", "fire", "split"] as const).find(
        (item) => !runtime.save.settings.completedTutorials.includes(item),
      );
      tutorial.textContent =
        state.level.id === 1 && state.phase === "playing" && prompt !== undefined
          ? prompts[prompt]
          : "";
    },
  );
  button("play_campaign").addEventListener("click", (): void => {
    if (runtime.save.settings.surgeonChosen) briefing(1, "campaign");
    else chooseFirstSurgeon();
  });
  button("start_level").addEventListener("click", begin);
  button("back_menu").addEventListener("click", quit);
  button("briefing_surgeon").addEventListener("click", openSurgeonChooser);
  button("result_surgeon").addEventListener("click", openSurgeonChooser);
  button("result_recovery").addEventListener("click", (): void => {
    const state = runtime.simulation;
    openRecovery(state?.level.id, true);
  });
  button("pause_button").addEventListener("click", togglePause);
  button("result_menu").addEventListener("click", quit);
  button("continue_button").addEventListener("click", (): void => {
    if (runtime.screen.kind !== "level_result" || runtime.simulation === undefined) return;
    const next = advanceLevel(runtime.simulation);
    if (next === undefined) return;
    runtime.simulation = next;
    celebration = undefined;
    screen({ kind: "briefing", levelId: next.level.id });
    showBriefing(next.level, false);
  });
  button("retry_button").addEventListener("click", (): void => {
    const state = runtime.simulation;
    if (state === undefined) return;
    briefing(state.mode === "practice" ? state.level.id : 1, state.mode);
  });
  button("practice_current").addEventListener("click", (): void => {
    const state = runtime.simulation;
    if (state === undefined || !isLevelUnlocked(state.level.id, runtime.save.unlockedLevel)) return;
    leaveCampaign((): void => {
      campaignStarted = false;
      briefing(state.level.id, "practice");
    });
  });
  button("practice_button").addEventListener("click", (): void => {
    const list = element("practice_levels");
    list.replaceChildren();
    for (const chapter of [1, 2, 3, 4] as const) {
      const group = document.createElement("section");
      group.className = "practice_chapter";
      const heading = document.createElement("h3");
      heading.textContent = `Chapter ${chapter} / ${CHAPTER_NAMES[chapter]}`;
      group.append(heading);
      const stages = document.createElement("div");
      stages.className = "practice_stages";
      for (const id of LEVEL_IDS.filter((id) => getLevel(id).chapter === chapter)) {
        const unlocked = isLevelUnlocked(id, runtime.save.unlockedLevel);
        const position = campaignPosition(id);
        const entry = action(
          `Stage ${position}: ${getLevel(id).name}${unlocked ? "" : " / Locked"}`,
          (): void => {
            if (isLevelUnlocked(id, runtime.save.unlockedLevel)) briefing(id, "practice");
          },
        );
        entry.disabled = !unlocked;
        stages.append(entry);
      }
      group.append(stages);
      list.append(group);
    }
    screen({ kind: "practice_select" }, element("practice_title"));
  });
  element("practice_select").append(action("Back to menu", menu));
  element("level_briefing").append(action("The real medicine", openMedicine));
  element("result_panel").append(action("The real medicine", openMedicine));
  button("instructions_button").addEventListener("click", (): void => {
    runtime.dialog = "instructions";
    dialogs.open("How to play", (body, close, footer): void => {
      paragraph(
        body,
        "Move with A/D or the arrow keys. Hold Space to fire upward. Dodge drifting hazards. On touch screens, hold the left or right button while firing. P or Escape pauses and resumes.",
      );
      paragraph(
        body,
        "Stents split yellow plaque. Aspirin inactivates one purple platelet hazard; clopidogrel can inactivate three. Dual mode alternates automatically. Clear all hazards, including incoming waves. In maintenance, keep the count at or below the safe maximum; five continuous seconds of overload costs a life.",
      );
      paragraph(
        body,
        "Three lives carry through the campaign. Practice unlocked levels with fresh lives and an unranked score. Medicines are an arcade metaphor; they do not remove cholesterol plaque.",
      );
      footer.append(action("Got it", close, true));
    });
  });
  button("settings_button").addEventListener("click", (): void => {
    runtime.dialog = "settings";
    dialogs.open("Settings", (body, close, footer): void => {
      settingsPanel(
        body,
        runtime.save.settings,
        settingsChanged,
        storageMessage(runtime.storageStatus),
      );
      footer.append(action("Done", close, true));
    });
  });
  button("surgeon_button").addEventListener("click", openSurgeonChooser);
  button("recovery_button").addEventListener("click", (): void => openRecovery());
  button("scores_button").addEventListener("click", (): void => {
    runtime.dialog = "scores";
    dialogs.open("High scores", (body, close, footer): void => {
      scoresPanel(body, runtime.save.records);
      footer.append(action("Close", close, true));
    });
  });
  const freeze = (): void => {
    if (isActive() || runtime.screen.kind === "celebration") togglePause();
    input.clear();
    heldAdvanceKeys.clear();
    pendingAdvance = undefined;
  };
  window.addEventListener("blur", freeze);
  document.addEventListener("visibilitychange", (): void => {
    if (document.hidden) freeze();
  });
  function advancePrimary(): HTMLButtonElement | undefined {
    if (dialogs.isOpen()) return undefined;
    if (runtime.screen.kind === "briefing") return button("start_level");
    if (
      runtime.screen.kind === "level_result" ||
      runtime.screen.kind === "campaign_result" ||
      runtime.screen.kind === "game_over"
    )
      return button(button("continue_button").hidden ? "retry_button" : "continue_button");
    return undefined;
  }
  function acceptsAdvance(target: EventTarget | null, primary: HTMLButtonElement): boolean {
    if (!(target instanceof Element)) return true;
    const control = target.closest(
      "button, input, textarea, select, a, dialog, [role='dialog'], [contenteditable]",
    );
    return control === null || control === primary;
  }
  window.addEventListener("keydown", (event): void => {
    if (event.code === "Enter" || event.code === "Space") {
      const fresh = !event.repeat && !heldAdvanceKeys.has(event.code);
      heldAdvanceKeys.add(event.code);
      const primary = advancePrimary();
      if (primary !== undefined && acceptsAdvance(event.target, primary)) {
        // The matching release activates once, including when the primary button has focus.
        event.preventDefault();
        if (fresh && !primary.disabled)
          pendingAdvance = { code: event.code, screen: runtime.screen, primary };
      }
    }
    if (
      (event.code === "KeyP" || event.code === "Escape") &&
      !event.repeat &&
      event.target instanceof Element &&
      event.target.closest("#pause_button") !== null
    ) {
      event.preventDefault();
      togglePause();
    }
    if (
      runtime.screen.kind === "pause" &&
      event.target instanceof Element &&
      event.target.closest("#game_dialog") !== null &&
      event.code === "KeyP" &&
      !event.repeat
    ) {
      event.preventDefault();
      dialogs.close();
    }
  });
  window.addEventListener("keyup", (event): void => {
    if (event.code !== "Enter" && event.code !== "Space") return;
    heldAdvanceKeys.delete(event.code);
    const primary = advancePrimary();
    if (primary !== undefined && acceptsAdvance(event.target, primary)) event.preventDefault();
    const pending = pendingAdvance;
    if (pending?.code !== event.code) return;
    pendingAdvance = undefined;
    event.preventDefault();
    if (
      pending.screen === runtime.screen &&
      pending.primary === advancePrimary() &&
      !pending.primary.disabled &&
      acceptsAdvance(event.target, pending.primary)
    )
      pending.primary.click();
  });
  const assetStatus = document.createElement("p");
  assetStatus.className = "medical_caption";
  assetStatus.setAttribute("role", "status");
  const retryAssets = action("Retry loading art", (): void => {
    void preload();
  });
  element("level_briefing").append(assetStatus, retryAssets);
  async function preload(): Promise<void> {
    assets = { kind: "loading" };
    button("start_level").disabled = true;
    assetStatus.textContent = "Loading the arena art...";
    retryAssets.hidden = true;
    try {
      const images = await loadAssets();
      assets = { kind: "ready", images };
      button("start_level").disabled = false;
      assetStatus.textContent = "";
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Arena art could not load. Retry to play.";
      assets = { kind: "error", message };
      assetStatus.textContent = message;
      retryAssets.hidden = false;
    }
  }
  window.addEventListener("pagehide", (event): void => {
    loop.stop();
    if (event.persisted) {
      // Cached pages retain their controllers and return through the normal pause dialog.
      freeze();
      audio.setPaused(true);
      return;
    }
    input.destroy();
    renderer?.destroy();
    audio.destroy();
  });
  window.addEventListener("pageshow", (event): void => {
    if (event.persisted) loop.start();
  });
  void preload();
  loop.start();
  if (!runtime.save.settings.surgeonChosen) chooseFirstSurgeon();
}

main();
