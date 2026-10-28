/**
 * lib/auth/roles — table-driven coverage of the RBAC helpers.
 * Covers normalizeRole (full alias matrix), isVerified, requiresVerification,
 * roleAllows and can, including undefined / null / unknown-role edge inputs.
 * Pure functions only: no network, no mocks required.
 */
import { describe, it, expect } from "vitest";
import {
  ROLES,
  CAPABILITIES,
  normalizeRole,
  isVerified,
  requiresVerification,
  roleAllows,
  can,
} from "@/lib/auth/roles";

// Several cases below deliberately pass malformed input, so they cast to the
// real parameter types instead of widening to `any`.
type IsVerifiedArg = Parameters<typeof isVerified>[0];
type RoleAllowsUser = Parameters<typeof roleAllows>[0];
type CanAction = Parameters<typeof can>[0];
type CanUser = Parameters<typeof can>[1];

const ALL_CAPS = Object.values(CAPABILITIES);
const VERIFIED_CAPS = [
  CAPABILITIES.COURSE_CREATE,
  CAPABILITIES.COURSE_EDIT,
  CAPABILITIES.BOOK_CREATE,
  CAPABILITIES.SPACE_CREATE,
];

describe("ROLES / CAPABILITIES constants", () => {
  it("are frozen with the expected values", () => {
    expect(Object.isFrozen(ROLES)).toBe(true);
    expect(Object.isFrozen(CAPABILITIES)).toBe(true);
    expect(ROLES).toEqual({ STUDENT: "student", EDUCATOR: "educator", ADMIN: "admin" });
    expect(ALL_CAPS).toEqual(["course:create", "course:edit", "book:create", "space:create"]);
  });
});

describe("normalizeRole", () => {
  it.each([
    ["student", ROLES.STUDENT],
    ["learner", ROLES.STUDENT],
    ["educator", ROLES.EDUCATOR],
    ["instructor", ROLES.EDUCATOR],
    ["mentor", ROLES.EDUCATOR],
    ["teacher", ROLES.EDUCATOR],
    ["admin", ROLES.ADMIN],
  ])("maps %j to %j", (input, expected) => {
    expect(normalizeRole(input)).toBe(expected);
  });

  it.each([
    ["  Mentor  ", ROLES.EDUCATOR],
    ["TEACHER", ROLES.EDUCATOR],
    ["Learner", ROLES.STUDENT],
    [" ADMIN", ROLES.ADMIN],
  ])("trims and lowercases %j", (input, expected) => {
    expect(normalizeRole(input)).toBe(expected);
  });

  it.each([
    ["unknown string", "superuser"],
    ["empty string", ""],
    ["whitespace only", "   "],
    ["partial alias", "educ"],
    ["role with suffix", "admin2"],
  ])("returns null for %s (%j)", (_label, input) => {
    expect(normalizeRole(input)).toBeNull();
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["number", 42],
    ["boolean", true],
    ["object", { role: "admin" }],
    ["array", ["admin"]],
  ])("returns null for non-string input: %s", (_label, input) => {
    expect(normalizeRole(input)).toBeNull();
  });
});

describe("isVerified", () => {
  it.each([
    ["isVerified: true", { isVerified: true }],
    ["educatorVerified: true", { educatorVerified: true }],
    ["isEducatorVerified: true", { isEducatorVerified: true }],
    ["verificationStatus: 'verified'", { verificationStatus: "verified" }],
    ["verificationStatus: ' VERIFIED '", { verificationStatus: " VERIFIED " }],
  ])("is true when %s", (_label, user) => {
    expect(isVerified(user)).toBe(true);
  });

  it.each([
    ["isVerified: 'true' (string, not boolean)", { isVerified: "true" }],
    ["isVerified: false", { isVerified: false }],
    ["verificationStatus: 'pending'", { verificationStatus: "pending" }],
    ["verificationStatus: 'verified-ish'", { verificationStatus: "verified-ish" }],
    ["verificationStatus: non-string", { verificationStatus: true }],
    ["empty object", {}],
    ["role only", { role: "educator" }],
  ])("is false when %s", (_label, user) => {
    expect(isVerified(user)).toBe(false);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["string", "verified"],
    ["number", 1],
  ])("is false for %s input", (_label, input) => {
    expect(isVerified(input as unknown as IsVerifiedArg)).toBe(false);
  });
});

