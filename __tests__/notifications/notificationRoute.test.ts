import { notificationPath } from "@/lib/notifications/notificationRoute";

describe("notification navigation", () => {
  it("allows only known, bounded resource identifiers", () => {
    expect(notificationPath({ courseId: "course_123" })).toBe("/dashboard/courses/course_123");
    expect(notificationPath({ bookId: "../../admin" })).toBeNull();
    expect(notificationPath({ url: "https://evil.example" })).toBeNull();
  });
});
