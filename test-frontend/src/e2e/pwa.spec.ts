import { test, expect } from "@playwright/test";

test("install button and share menu render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("pwa-install-button")).toBeVisible();
  await expect(page.getByTestId("pwa-install-hero")).toBeVisible();
  await page.getByTestId("pwa-install-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("share menu opens and copy link is available", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("pwa-share-menu-trigger").click();
  await expect(page.getByTestId("pwa-share-menu-copy")).toBeVisible();
});
