import { expect, test } from "@playwright/test";

test.describe("comment wall", () => {
  test("section and form are present", async ({ page }) => {
    await page.goto("/steins-gate/#wall");
    await expect(page.locator("#wall")).toBeVisible();
    await expect(page.getByPlaceholder(/พิมพ์ความในใจ/)).toBeVisible();
  });

  test("submitting shows the pending confirmation", async ({ page }) => {
    // Stub the Turnstile client script so the widget immediately yields a token in
    // headless Chromium (no iframe needed). The server verifies against the real
    // siteverify endpoint using the test secret (1x0000000000000000000000000000000AA)
    // which always passes, so the dummy token is accepted and the POST returns 202.
    await page.route("**/challenges.cloudflare.com/turnstile/v0/api.js**", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `window.turnstile={render:(el,opts)=>{opts.callback("XXXX.DUMMY.TOKEN");return "stub-widget";},remove:()=>{}};`,
      }),
    );
    await page.goto("/steins-gate/#wall");
    // Wait for the Turnstile stub script to execute (confirms React has hydrated and
    // the script request was intercepted). After this, render() has synchronously
    // called opts.callback which queued setToken() in React's scheduler.
    await page.waitForFunction(() => "turnstile" in window, {
      timeout: 15000,
    });
    // Give React's scheduler a tick to flush the setToken() state update.
    await page.waitForTimeout(300);
    // Fill the textarea after hydration so the controlled-input onChange updates React state.
    await page.getByPlaceholder(/พิมพ์ความในใจ/).fill("playwright test comment");
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
