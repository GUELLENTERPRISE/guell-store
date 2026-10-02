import { test, expect } from '@playwright/test';

test.describe('TableFlow smoke', () => {
  test('public entry renders without a server error', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
    await expect(page).not.toHaveTitle(/Application Error|Internal Server Error/i);
  });

  test('table menu route does not return a server error', async ({ page }) => {
    const response = await page.goto('/table');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });

  test('kitchen route does not return a server error', async ({ page }) => {
    const response = await page.goto('/kitchen');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).not.toContainText(/Internal Server Error/i);
  });
});