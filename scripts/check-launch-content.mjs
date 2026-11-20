import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const homepage = path.join(root, "app/[locale]/page.jsx");
const removedLandingComponents = [
  "app/[locale]/(pages)/(landingPage)/Stats.jsx",
  "app/[locale]/(pages)/(landingPage)/Testimonials.jsx",
];
const forbiddenHomepageMarkers = [
  /(?:import|<|\b)Stats\b/,
  /(?:import|<|\b)Testimonials\b/,
  /12K\+|850\+|300\+|40\+/,
  /placeholder traction|fictional people|placeholder quotes/i,
];

const violations = [];
const homepageSource = fs.readFileSync(homepage, "utf8");

for (const marker of forbiddenHomepageMarkers) {
  if (marker.test(homepageSource)) {
    violations.push(`${path.relative(root, homepage)} contains ${marker}`);
  }
}

for (const relativePath of removedLandingComponents) {
  if (fs.existsSync(path.join(root, relativePath))) {
    violations.push(`${relativePath} must remain removed until its content is verified`);
  }
}

for (const locale of ["en", "ar"]) {
  const relativePath = `messages/${locale}.json`;
  const messages = JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  const landing = messages.landing ?? {};

  if (Object.hasOwn(landing, "stats")) {
    violations.push(`${relativePath} contains the unverified landing.stats content`);
  }
  if (Object.hasOwn(landing, "testimonials")) {
    violations.push(`${relativePath} contains the unverified landing.testimonials content`);
  }
}

if (violations.length > 0) {
  console.error("Launch-content gate failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Launch-content gate passed: no unverified homepage traction or testimonials are present.");
}
