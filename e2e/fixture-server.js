const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.PORT, 10) || 9999;
const FIXTURE_DIR = path.resolve(__dirname, "fixtures");

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, `${name}.json`), "utf8"));
}

const ROUTES = [
  // Auth
  { method: "POST", urlPattern: /^\/api\/auth\/login$/, fixture: "login" },
  { method: "POST", urlPattern: /^\/api\/auth\/register$/, fixture: "login" },

  // Users
  { method: "GET", urlPattern: /^\/api\/users\/.+$/, fixture: "login" },

  // Courses
  { method: "GET", urlPattern: /^\/api\/courses$/, fixture: "courses" },
  { method: "GET", urlPattern: /^\/api\/courses\/([^/]+)\/bookmark\/check$/, body: { isBookmarked: false } },
  { method: "POST", urlPattern: /^\/api\/courses\/([^/]+)\/enroll$/, body: { success: true } },
  { method: "GET", urlPattern: /^\/api\/courses\/([^/]+)$/, fixture: "course-detail" },

  // Stellar wallet
  { method: "GET", urlPattern: /^\/api\/stellar\/wallet\/me$/, fixture: "wallet-me" },
  { method: "POST", urlPattern: /^\/api\/stellar\/wallet\/connect$/, fixture: "wallet-me" },
  { method: "DELETE", urlPattern: /^\/api\/stellar\/wallet\/disconnect$/, body: { success: true } },
  { method: "GET", urlPattern: /^\/api\/stellar\/wallet\/balance\/.+$/, fixture: "wallet-me" },

  // Stellar payment
  { method: "POST", urlPattern: /^\/api\/stellar\/payment\/initialize$/, fixture: "payment-init" },
  { method: "POST", urlPattern: /^\/api\/stellar\/payment\/submit$/, fixture: "payment-submit" },
  { method: "DELETE", urlPattern: /^\/api\/stellar\/payment\/transactions\/.+$/, body: { success: true } },
  { method: "GET", urlPattern: /^\/api\/stellar\/payment\/transactions$/, body: { success: true, transactions: [], pagination: {} } },
];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  for (const route of ROUTES) {
    if (req.method !== route.method) continue;
    const match = pathname.match(route.urlPattern);
    if (!match) continue;

    let body;
    if (route.fixture) {
      body = loadFixture(route.fixture);
    } else if (route.body) {
      body = route.body;
    } else {
      body = { success: true };
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", path: pathname }));
});

server.listen(PORT, () => {
  console.log(`Fixture server running on http://localhost:${PORT}`);
});
