/** Seed a deterministic, fake browser session for authenticated Lighthouse routes. */
const AUTH_TOKEN = "lhci-authenticated-route-fixture";
const USER = {
  id: "lhci-user-717",
  _id: "lhci-user-717",
  name: "Lighthouse Fixture",
  email: "lighthouse@deenbridge.test",
  role: "student",
};

module.exports = async function seedLighthouseSession(browser) {
  const page = await browser.newPage();
  await page.setCookie(
    { name: "authToken", value: AUTH_TOKEN, domain: "localhost", path: "/" },
    {
      name: "userInfo",
      value: encodeURIComponent(JSON.stringify(USER)),
      domain: "localhost",
      path: "/",
    }
  );
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.close();
};
