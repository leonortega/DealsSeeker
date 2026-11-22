import { expect, test } from '@playwright/test';
import { loginViaUi, registerViaApi, switchToMap, uniqueEmail } from './helpers';

test.describe('offers journey', () => {
  test.beforeEach(async ({ page }) => {
    const email = uniqueEmail();
    await registerViaApi(page.request, email);
    await loginViaUi(page, email);
  });

  test('smart search filters the feed to matching offers', async ({ page }) => {
    await switchToMap(page);
    await page.getByPlaceholder('Search by tag or keyword').fill('coffee');
    await page.getByPlaceholder('Search by tag or keyword').press('Enter');

    await expect(page.getByText('Main Street Cafe')).toBeVisible();
    await expect(page.getByText('Broadway Market')).toBeHidden();
  });

  test('favoriting an offer makes it appear under Favorites', async ({ page }) => {
    await page.getByRole('button', { name: 'favorite', exact: true }).first().click();
    await page.getByRole('tab', { name: 'Favorites' }).click();

    await expect(page.getByText('Main Street Cafe')).toBeVisible();
    await expect(page.getByText('Broadway Market')).toBeHidden();
  });

  test('a comment can be published from an offer card', async ({ page }) => {
    await page.getByRole('button', { name: /Comments/ }).first().click();

    const commentBody = `E2E comment ${Date.now()}`;
    await page.getByPlaceholder('Write a comment…').fill(commentBody);
    await page.getByText('Publish', { exact: true }).click();

    await expect(page.getByText(commentBody)).toBeVisible();
  });
});
