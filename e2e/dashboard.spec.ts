import { test, expect } from "@playwright/test";

// These specs run serially: two concurrent cold navigations to the same
// client:load island route (e.g. two tests hitting /dashboard/login at once
// under fullyParallel workers) can make the dev-server's on-demand Vite
// transform race and leave React hydration permanently inert on both pages
// (confirmed via a throwaway diagnostic run — no console/page errors, no
// failed requests, the typed value just never reaches React state). Serial
// mode removes the concurrent-navigation trigger; the retry helpers below
// remain as a guard against the single-request cold-compile race.
test.describe.configure({ mode: "serial" });

async function submitAccessKey(page: import("@playwright/test").Page, value: string) {
  const input = page.getByLabel(/Password/i);
  const submit = page.getByRole("button", { name: /Sign in/i });
  // LoginForm is a client:load island; on a cold Vite compile fill() can beat
  // hydration and be discarded. Retry until the controlled input reflects the
  // value (the submit button un-disables), then submit.
  await expect(async () => {
    await input.fill(value);
    await expect(submit).toBeEnabled({ timeout: 1000 });
  }).toPass({ timeout: 20000 });
  await submit.click();
}

async function logout(page: import("@playwright/test").Page) {
  const button = page.getByRole("button", { name: /Log out/i });
  // DashboardApp is also a client:load island; on a cold Vite compile the
  // click can land before hydration attaches the handler, so the click is a
  // no-op. Retry until the post-logout navigation actually happens.
  await expect(async () => {
    await button.click();
    await expect(page).toHaveURL(/\/dashboard\/login/, { timeout: 1000 });
  }).toPass({ timeout: 20000 });
}

test("unauthenticated visit redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/login/);
  await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
});

test("wrong password is rejected", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/dashboard/login");
  await submitAccessKey(page, "wrong-password");
  await expect(page.getByRole("alert")).toContainText(/Incorrect password/i);
});

test("correct password lands on the dashboard and can log out", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/dashboard/login");
  await submitAccessKey(page, "devpassword");
  await expect(page).toHaveURL(/\/dashboard\/?$/);
  await expect(page.getByText(/Total downloads/i)).toBeVisible();
  await logout(page);
});
