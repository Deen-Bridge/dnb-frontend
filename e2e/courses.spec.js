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
    await page.waitForLoadState("networkidle");

    for (const course of coursesFixture.courses) {
      await expect(page.getByText(course.title).first()).toBeVisible();
    }
  });

  test("navigating to a course shows locked preview state", async ({ page }) => {
    await mockRoute(page, "GET", "**/api/courses/course-001", courseDetailFixture);

    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Course Preview")).toBeVisible();
    await expect(page.getByText("🔒 Course Locked")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /pay \$25 with stellar/i })
    ).toBeVisible();
  });

  test("owned course shows watch course state", async ({ page }) => {
    const ownedCourse = {
      ...courseDetailFixture,
      course: {
        ...courseDetailFixture.course,
        enrolledUsers: ["e2e-user-001"],
      },
    };
    await mockRoute(page, "GET", "**/api/courses/course-001", {
      success: true,
      course: ownedCourse.course,
    });

    await page.goto("/dashboard/courses/course-001");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Watch Course")).toBeVisible();
    await expect(page.getByText("✅ You have access to this course")).toBeVisible();
  });

  test("empty course state is handled", async ({ page }) => {
    await mockRoute(page, "GET", "**/api/courses", {
      success: true,
      courses: [],
    });

    await page.goto("/dashboard/courses");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/no courses available/i)
    ).toBeVisible();
  });
});
