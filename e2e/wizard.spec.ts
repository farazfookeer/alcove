import { test, expect } from "@playwright/test";

test.describe("Wizard full walkthrough", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("completes all 8 steps end to end", async ({ page }) => {
    // Step 0: Welcome
    await expect(page.locator("text=Your personal AI assistant")).toBeVisible();
    await page.getByRole("button", { name: /step inside/i }).click();

    // Step 1: Provider — pick Claude
    await expect(page.locator("text=Choose your AI brain")).toBeVisible();
    await page.locator("text=Claude").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 2: Models — pick quick and deep models
    await expect(page.locator("text=Choose your AI models")).toBeVisible();
    await page.locator("text=Claude Haiku").click();
    await page.locator("text=Claude Opus").click();
    await expect(
      page.locator("text=fast model for most messages")
    ).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 3: API Key — should auto-populate and auto-validate
    await expect(page.locator("text=Connect to Claude")).toBeVisible();
    await expect(page.locator("input")).toHaveValue(/sk-ant-api03/);
    await expect(page.locator("text=API key verified")).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 4: Runtime — pick container
    await expect(
      page.locator("text=How should we run your assistant")
    ).toBeVisible();
    await expect(page.locator("text=Run in a container")).toBeVisible();
    await expect(
      page.locator("text=Run directly on this machine")
    ).toBeVisible();
    await page.locator("text=Run in a container").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 5: Channels — pick WhatsApp
    await expect(page.locator("text=Connect your channels")).toBeVisible();
    await page.locator("text=WhatsApp").click();
    await expect(page.locator("text=Selected")).toBeVisible();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 6: Skills — should have defaults selected
    await expect(page.locator("text=Pick your skills")).toBeVisible();
    await expect(page.locator("text=3 skills selected")).toBeVisible();
    await page.getByRole("button", { name: /review/i }).click();

    // Step 7: Review & Launch
    await expect(page.locator("text=Ready to launch")).toBeVisible();
    await expect(page.getByText("Claude", { exact: true })).toBeVisible();
    await expect(page.getByText("Claude Haiku")).toBeVisible();
    await expect(page.getByText("Claude Opus")).toBeVisible();
    await expect(page.getByText("Container")).toBeVisible();
    await expect(page.locator("text=WhatsApp")).toBeVisible();
    await expect(page.locator("text=3 selected")).toBeVisible();

    // Launch
    await page.getByRole("button", { name: /launch/i }).click();
    await expect(page.locator("text=Setting up your assistant")).toBeVisible();

    // Wait for dashboard to appear
    await expect(page.locator("text=Gateway")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Online")).toBeVisible();
  });

  test("cannot advance from provider step without selection", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /step inside/i }).click();
    await expect(page.locator("text=Choose your AI brain")).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await expect(continueBtn).toBeDisabled();
  });

  test("cannot advance from models step without both selections", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /step inside/i }).click();
    await page.locator("text=Claude").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.locator("text=Choose your AI models")).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await expect(continueBtn).toBeDisabled();

    await page.locator("text=Claude Haiku").click();
    await expect(continueBtn).toBeDisabled();

    await page.locator("text=Claude Opus").click();
    await expect(continueBtn).toBeEnabled();
  });

  test("cannot advance from runtime step without selection", async ({
    page,
  }) => {
    // Navigate to runtime step
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

    // On runtime step — Continue should be disabled
    await expect(
      page.locator("text=How should we run your assistant")
    ).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await expect(continueBtn).toBeDisabled();

    // Select native
    await page.locator("text=Run directly on this machine").click();
    await expect(continueBtn).toBeEnabled();
  });

  test("back button navigates to previous step", async ({ page }) => {
    await page.getByRole("button", { name: /step inside/i }).click();
    await page.locator("text=Claude").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.locator("text=Choose your AI models")).toBeVisible();
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.locator("text=Choose your AI brain")).toBeVisible();
  });

  test("switching provider resets model selections", async ({ page }) => {
    await page.getByRole("button", { name: /step inside/i }).click();
    await page.locator("text=Claude").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.locator("text=Claude Haiku").click();
    await page.locator("text=Claude Opus").click();

    await page.getByRole("button", { name: /back/i }).click();
    await page.locator("text=GPT-4o").first().click();
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page.locator("text=GPT-4o Mini")).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /continue/i });
    await expect(continueBtn).toBeDisabled();
  });
});
