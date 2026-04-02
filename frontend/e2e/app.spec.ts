import { test, expect } from '@playwright/test';

test.describe('Municipal Security System E2E', () => {
  test('complete user journey: login -> dashboard -> incidents -> map', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Check if we're on login page
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('input[type="email"]', 'admin@municipio.com');
    await page.fill('input[type="password"]', 'secret');

    // Click login button
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Check dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Navigate to incidents
    await page.click('a[href*="incidentes"]');

    // Check incidents page
    await expect(page.locator('h1')).toContainText('Incidentes');

    // Navigate to map
    await page.click('a[href*="mapa"]');

    // Check map page
    await expect(page.locator('h1')).toContainText('Mapa');

    // Check map is rendered (leaflet container)
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('incident creation flow', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@municipio.com');
    await page.fill('input[type="password"]', 'secret');
    await page.click('button[type="submit"]');

    // Go to incidents
    await page.click('a[href*="incidentes"]');

    // Click create incident button (assuming it exists)
    const createButton = page.locator('button').filter({ hasText: 'Crear' }).first();
    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill incident form (assuming modal or page)
      await page.fill('input[name="tipo"]', 'Test Incident');
      await page.fill('textarea[name="descripcion"]', 'Test description');
      await page.selectOption('select[name="prioridad"]', 'media');

      // Submit
      await page.click('button[type="submit"]');

      // Check success message or redirect
      await expect(page.locator('.success-message, .alert-success')).toBeVisible();
    }
  });

  test('map interaction', async ({ page }) => {
    // Login and go to map
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@municipio.com');
    await page.fill('input[type="password"]', 'secret');
    await page.click('button[type="submit"]');
    await page.click('a[href*="mapa"]');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container');

    // Click on a marker (assuming there are markers)
    const marker = page.locator('.leaflet-marker-icon').first();
    if (await marker.isVisible()) {
      await marker.click();

      // Check popup appears
      await expect(page.locator('.leaflet-popup')).toBeVisible();

      // Check sidebar updates
      await expect(page.locator('aside, .sidebar')).toContainText('Incidentes');
    }
  });

  test('responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile

    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@municipio.com');
    await page.fill('input[type="password"]', 'secret');
    await page.click('button[type="submit"]');

    // Check mobile layout
    await expect(page.locator('.mobile-menu, .hamburger')).toBeVisible();
  });
});