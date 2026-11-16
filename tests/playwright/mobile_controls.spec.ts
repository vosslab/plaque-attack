import { expect, test } from "@playwright/test";
import type { CDPSession, Page } from "@playwright/test";
import { chooseFirstSurgeonIfNeeded } from "./helper_first_run";

// src/index.html owns named touch controls; src/acceptance.ts exposes detached observations.
// Repair input ownership or cleanup if this ordinary-control journey fails.
test.use({ hasTouch: true, isMobile: true, viewport: { width: 844, height: 390 } });

type Contact = { id: number; x: number; y: number };

async function contact(page: Page, name: string, id: number): Promise<Contact> {
  const button = page.getByRole("button", { name, exact: true });
  await expect(button).toBeInViewport({ ratio: 1 });
  const box = await button.boundingBox();
  if (box === null) throw new Error(`Missing ${name}`);
  return { id, x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function touches(
  session: CDPSession,
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  points: Contact[],
): Promise<void> {
  await session.send("Input.dispatchTouchEvent", { type, touchPoints: points });
}

async function observation(page: Page): Promise<{ x: number; shots: number }> {
  return page.evaluate(() => {
    const simulation = window.__plaqueAcceptance?.().simulation;
    if (simulation === undefined) throw new Error("Missing observation");
    return { x: simulation.player.position.x, shots: simulation.nextProjectileId };
  });
}

async function start(page: Page): Promise<void> {
  await page.clock.install({ time: new Date("2026-11-15T12:00:00Z") });
  await page.goto("/?acceptance");
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.locator("#start_level")).toBeEnabled();
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 100));
  await page.getByRole("button", { name: "Play campaign", exact: true }).tap();
  await page.getByRole("button", { name: "Start stage", exact: true }).tap();
  await page.clock.runFor(3300);
}

test("independent touch holds compose with keyboard and clear on interruption", async ({
  page,
}) => {
  await start(page);
  const pointers = await page.evaluateHandle(() => {
    const held = new Map<number, Element>();
    for (const button of document.querySelectorAll(".touch_button")) {
      button.addEventListener("pointerdown", (event) => {
        held.set((event as PointerEvent).pointerId, button);
      });
      for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
        button.addEventListener(type, (event) => held.delete((event as PointerEvent).pointerId));
      }
    }
    return held;
  });
  const session = await page.context().newCDPSession(page);
  const right = await contact(page, "Move right", 1);
  const fire = await contact(page, "Fire", 2);
  const second = { ...right, id: 3, x: right.x + 10 };
  const before = await observation(page);
  await touches(session, "touchStart", [right, fire, second]);
  await page.clock.runFor(600);
  const held = await observation(page);
  expect(held.x).toBeGreaterThan(before.x);
  expect(held.shots).toBeGreaterThan(before.shots);

  // Keyboard release must not release either touch source.
  await page.keyboard.down("ArrowRight");
  await page.keyboard.up("ArrowRight");
  await page.keyboard.down("Space");
  await page.keyboard.up("Space");
  await touches(session, "touchEnd", [right]);
  await page.clock.runFor(600);
  const oneDirection = await observation(page);
  expect(oneDirection.x).toBeGreaterThan(held.x);
  expect(oneDirection.shots).toBeGreaterThan(held.shots);
  await touches(session, "touchEnd", [second]);
  const released = await observation(page);
  await page.clock.runFor(1000);
  const fireOnly = await observation(page);
  expect(fireOnly.x).toBe(released.x);
  expect(fireOnly.shots).toBeGreaterThan(released.shots);
  await touches(session, "touchCancel", []);
  const canceled = await observation(page);
  await page.clock.runFor(400);
  expect(await observation(page)).toEqual(canceled);

  const left = await contact(page, "Move left", 4);
  for (const interruption of ["capture", "blur", "visibility", "pause"] as const) {
    const initial = await observation(page);
    await touches(session, "touchStart", [left, fire]);
    await page.clock.runFor(100);
    expect((await observation(page)).x, interruption).toBeLessThan(initial.x);
    if (interruption === "capture") {
      // Flush pending capture before releasing real browser-assigned pointer IDs.
      await touches(session, "touchMove", [
        { ...left, x: left.x + 1 },
        { ...fire, x: fire.x + 1 },
      ]);
      expect(await pointers.evaluate((held) => held.size)).toBe(2);
      await pointers.evaluate((held) => {
        for (const [pointer, button] of held) button.releasePointerCapture(pointer);
      });
      await touches(session, "touchMove", [
        { ...left, x: left.x + 2 },
        { ...fire, x: fire.x + 2 },
      ]);
      await expect.poll(() => pointers.evaluate((held) => held.size)).toBe(0);
      await page.clock.runFor(20);
    } else if (interruption === "blur") {
      await page.evaluate(() => window.dispatchEvent(new Event("blur")));
      await page.getByRole("button", { name: "Resume game", exact: true }).tap();
    } else if (interruption === "visibility") {
      // Browser lifecycle notification is injected; this is not a physical backgrounding test.
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, value: true });
        document.dispatchEvent(new Event("visibilitychange"));
        Reflect.deleteProperty(document, "hidden");
      });
      await page.getByRole("button", { name: "Resume game", exact: true }).tap();
    } else {
      await page.getByRole("button", { name: "Pause game", exact: true }).tap();
      await page.getByRole("button", { name: "Resume game", exact: true }).tap();
    }
    const stopped = await observation(page);
    await page.clock.runFor(300);
    expect(await observation(page), interruption).toEqual(stopped);
    await touches(session, "touchEnd", []);
  }
});

