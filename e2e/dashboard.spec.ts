import { test, expect } from "@playwright/test";

// Helper: navigate through wizard to dashboard
async function goToDashboard(page: ReturnType<typeof test["info"]> extends never ? never : any) {
  await page.goto("/");
  await page.getByRole("button", { name: /step inside/i }).click();
  await page.locator("text=Claude").first().click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.locator("text=Claude Haiku").click();
  await page.locator("text=Claude Opus").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.locator("text=API key verified")).toBeVisible({
    timeout: 5000,
  });
  await page.getByRole("button", { name: /continue/i }).click();
  await page.locator("text=Run in a container").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.locator("text=WhatsApp").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /review/i }).click();
  await page.getByRole("button", { name: /launch/i }).click();
  await expect(page.locator("text=Gateway")).toBeVisible({ timeout: 10000 });
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test("shows all five tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /status/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /channels/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /skills/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /logs/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /settings/i })).toBeVisible();
  });

  test("status panel shows gateway and cost tracker", async ({ page }) => {
    await expect(page.locator("text=Gateway")).toBeVisible();
    await expect(page.locator("text=Online").first()).toBeVisible();
    await expect(page.locator("text=Estimated Monthly Cost")).toBeVisible();
    await expect(page.locator("text=Quick replies").first()).toBeVisible();
    await expect(page.locator("text=Deep thinking").first()).toBeVisible();
  });

  test("skills tab shows skill store", async ({ page }) => {
    await page.getByRole("tab", { name: /skills/i }).click();
    await expect(page.locator("text=Skill Store")).toBeVisible();
    await expect(page.locator("text=Powered by ClawHub")).toBeVisible();
    await expect(page.getByRole("button", { name: /browse/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /installed/i })
    ).toBeVisible();
  });

  test("skill store has search and categories", async ({ page }) => {
    await page.getByRole("tab", { name: /skills/i }).click();
    await expect(
      page.locator('input[aria-label="Search skills"]')
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();
    await expect(page.locator("text=Productivity")).toBeVisible();
  });

  test("skill store installed tab shows empty or installed skills", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: /skills/i }).click();
    await page.getByRole("button", { name: /installed/i }).click();
    // In browser mock mode, invoke fails so installed list is empty
    await expect(
      page.locator("text=No skills installed yet").or(page.locator("text=Remove").first())
    ).toBeVisible();
  });

  test("logs tab shows log viewer", async ({ page }) => {
    await page.getByRole("tab", { name: /logs/i }).click();
    await expect(page.locator("text=Gateway Logs")).toBeVisible();
  });

  test("settings tab shows versions and runtime", async ({ page }) => {
    await page.getByRole("tab", { name: /settings/i }).click();
    await expect(page.locator("text=Versions")).toBeVisible();
    await expect(page.locator("text=Check for updates")).toBeVisible();
    await expect(page.locator("text=Runtime").first()).toBeVisible();
    await expect(page.locator("text=Uninstall Alcove")).toBeVisible();
  });

  test("settings tab shows runtime switch", async ({ page }) => {
    await page.getByRole("tab", { name: /settings/i }).click();
    await expect(page.locator("text=Switch Runtime")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /switch to/i })
    ).toBeVisible();
  });

  test("channels tab shows selected channels", async ({ page }) => {
    await page.getByRole("tab", { name: /channels/i }).click();
    await expect(page.locator("h2:has-text('Channels')")).toBeVisible();
    // WhatsApp was selected in the wizard
    await expect(page.locator("text=WhatsApp")).toBeVisible();
    await expect(page.locator("text=Not connected")).toBeVisible();
  });

  test("channels tab shows connect button", async ({ page }) => {
    await page.getByRole("tab", { name: /channels/i }).click();
    await expect(
      page.getByRole("button", { name: /connect/i })
    ).toBeVisible();
  });

  test("channels tab WhatsApp pairing shows QR instructions", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: /channels/i }).click();
    await page.getByRole("button", { name: /connect/i }).first().click();
    await expect(page.locator("text=Pair WhatsApp")).toBeVisible();
    await expect(page.locator("text=Scan this QR code")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /get qr code/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /cancel/i })
    ).toBeVisible();
  });

  test("status panel shows channel indicators", async ({ page }) => {
    // Status panel should show WhatsApp with a status dot
    await expect(page.locator("text=WhatsApp")).toBeVisible();
  });
});
