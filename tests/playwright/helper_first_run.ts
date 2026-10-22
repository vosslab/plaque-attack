import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// src/dialogs.ts:firstSurgeonChooser owns the explicit card choice and Continue action.
// Ordinary journeys pass through the same first-run controls as a new player.
export async function chooseFirstSurgeonIfNeeded(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "Choose your surgeon", exact: true });
  const continueButton = dialog.getByRole("button", { name: "Continue", exact: true });
  if (!(await continueButton.isVisible())) return;
  await dialog
    .getByRole("button", { name: "Choose Dr. Maya Chen; same abilities", exact: true })
    .click();
  await continueButton.click();
  await expect(dialog).toBeHidden();
}
