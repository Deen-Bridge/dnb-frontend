import { z } from "zod";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

const BCRYPT_MAX_BYTES = 72;

const byteLength = (value: string): number =>
  typeof TextEncoder !== "undefined"
    ? new TextEncoder().encode(value).length
    : Buffer.byteLength(value, "utf8");

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

export interface CharacterClasses {
  lower: boolean;
  upper: boolean;
  digit: boolean;
  symbol: boolean;
}

export function characterClasses(password: string): CharacterClasses {
  return {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

const classCount = (password: string): number =>
  Object.values(characterClasses(password)).filter(Boolean).length;

const hasRun = (password: string): boolean => /(.)\1{2,}/.test(password);

function hasSequence(password: string): boolean {
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

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
  "@": "a", "$": "s", "!": "i", "+": "t",
};

const leet = (value: string): string => value.replace(/[0134578@$!+]/g, (c) => LEET[c] || c);

const stripSeparators = (value: string): string => value.replace(/[\s._\-]/g, "");

const stripEdges = (value: string): string => value.replace(/^[^a-z]+/, "").replace(/[^a-z]+$/, "");

function normalisedCandidates(password: string): Set<string> {
  const lower = password.toLowerCase();
  const bases = [lower, stripSeparators(lower)];
  const out = new Set<string>();

  for (const base of bases) {
    out.add(base);
    const trimmed = stripEdges(base);
    out.add(trimmed);
    out.add(leet(base));
    out.add(stripEdges(leet(base)));
    out.add(leet(trimmed));
  }

  out.delete("");
  return out;
}

function isCommon(password: string): boolean {
  for (const candidate of normalisedCandidates(password)) {
    if (COMMON_PASSWORDS.has(candidate)) return true;
  }
  return false;
}

export interface PasswordContext {
  name?: string;
  email?: string;
}

function containsPersonalInfo(password: string, { name = "", email = "" }: PasswordContext = {}): boolean {
  const haystack = password.toLowerCase();
  const fragments = [
    ...String(name).split(/\s+/),
    String(email).split("@")[0] || "",
  ]
    .map((f) => f.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((f) => f.length >= 4);

  return fragments.some((f) => haystack.includes(f));
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function passwordRequirements(password: string = "", context: PasswordContext = {}): PasswordRequirement[] {
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

export function passwordIssues(password: string = "", context: PasswordContext = {}): string[] {
  const issues: string[] = [];

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

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const;

export interface PasswordStrengthResult {
  score: number;
  label: string;
  percent: number;
}

export function passwordStrength(password: string = "", context: PasswordContext = {}): PasswordStrengthResult {
  if (!password) return { score: 0, label: "", percent: 0 };

  let score = 0;
  if (password.length >= PASSWORD_MIN) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const classes = classCount(password);
  if (classes >= 3) score += 1;
  if (classes === 4) score += 1;

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

export function refinePassword<T extends z.ZodTypeAny>(schema: T, { field = "password" } = {}): z.ZodEffects<T> {
  return schema.superRefine((data: any, ctx: z.RefinementCtx) => { // TODO(types): Sibling fields inference on dynamic zod schema
    const issues = passwordIssues(data?.[field] ?? "", {
      name: data?.name ?? "",
      email: data?.email ?? "",
    });

    if (issues.length > 0) {
      ctx.addIssue({ code: "custom", path: [field], message: issues[0] });
    }
  });
}
