/**
 * Password policy, shared by every form that sets a password.
 *
 * Leans on NIST SP 800-63B: length and a blocklist do more real work than
 * strict composition rules, which mostly push people toward "Password1!".
 * So we require a decent length, reject known-weak and personal-info
 * passwords, and ask for 3 of 4 character classes rather than all 4.
 *
 * NOTE: this is UX, not enforcement. Everything here can be bypassed by
 * posting straight to the API, so the same rules belong server-side too.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

// bcrypt silently truncates at 72 bytes, so anything past that is not
// actually protecting the account. PASSWORD_MAX keeps us clear of it, but
// multibyte characters can push a short-looking string over on their own.
const BCRYPT_MAX_BYTES = 72;

const byteLength = (value) =>
  typeof TextEncoder !== "undefined"
    ? new TextEncoder().encode(value).length
    : Buffer.byteLength(value, "utf8");

/** Passwords common enough that an attacker tries them first. */
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "password1234",
  "passw0rd", "p@ssword", "p@ssw0rd", "mypassword", "passwordpassword",
  "12345678", "123456789", "1234567890", "123123123", "111111111",
  "qwerty", "qwerty123", "qwertyuiop", "qwerty1234", "1qaz2wsx",
  "asdfghjkl", "zxcvbnm", "abc12345", "abcd1234", "a1b2c3d4",
  "iloveyou", "letmein", "welcome", "welcome1", "welcome123",
  "admin", "admin123", "administrator", "root", "guest", "test1234",
  "monkey", "dragon", "sunshine", "princess", "football", "baseball",
  "superman", "batman", "trustno1", "starwars", "pokemon", "computer",
  "michael", "jennifer", "jordan23", "master", "shadow", "freedom",
  "whatever", "qazwsxedc", "changeme", "secret", "login", "passcode",
  "deenbridge", "deenbridge1", "deenbridge123", "islam123", "muslim123",
  "bismillah", "alhamdulillah", "assalamualaikum", "allahuakbar",
]);

