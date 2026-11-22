import { expect, test } from '@playwright/test';
import { loginViaUi, registerViaApi, switchToMap, uniqueEmail } from './helpers';

const searchPlaceholder = 'Search by tag or keyword';

test.describe('UX improvements', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail();
    await registerViaApi(page.request, email);
    await loginViaUi(page, email);
  });

  test('the header mode control switches between Feed and Map', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Feed' })).toBeVisible();

    await page.getByRole('tab', { name: 'Map' }).click();
    await expect(page.getByPlaceholder(searchPlaceholder)).toBeVisible();

    await page.getByRole('tab', { name: 'Feed' }).click();
    await expect(page.getByText('Main Street Cafe')).toBeVisible();
  });

  test('the selected presentation persists when leaving and returning to Offers', async ({ page }) => {
    await switchToMap(page);

    await page.getByRole('button', { name: 'Reports' }).click();
    await page.getByRole('button', { name: 'Offers' }).click();

    await expect(page.getByPlaceholder(searchPlaceholder)).toBeVisible();
  });

  test('switching presentation preserves the active query', async ({ page }) => {
    await switchToMap(page);
    await page.getByPlaceholder(searchPlaceholder).fill('coffee');
    await page.getByPlaceholder(searchPlaceholder).press('Enter');
    await expect(page.getByText('Main Street Cafe')).toBeVisible();

    await page.getByRole('tab', { name: 'Feed' }).click();
    await page.getByRole('tab', { name: 'Map' }).click();

    await expect(page.getByPlaceholder(searchPlaceholder)).toHaveValue('coffee');
  });

  test('no results explains the state and offers to clear filters', async ({ page }) => {
    await switchToMap(page);
    await page.getByPlaceholder(searchPlaceholder).fill('zzzznotreal');
    await page.getByPlaceholder(searchPlaceholder).press('Enter');

    await expect(page.getByText('No offers matched the current filters.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(page.getByPlaceholder(searchPlaceholder)).toHaveValue('');
    await expect(page.getByText('Main Street Cafe')).toBeVisible();
  });

  test('a failed search shows a retry action and recovers', async ({ page }) => {
    await switchToMap(page);

    await page.route('**/api/offers/search', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );
    await page.getByPlaceholder(searchPlaceholder).fill('coffee');

    await expect(page.getByText('Offers search failed.')).toBeVisible();
    await page.unroute('**/api/offers/search');
    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(page.getByText('Offers search failed.')).toBeHidden();
  });

  test('the layout holds in phone landscape', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });

    await expect(page.getByRole('tab', { name: 'Feed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Offers' }).first()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('help opens from the header and can be closed', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click();

    await expect(page.getByText('How DealsSeeker works')).toBeVisible();
    await expect(page.getByText('Find nearby deals')).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('How DealsSeeker works')).toBeHidden();
  });

  test('the create action is a single floating button that opens Add Offer', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toHaveCount(1);

    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText('Add Offer')).toBeVisible();
  });
});
