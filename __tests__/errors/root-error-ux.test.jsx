import { describe, expect, it } from "vitest";

describe("root error UX contract", () => {
  it("keeps the fallback language and safe support paths explicit", async () => {
    const source = await import("fs").then((fs) => fs.readFileSync("app/global-error.jsx", "utf8"));
    expect(source).toContain('<html lang="en" dir="ltr">');
    expect(source).toContain("support@deenbridge.org");
    expect(source).toContain("Try again");
    expect(source).not.toContain("error.message");
  });
});
