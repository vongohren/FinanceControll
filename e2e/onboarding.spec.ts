import { expect, test } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test
    await context.clearCookies();
  });

  test('should redirect to setup when no storage mode is set', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/setup');
  });

  test('should display setup page content', async ({ page }) => {
    await page.goto('/setup');

    // Verify page content
    await expect(page.getByText('Welcome to FinanceControll')).toBeVisible();
    await expect(page.getByText('Local Only')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('should complete local storage setup', async ({ page }) => {
    await page.goto('/setup');

    // Click Get Started button
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    // Storage mode card shows 'local' (exact match to avoid matching 'locally')
    await expect(page.getByText('local', { exact: true })).toBeVisible();
  });

  test('should persist storage mode across page reloads', async ({ page }) => {
    // Complete setup
    await page.goto('/setup');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Reload and verify persistence
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('local', { exact: true })).toBeVisible();
  });

  test('should maintain session across new tabs', async ({ page, context }) => {
    // Complete setup
    await page.goto('/setup');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Open new tab in same context
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');
    await expect(newPage.getByText('Dashboard')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up storage mode before each test
    await page.goto('/setup');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display empty state', async ({ page }) => {
    // Use exact match to avoid matching "Create portfolios..."
    await expect(page.getByText('Portfolios', { exact: true })).toBeVisible();
    await expect(page.getByText('0', { exact: true }).first()).toBeVisible();
  });
});
