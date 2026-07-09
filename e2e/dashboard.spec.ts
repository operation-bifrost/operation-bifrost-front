import { test, expect } from "@playwright/test";

test("unauthenticated visit redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard\/login/);
  await expect(page.getByRole("heading", { name: /RESTRICTED/i })).toBeVisible();
});

test("wrong password is rejected", async ({ page }) => {
  await page.goto("/dashboard/login");
  await page.getByLabel(/ENTER ACCESS KEY/i).fill("wrong-password");
  await page.getByRole("button", { name: /AUTHENTICATE/i }).click();
  await expect(page.getByRole("alert")).toContainText(/ACCESS DENIED/i);
});

test("correct password lands on the dashboard and can log out", async ({ page }) => {
  await page.goto("/dashboard/login");
  await page.getByLabel(/ENTER ACCESS KEY/i).fill("devpassword");
  await page.getByRole("button", { name: /AUTHENTICATE/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/?$/);
  await expect(page.getByText(/TOTAL DOWNLOADS/i)).toBeVisible();
  await page.getByRole("button", { name: /LOGOUT/i }).click();
  await expect(page).toHaveURL(/\/dashboard\/login/);
});
