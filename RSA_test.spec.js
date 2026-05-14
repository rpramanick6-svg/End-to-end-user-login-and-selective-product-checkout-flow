import { test, expect } from '@playwright/test';

test('RS Academy Page - network validation and UI assertions', async ({ page }) => {
  // Navigating to the login practice page
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');

  // Verifying that the username and password fields are visible
  await expect(page.locator('#username')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();

  // Entering valid login credentials
  await page.locator('#username').fill('rahulshettyacademy');
  await page.locator('#password').fill('Learning@830$3mK2');

  // Selecting the User radio button for triggering the modal flow
  await page.locator('input[value="user"]').check();

  // Verifying that the warning modal is appearing
  const modalBody = page.locator('.modal-body');
  await expect(modalBody).toBeVisible();
  await expect(modalBody).toContainText('limited to only fewer functionalities');

  // Accepting the modal
  await page.locator('#okayBtn').click();

  // Selecting a role from the dropdown
  await page.locator('select.form-control').selectOption({ label: 'Teacher' });

  // Accepting the terms and conditions
  await page.locator('#terms').check();

  // Starting to wait for the login-related network response before clicking sign in
  const loginResponsePromise = page.waitForResponse(async (response) => {
    const url = response.url();
    const method = response.request().method();

    return (
      method === 'POST' &&
      (url.includes('login') || url.includes('signIn') || url.includes('auth'))
    );
  });

  // Clicking the Sign In button
  await page.locator('#signInBtn').click();

  // Capturing the login response
  const loginResponse = await loginResponsePromise;

  // Verifying that the response status is successful
  expect(loginResponse.status()).toBeGreaterThanOrEqual(200);
  expect(loginResponse.status()).toBeLessThan(400);

  // Verifying that the request method is POST
  expect(loginResponse.request().method()).toBe('POST');

  // Capturing the response content type for additional validation
  const contentType = loginResponse.headers()['content-type'] || '';

  // Verifying the content type if the response is JSON
  if (contentType.includes('application/json')) {
    const responseBody = await loginResponse.json();

    // Verifying that the response body is defined
    expect(responseBody).toBeTruthy();

    // Verifying that the response body is an object
    expect(typeof responseBody).toBe('object');
  }

  // Verifying that navigation to the shop page is happening
  await expect(page).toHaveURL(/shop/);

  // Verifying that the shop page heading or product cards are visible
  const productCards = page.locator('.card');
  await expect(productCards.first()).toBeVisible();

  // Capturing product titles from the shop page
  const titles = await page.locator('.card-title').allTextContents();

  // Verifying that products are being loaded
  expect(titles.length).toBeGreaterThan(0);

  // Verifying that at least one known product name is present
  expect(titles.join(' ')).toContain('iphone');
});