/** Which character classes appear in the password. */
export function characterClasses(password) {
  return {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

const classCount = (password) =>
  Object.values(characterClasses(password)).filter(Boolean).length;

/** Three or more identical characters in a row: "aaa", "111". */
const hasRun = (password) => /(.)\1{2,}/.test(password);

/** Four or more sequential characters: "abcd", "4321", "wxyz". */
function hasSequence(password) {
  const lower = password.toLowerCase();
  let ascending = 1;
  let descending = 1;
  for (let i = 1; i < lower.length; i += 1) {
    const delta = lower.charCodeAt(i) - lower.charCodeAt(i - 1);
    ascending = delta === 1 ? ascending + 1 : 1;
    descending = delta === -1 ? descending + 1 : 1;
    if (ascending >= 4 || descending >= 4) return true;
  }
  return false;
}

const LEET = {
  0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 8: "b",
  "@": "a", $: "s", "!": "i", "+": "t",
};

const leet = (value) => value.replace(/[0134578@$!+]/g, (c) => LEET[c]);

/** Drop separators people sprinkle through a base word. */
const stripSeparators = (value) => value.replace(/[\s._\-]/g, "");

/** Drop the decoration people bolt onto the ends: "password123!", "!!admin". */
const stripEdges = (value) => value.replace(/^[^a-z]+/, "").replace(/[^a-z]+$/, "");

/**
 * A password is "common" if any plausible de-decoration of it lands in the
 * blocklist. Order matters: strip the trailing digits BEFORE leet-substituting,
 * or "password123" turns into "passwordi2e" and slips through.
 */
function normalisedCandidates(password) {
  const lower = password.toLowerCase();
  const bases = [lower, stripSeparators(lower)];
  const out = new Set();

  for (const base of bases) {
    out.add(base);
    const trimmed = stripEdges(base);
    out.add(trimmed);
    // Leet-substitute last, on the already-trimmed form.
    out.add(leet(base));
    out.add(stripEdges(leet(base)));
    out.add(leet(trimmed));
  }

  out.delete("");
  return out;
}

function isCommon(password) {
  for (const candidate of normalisedCandidates(password)) {
    if (COMMON_PASSWORDS.has(candidate)) return true;
  }
  return false;
}

/**
 * Personal info is the first thing anyone guesses. Compares against the name
 * and the email's local part, in fragments of 4+ characters.
 */
function containsPersonalInfo(password, { name = "", email = "" } = {}) {
  const haystack = password.toLowerCase();
  const fragments = [
    ...String(name).split(/\s+/),
    String(email).split("@")[0] || "",
  ]
    .map((f) => f.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((f) => f.length >= 4);

  return fragments.some((f) => haystack.includes(f));
}

/**
 * Requirement checklist for the UI. Order is stable so rows never jump around
 * as the user types.
 */
export function passwordRequirements(password = "", context = {}) {
  return [
    {
      id: "length",
      label: `At least ${PASSWORD_MIN} characters`,
      met: password.length >= PASSWORD_MIN,
    },
    {
      id: "classes",
      label: "Any 3 of: lowercase, uppercase, number, symbol",
      met: classCount(password) >= 3,
    },
    {
      id: "notCommon",
      label: "Not a commonly used password",
      met: password.length > 0 && !isCommon(password),
    },
    {
      id: "notPersonal",
      label: "Doesn't contain your name or email",
      met: password.length > 0 && !containsPersonalInfo(password, context),
    },
  ];
}

/** Every reason the password is unacceptable, most important first. */
export function passwordIssues(password = "", context = {}) {
  const issues = [];

  if (password.length < PASSWORD_MIN) {
    issues.push(`Password must be at least ${PASSWORD_MIN} characters`);
  }
  if (password.length > PASSWORD_MAX) {
    issues.push(`Password must be at most ${PASSWORD_MAX} characters`);
  } else if (byteLength(password) > BCRYPT_MAX_BYTES) {
    issues.push("Password is too long — please shorten it");
  }
  if (/^\s|\s$/.test(password)) {
    issues.push("Password can't start or end with a space");
  }
  if (classCount(password) < 3) {
    issues.push("Use at least three of: lowercase, uppercase, numbers, symbols");
  }
  if (isCommon(password)) {
    issues.push("This password is too common — please choose another");
  }
  if (containsPersonalInfo(password, context)) {
    issues.push("Password can't contain your name or email address");
  }
  if (hasRun(password)) {
    issues.push("Avoid repeating the same character three times or more");
  }
  if (hasSequence(password)) {
    issues.push("Avoid sequences like “abcd” or “1234”");
  }

  return issues;
}

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

/**
 * Coarse 0–4 score for the meter. Deliberately dependency-free — it guides
 * the user, while passwordIssues() decides what is actually allowed.
 */
export function passwordStrength(password = "", context = {}) {
  if (!password) return { score: 0, label: "", percent: 0 };

  let score = 0;
  if (password.length >= PASSWORD_MIN) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const classes = classCount(password);
  if (classes >= 3) score += 1;
  if (classes === 4) score += 1;

  // Distinct characters matter more than raw length.
  if (new Set(password).size >= 8) score += 1;

  if (hasRun(password)) score -= 1;
  if (hasSequence(password)) score -= 1;
  if (isCommon(password)) score -= 3;
  if (containsPersonalInfo(password, context)) score -= 2;

  const clamped = Math.max(0, Math.min(4, score));
  return {
    score: clamped,
    label: STRENGTH_LABELS[clamped],
    percent: ((clamped + 1) / 5) * 100,
  };
}

/**
 * Attaches the policy to a zod object schema. Done as a superRefine on the
 * whole object because the name/email rules need sibling fields.
 */
export function refinePassword(schema, { field = "password" } = {}) {
  return schema.superRefine((data, ctx) => {
    const issues = passwordIssues(data?.[field] ?? "", {
      name: data?.name ?? "",
      email: data?.email ?? "",
    });

    // One message at a time, so the field doesn't become a wall of text.
    if (issues.length > 0) {
      ctx.addIssue({ code: "custom", path: [field], message: issues[0] });
    }
  });
}
