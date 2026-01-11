import { expect, test } from '@playwright/test';

test.describe('Sidebar Navigation - Desktop', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/setup');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.waitForURL('/dashboard');
  });

  test('renders sidebar on desktop', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('FinanceControll');
  });

  test('renders all navigation links', async ({ page }) => {
    await expect(page.locator('aside a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Portfolios")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Assets")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Transactions")')).toBeVisible();
    await expect(page.locator('aside a:has-text("Settings")')).toBeVisible();
  });

  test('displays storage mode', async ({ page }) => {
    await expect(page.locator('aside:has-text("Storage Mode")')).toBeVisible();
    await expect(page.locator('aside:has-text("Local")')).toBeVisible();
  });

  test('navigates between pages', async ({ page }) => {
    await page.click('aside a:has-text("Portfolios")');
    await expect(page).toHaveURL('/portfolios');
    await expect(page.locator('h1:has-text("Portfolios")')).toBeVisible();

    await page.click('aside a:has-text("Assets")');
    await expect(page).toHaveURL('/assets');
    await expect(page.locator('h1:has-text("Assets")')).toBeVisible();

    await page.click('aside a:has-text("Transactions")');
    await expect(page).toHaveURL('/transactions');
    await expect(page.locator('h1:has-text("Transactions")')).toBeVisible();

    await page.click('aside a:has-text("Settings")');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    await page.click('aside a:has-text("Dashboard")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('highlights active navigation item', async ({ page }) => {
    // Dashboard should be active initially
    const dashboardLink = page.locator('aside a:has-text("Dashboard")').first();
    await expect(dashboardLink).toHaveClass(/bg-sidebar-primary/);

    // Navigate to portfolios
    await page.click('aside a:has-text("Portfolios")');
    await page.waitForURL('/portfolios');

    const portfoliosLink = page.locator('aside a:has-text("Portfolios")').first();
    await expect(portfoliosLink).toHaveClass(/bg-sidebar-primary/);
  });

  test('mobile toggle button is not visible on desktop', async ({ page }) => {
    const toggleButton = page.locator('button[aria-label="Open navigation menu"]');
    await expect(toggleButton).not.toBeVisible();
  });
});

test.describe('Sidebar Navigation - Mobile', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/setup');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.waitForURL('/dashboard');
  });

  test('renders mobile toggle button', async ({ page }) => {
    const toggleButton = page.locator('button[aria-label="Open navigation menu"]');
    await expect(toggleButton).toBeVisible();
  });

  test('desktop sidebar is hidden on mobile', async ({ page }) => {
    const desktopSidebar = page.locator('aside');
    await expect(desktopSidebar).not.toBeVisible();
  });

  test('opens drawer when toggle is clicked', async ({ page }) => {
    const toggleButton = page.locator('button[aria-label="Open navigation menu"]');
    await toggleButton.click();

    // Wait for drawer to open
    await expect(page.locator('text=FinanceControll').nth(1)).toBeVisible();
    await expect(page.locator('text=Dashboard').nth(1)).toBeVisible();
  });

  test('navigates and closes drawer when link is clicked', async ({ page }) => {
    // Open drawer
    const toggleButton = page.locator('button[aria-label="Open navigation menu"]');
    await toggleButton.click();

    // Wait for drawer to fully open and click portfolios link
    await page.waitForTimeout(500); // Wait for drawer animation
    await page.getByRole('link', { name: 'Portfolios' }).click();

    // Should navigate and close drawer
    await expect(page).toHaveURL('/portfolios');
    await expect(page.locator('h1:has-text("Portfolios")')).toBeVisible();

    // Drawer should be closed (toggle button still visible)
    await expect(toggleButton).toBeVisible();
  });

  test('highlights active navigation item in mobile drawer', async ({ page }) => {
    // Open drawer
    const toggleButton = page.locator('button[aria-label="Open navigation menu"]');
    await toggleButton.click();

    // Dashboard should be active initially
    const dashboardParent = page.locator('a:has-text("Dashboard")').nth(1);
    await expect(dashboardParent).toHaveClass(/bg-sidebar-primary/);
  });
});
