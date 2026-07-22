import { expect } from "@playwright/test";
import path from "path";

const FIXTURE_DIR = path.resolve(__dirname, "fixtures");

/**
 * Load a JSON fixture from the e2e/fixtures directory.
 */
function loadFixture(name) {
  return require(`./fixtures/${name}.json`);
}

/**
 * Route definitions mapping URL patterns to fixture files or status codes.
 *
 * Each entry: { method, urlPattern, fixture?, status?, body? }
 */
const ROUTES = [
  // Auth
  { method: "POST", urlPattern: "**/api/auth/login", fixture: "login" },
  { method: "POST", urlPattern: "**/api/auth/register", fixture: "login" },

  // Users
  { method: "GET", urlPattern: "**/api/users/**", fixture: "login" },

  // Courses
  { method: "GET", urlPattern: "**/api/courses", fixture: "courses" },
  {
    method: "GET",
    urlPattern: "**/api/courses/**/bookmark/check",
    status: 200,
    body: { isBookmarked: false },
  },

  // Stellar wallet
  { method: "GET", urlPattern: "**/api/stellar/wallet/me", fixture: "wallet-me" },
  {
    method: "POST",
    urlPattern: "**/api/stellar/wallet/connect",
    fixture: "wallet-me",
  },
  {
    method: "DELETE",
    urlPattern: "**/api/stellar/wallet/disconnect",
    status: 200,
    body: { success: true },
  },
  {
    method: "GET",
    urlPattern: "**/api/stellar/wallet/balance/**",
    fixture: "wallet-me",
  },

  // Stellar payment
  {
    method: "POST",
    urlPattern: "**/api/stellar/payment/initialize",
    fixture: "payment-init",
  },
  {
    method: "POST",
    urlPattern: "**/api/stellar/payment/submit",
    fixture: "payment-submit",
  },
  {
    method: "DELETE",
    urlPattern: "**/api/stellar/payment/transactions/**",
    status: 200,
    body: { success: true },
  },
  {
    method: "GET",
    urlPattern: "**/api/stellar/payment/transactions",
    status: 200,
    body: { success: true, transactions: [], pagination: {} },
  },
];

/**
 * Set up API route mocking for a Playwright page.
 *
 * Intercepts all requests matching the defined routes and returns
 * the corresponding fixture data. Unmatched requests pass through.
 */
export async function setupApiMocks(page) {
  const routeMap = new Map();

  for (const route of ROUTES) {
    const key = `${route.method}:${route.urlPattern}`;
    routeMap.set(key, route);

    await page.route(route.urlPattern, async (routeHandler, request) => {
      if (request.method() !== route.method && route.method !== "ALL") {
        return routeHandler.continue();
      }

      let body;
      if (route.fixture) {
        body = loadFixture(route.fixture);
      } else if (route.body) {
        body = route.body;
      } else {
        body = { success: true };
      }

      await routeHandler.fulfill({
        status: route.status || 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
  }
}

/**
 * Set up API mocks for an individual route (useful for dynamic overrides).
 */
export async function mockRoute(page, method, urlPattern, responseData, status = 200) {
  await page.route(urlPattern, async (routeHandler, request) => {
    if (request.method() !== method && method !== "ALL") {
      return routeHandler.continue();
    }
    await routeHandler.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Seed auth cookies for an authenticated session.
 */
export async function seedAuthCookies(page) {
  const fixture = loadFixture("login");
  await page.context().addCookies([
    {
      name: "authToken",
      value: fixture.token,
      domain: "localhost",
      path: "/",
    },
    {
      name: "userInfo",
      value: JSON.stringify(fixture.user),
      domain: "localhost",
      path: "/",
    },
  ]);
}