test("touch fire clears the first stage and later practice tools remain reachable", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await start(page);
  const session = await page.context().newCDPSession(page);
  await touches(session, "touchStart", [await contact(page, "Fire", 1)]);
  const cleared = page.getByRole("heading", { name: "Plaque cleared!", exact: true });
  for (let elapsed = 0; elapsed < 120_000 && !(await cleared.isVisible()); elapsed += 1000) {
    await page.clock.runFor(1000);
  }
  await touches(session, "touchEnd", []);
  await expect(cleared).toBeVisible();
  await page.getByRole("button", { name: /^Next: Stage / }).tap();
  await page.getByRole("button", { name: "Back to menu", exact: true }).tap();

  // Permitted pre-boot unlocked-progress fixture; never mutate a live simulation.
  await page.addInitScript(() => {
    localStorage.setItem(
      "plaque_trouble_save",
      JSON.stringify({
        version: 1,
        settings: { music: false, effects: false, completedTutorials: ["move", "fire", "split"] },
        unlockedLevel: 15,
        records: [
          { score: 1234, levelReached: 15, outcome: "completed", date: "2026-10-21T12:00:00.000Z" },
        ],
      }),
    );
  });
  await page.reload();
  await chooseFirstSurgeonIfNeeded(page);
  await expect(page.locator("#start_level")).toBeEnabled();
  for (const [stage, tool] of [
    [7, "aspirin"],
    [13, "clopidogrel"],
    [24, "dual"],
  ] as const) {
    await page.getByRole("button", { name: "Practice", exact: true }).tap();
    await page.getByRole("button", { name: new RegExp(`^Stage ${stage}:`) }).tap();
    await page.getByRole("button", { name: "Start stage", exact: true }).tap();
    await page.clock.runFor(3300);
    await touches(session, "touchStart", [await contact(page, "Fire", 8)]);
    await page.clock.runFor(300);
    const kinds = await page.evaluate(() =>
      window.__plaqueAcceptance?.().simulation?.projectiles.map((projectile) => projectile.kind),
    );
    expect(kinds?.some((kind) => (tool === "dual" ? kind !== "stent" : kind === tool))).toBe(true);
    if (tool === "dual") {
      await page.clock.runFor(400);
      const later = await page.evaluate(() =>
        window.__plaqueAcceptance?.().simulation?.projectiles.map((projectile) => projectile.kind),
      );
      expect([...(kinds ?? []), ...(later ?? [])]).toEqual(
        expect.arrayContaining(["aspirin", "clopidogrel"]),
      );
    }
    await page.getByRole("button", { name: "Pause game", exact: true }).tap();
    await page.getByRole("button", { name: "Restart practice", exact: true }).tap();
    await page.clock.runFor(3300);
    const retry = await observation(page);
    await page.clock.runFor(300);
    expect(await observation(page)).toEqual(retry);
    await touches(session, "touchEnd", []);
    await page.getByRole("button", { name: "Pause game", exact: true }).tap();
    await page.getByRole("button", { name: "Main menu", exact: true }).tap();
    await page.clock.runFor(1);
  }
});

test("fullscreen rejection leaves touch play and rotation usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: true });
    Element.prototype.requestFullscreen = (): Promise<void> =>
      Promise.reject(new DOMException("Test permission denial", "NotAllowedError"));
  });
  await start(page);
  const expand = page.getByRole("button", { name: "Larger arena", exact: true });
  await expand.tap();
  await expect(
    page.getByRole("status").filter({ hasText: "Fullscreen unavailable" }),
  ).toBeVisible();
  await expect(expand).toBeEnabled();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#arena")).toBeInViewport({ ratio: 1 });
  const session = await page.context().newCDPSession(page);
  const before = await observation(page);
  await touches(session, "touchStart", [await contact(page, "Move right", 1)]);
  await page.clock.runFor(100);
  expect((await observation(page)).x).toBeGreaterThan(before.x);
  await touches(session, "touchEnd", []);
  await page.getByRole("button", { name: "Pause game", exact: true }).tap();
  await page.getByRole("button", { name: "Resume game", exact: true }).tap();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#arena")).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole("button", { name: "Fire", exact: true })).toBeInViewport({
    ratio: 1,
  });
});
