import { test, expect } from "@playwright/test";
import { setupApiMocks, seedAuthCookies, mockRoute } from "./mocks";
import courseDetailFixture from "./fixtures/course-detail.json";
import coursesFixture from "./fixtures/courses.json";

test.describe("Course Browsing", () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuthCookies(page);
  });

  test("course grid renders from fixtures", async ({ page }) => {
    await page.goto("/dashboard/courses");
    await page.waitForLoadState("load");

    for (const course of coursesFixture.courses) {
      await expect(page.getByText(course.title).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("navigating to a course shows locked preview state", async ({ page }) => {
    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);

    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("load");

    await expect(page.getByText("Course Preview")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("🔒 Course Locked")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /pay \$25 with stellar/i })
    ).toBeVisible();
  });

  test("owned course shows watch course state", async ({ page }) => {
    // Seed a user who has purchased the course
    await page.context().addCookies([
      {
        name: "authToken",
        value: "e2e-test-jwt-token-12345",
        domain: "localhost",
        path: "/",
      },
      {
        name: "userInfo",
        value: JSON.stringify({
          _id: "e2e-user-001",
          id: "e2e-user-001",
          name: "Test User",
          email: "test@example.com",
          role: "student",
          purchasedCourses: [{ courseId: "course-001" }],
        }),
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("load");

    await expect(page.getByText("Watch Course")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("✅ You have access to this course")).toBeVisible();
  });

  test("empty course state is handled", async ({ page }) => {
    await mockRoute(page, "GET", "**/api/courses", {
      success: true,
      courses: [],
    });

    await page.goto("/dashboard/courses");
    await page.waitForLoadState("load");
    await expect(
      page.getByText(/no courses available/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
