import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const API_BASE_URL = 'http://localhost:5005';

export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function switchToMap(page: Page) {
  await page.getByRole('tab', { name: 'Map' }).click();
  await expect(page.getByPlaceholder('Search by tag or keyword')).toBeVisible();
}

export async function registerViaApi(request: APIRequestContext, email: string, displayName = 'E2E User') {
  const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
    data: { displayName, email, password: 'password1' },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
}

export async function loginViaUi(page: Page, email: string, password = 'password1') {
  // Existing-user journeys are not first runs; suppress the one-time tip.
  await page.addInitScript(() => {
    localStorage.setItem('dealseeker.onboarding.completed', 'true');
  });
  await page.goto('/');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByText('Login', { exact: true }).click();
  await expect(page.getByText('Main Street Cafe')).toBeVisible();
}