describe("requiresVerification", () => {
  it.each(VERIFIED_CAPS)("is true for %s", (cap) => {
    expect(requiresVerification(cap)).toBe(true);
  });

  it.each([
    ["unknown capability", "course:publish"],
    ["empty string", ""],
    ["case-mismatched capability", "COURSE:CREATE"],
  ])("is false for %s", (_label, action) => {
    expect(requiresVerification(action)).toBe(false);
  });
});

describe("roleAllows", () => {
  it.each(VERIFIED_CAPS)("lets an educator perform %s without verification", (cap) => {
    expect(roleAllows({ role: "educator" }, cap)).toBe(true);
  });

  it.each(ALL_CAPS)("lets an admin perform %s", (cap) => {
    expect(roleAllows({ role: "admin" }, cap)).toBe(true);
  });

  it.each(ALL_CAPS)("denies a student %s", (cap) => {
    expect(roleAllows({ role: "student" }, cap)).toBe(false);
  });

  it("applies role aliases (mentor -> educator)", () => {
    expect(roleAllows({ role: "mentor" }, CAPABILITIES.COURSE_EDIT)).toBe(true);
    expect(roleAllows({ role: "learner" }, CAPABILITIES.COURSE_EDIT)).toBe(false);
  });

  it("lets an admin pass any truthy action, even unknown ones", () => {
    expect(roleAllows({ role: "admin" }, "anything:goes")).toBe(true);
  });

  it("denies an educator an unknown capability", () => {
    expect(roleAllows({ role: "educator" }, "course:publish")).toBe(false);
  });

  it.each([
    ["undefined user", undefined],
    ["null user", null],
    ["missing role", {}],
    ["unknown role", { role: "superuser" }],
    ["non-string role", { role: 1 }],
  ])("denies with %s", (_label, user) => {
    expect(roleAllows(user as unknown as RoleAllowsUser, CAPABILITIES.COURSE_CREATE)).toBe(false);
  });

  it.each([
    ["undefined action", undefined],
    ["empty action", ""],
  ])("denies an admin with %s", (_label, action) => {
    expect(roleAllows({ role: "admin" }, action)).toBe(false);
  });

  it("does not check verification (unverified educator is allowed)", () => {
    expect(roleAllows({ role: "educator", isVerified: false }, CAPABILITIES.COURSE_CREATE)).toBe(
      true
    );
  });
});

describe("can", () => {
  it("denies a student every capability", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, { role: "student", isVerified: true })).toBe(false);
    }
  });

  it("denies an unverified educator the verification-gated capabilities", () => {
    for (const cap of VERIFIED_CAPS) {
      expect(can(cap, { role: "educator" })).toBe(false);
    }
  });

  it("allows a verified educator the verification-gated capabilities", () => {
    for (const cap of VERIFIED_CAPS) {
      expect(can(cap, { role: "educator", isVerified: true })).toBe(true);
    }
  });

  it("accepts the verification flag variants", () => {
    expect(can(CAPABILITIES.BOOK_CREATE, { role: "educator", educatorVerified: true })).toBe(true);
    expect(can(CAPABILITIES.SPACE_CREATE, { role: "mentor", verificationStatus: "Verified" })).toBe(
      true
    );
  });

  it("lets an admin do everything without verification", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, { role: "admin" })).toBe(true);
    }
  });

  it("lets an admin pass an unknown action (no action allowlist applied)", () => {
    expect(can("unknown:action", { role: "admin" })).toBe(true);
  });

  it("denies an educator an unknown action", () => {
    expect(can("unknown:action", { role: "educator", isVerified: true })).toBe(false);
  });

  it.each([
    ["undefined action", undefined, { role: "admin" }],
    ["empty action", "", { role: "admin" }],
    ["undefined user", CAPABILITIES.COURSE_CREATE, undefined],
    ["null user", CAPABILITIES.COURSE_CREATE, null],
    ["string user", CAPABILITIES.COURSE_CREATE, "educator"],
    ["user with no role", CAPABILITIES.COURSE_CREATE, { isVerified: true }],
    ["user with unknown role", CAPABILITIES.COURSE_CREATE, { role: "superuser", isVerified: true }],
  ])("denies with %s", (_label, action, user) => {
    expect(can(action as unknown as CanAction, user as unknown as CanUser)).toBe(false);
  });
});
