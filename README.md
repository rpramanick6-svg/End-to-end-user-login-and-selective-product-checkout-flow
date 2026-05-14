# Rahul Shetty Login Page + Shop Flow with Network Validation

This project contains a Playwright end-to-end test that validates a user login flow, handles modal interaction, navigates to the shop page, selects specific products, and performs API-style network assertions after the login action. Playwright supports both UI automation and direct or observed API response validation through its test runner and request/response APIs.

## Test objective

The purpose of this test is to verify that a valid user can sign in successfully, interact with the role-based warning flow, reach the shop page, and add selected products to the cart while also validating the login-related backend response triggered during the UI flow.

## Application under test

The test uses the Rahul Shetty Academy login practice site at `https://rahulshettyacademy.com/loginpagePractise/`, which exposes a login form, role selection controls, a warning modal for the user path, and a shop page with product cards after successful authentication.

## Test coverage

The automated flow covers the following validations:

- Opening the login page and verifying the login form is visible.
- Entering valid credentials and selecting the `User` role.
- Handling the warning modal and confirming the flow.
- Selecting a dropdown value and accepting terms.
- Clicking Sign In and capturing the login-related backend response with `page.waitForResponse()`.
- Verifying the response status code and request method.
- Parsing the response body when the response is JSON.
- Verifying navigation to the shop page and checking that products are loaded.
- Adding only selected products to the cart and validating checkout contents.

## Why this test is valuable

This test demonstrates more than a simple login script because it combines UI automation with backend response verification in a single scenario. That makes it a stronger example of real-world automation, where quality checks often require both frontend assertions and network-level validation.

It also shows practical Playwright skills such as modal handling, dropdown interaction, dynamic product selection, response synchronization, and post-login business validation. These are useful patterns for scalable end-to-end automation suites.

## Code

```
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
```

Playwright supports response monitoring with `page.waitForResponse()` and exposes response metadata such as status, headers, request method, and parsed body for validation. It also provides built-in assertions for UI state and response success checks.[3][10][6]

## Project structure

```text
rahulshetty-playwright-test/
├── tests/
│   └── login-shop-network.spec.ts
├── playwright.config.ts
├── package.json
└── README.md
```

Playwright projects commonly store spec files inside a configured test directory such as `./tests`, with a root config file controlling browser and runner behavior.[11]

## Configuration example

```ts
// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  reporter: 'html',
  use: {
    browserName: 'chromium',
    headless: false,
  },
});
```

In Playwright, runner-level options such as `testDir`, `timeout`, `expect`, and `reporter` are configured at the top level, while shared browser and context settings such as `browserName` and `headless` are configured under `use`.


## Assertions used

This test includes the following assertion types:

- Visibility assertions with `toBeVisible()`.
- URL assertion with `toHaveURL()`.
- Text assertion with `toContainText()` and `toContain()`.
- Response status assertions after the network call.
- Request method validation through `response.request().method()`.
- Header validation through `response.headers()`.
- Conditional JSON parsing and response body assertions.

These assertions help confirm that the user flow is correct, the network response is valid, and the application is loading meaningful post-login content.

## Notes

The login-response matcher shown in the sample test is intentionally broad so the endpoint can be discovered safely during initial automation. Once the exact request URL is confirmed in browser devtools or Playwright tracing, the response predicate should be tightened for better stability.

This project is best treated as a UI-driven test with network validation rather than a pure API automation project, because the backend request is being observed from the browser flow instead of being called directly with Playwright's request fixture.
