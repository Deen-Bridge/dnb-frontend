import { safeMediaUrl } from "@/lib/media/safeMediaUrl";

describe("safe media URLs", () => {
  it("allows local and approved HTTPS media", () => {
    expect(safeMediaUrl("/images/cover.png")).toBe("/images/cover.png");
    expect(safeMediaUrl("https://res.cloudinary.com/demo/image/upload/a.png")).toBe(
      "https://res.cloudinary.com/demo/image/upload/a.png",
    );
  });

  it("rejects unsafe protocols and unapproved hosts", () => {
    expect(safeMediaUrl("javascript:alert(1)")).toBeNull();
    expect(safeMediaUrl("http://res.cloudinary.com/demo/a.png")).toBeNull();
    expect(safeMediaUrl("https://tracker.example/a.png")).toBeNull();
  });
});
