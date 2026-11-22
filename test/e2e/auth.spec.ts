import { expect, test } from '@playwright/test';
import { loginViaUi, registerViaApi, uniqueEmail } from './helpers';

test.describe('authentication journey', () => {
  test('a new user registers from the UI and lands on the offers feed', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/');
    await page.getByText('Create a user').click();
    await page.getByPlaceholder('Display name').fill('New E2E User');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill('password1');
    await page.getByText('Create User', { exact: true }).click();

    await expect(page.getByText('Main Street Cafe')).toBeVisible();
  });

  test('an existing user logs in and logs out again', async ({ page }) => {
    const email = uniqueEmail();
    await registerViaApi(page.request, email);

    await loginViaUi(page, email);
    await page.getByText('My Account').first().click();
    await expect(page.getByText('Logout')).toBeVisible();

    await page.getByText('Logout').click();
    await expect(page.getByText('Sign in')).toBeVisible();
  });

  test('invalid credentials show a friendly error', async ({ page }) => {
    const email = uniqueEmail();
    await registerViaApi(page.request, email);

    await page.goto('/');
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByText('Login', { exact: true }).click();

    await expect(page.getByText(/Invalid credentials\.|Login failed\./)).toBeVisible();
  });
});
