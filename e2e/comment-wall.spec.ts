import { expect, test } from "@playwright/test";

test.describe("comment wall", () => {
  test("section and form are present", async ({ page }) => {
    await page.goto("/steins-gate/#wall");
    await expect(page.locator("#wall")).toBeVisible();
    await expect(page.getByPlaceholder(/พิมพ์ความในใจ/)).toBeVisible();
  });

  test("submitting shows the pending confirmation", async ({ page }) => {
    await page.goto("/steins-gate/#wall");
    await page.getByPlaceholder(/พิมพ์ความในใจ/).fill("playwright test comment");
    // Wait deterministically for the Turnstile widget iframe to appear.
    // The test site-key (1x00000000000000000000AA) auto-passes immediately on render.
    await page.locator('iframe[src*="challenges.cloudflare.com"]').waitFor({ timeout: 15000 });
    // Small fixed wait for the auto-verify callback to propagate into React state.
    await page.waitForTimeout(500);
    // Arm the response listener before clicking so we don't race the network.
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("/api/steins-gate/comments") && r.request().method() === "POST",
      { timeout: 20000 },
    );
    await page.getByRole("button", { name: /ส่งความในใจ/ }).click();
    await responsePromise;
    await expect(page.getByText(/ส่งแล้ว/)).toBeVisible({ timeout: 5000 });
  });

  test("reduced-motion still renders the wall", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/steins-gate/#wall");
    await expect(page.locator("#wall")).toBeVisible();
    await context.close();
  });
});
