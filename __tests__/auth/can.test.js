/**
 * lib/auth/roles — `can()` capability matrix.
 * -------------------------------------------
 * Exhaustive per-role matrix: student, educator (unverified), verified
 * educator, admin — across every capability. Also covers fail-closed behaviour
 * for missing/unknown input and the tolerant `isVerified` / `normalizeRole`
 * rules.
 */
import { describe, it, expect } from "vitest";
import {
  can,
  isVerified,
  normalizeRole,
  roleAllows,
  requiresVerification,
  ROLES,
  CAPABILITIES,
} from "@/lib/auth/roles";

const ALL_CAPS = Object.values(CAPABILITIES);

const student = { role: "student" };
const educator = { role: "educator" }; // unverified
const verifiedEducator = { role: "educator", isVerified: true };
const admin = { role: "admin" };

describe("can() — student", () => {
  it("denies every mutating capability", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, student)).toBe(false);
    }
  });
});

describe("can() — unverified educator", () => {
  it("is denied all creation/edit capabilities until verified", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, educator)).toBe(false);
    }
  });
});

describe("can() — verified educator", () => {
  it("is granted every creation/edit capability", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, verifiedEducator)).toBe(true);
    }
  });
});

describe("can() — admin", () => {
  it("is granted everything, no verification needed", () => {
    for (const cap of ALL_CAPS) {
      expect(can(cap, admin)).toBe(true);
    }
  });
});

describe("can() — fail closed", () => {
  it("denies for null/undefined user", () => {
    expect(can(CAPABILITIES.COURSE_CREATE, null)).toBe(false);
    expect(can(CAPABILITIES.COURSE_CREATE, undefined)).toBe(false);
  });

  it("denies for a user with no/unknown role", () => {
    expect(can(CAPABILITIES.COURSE_CREATE, {})).toBe(false);
    expect(can(CAPABILITIES.COURSE_CREATE, { role: "wizard" })).toBe(false);
  });

  it("denies for a missing/unknown action", () => {
    expect(can(undefined, verifiedEducator)).toBe(false);
    expect(can("course:teleport", verifiedEducator)).toBe(false);
  });
});

describe("isVerified() — tolerant field reading", () => {
  it("accepts several boolean flag names", () => {
    expect(isVerified({ isVerified: true })).toBe(true);
    expect(isVerified({ educatorVerified: true })).toBe(true);
    expect(isVerified({ isEducatorVerified: true })).toBe(true);
  });

  it("accepts a string status of 'verified' (case/space-insensitive)", () => {
    expect(isVerified({ verificationStatus: "verified" })).toBe(true);
    expect(isVerified({ verificationStatus: "  Verified " })).toBe(true);
  });

  it("returns false for non-verified statuses and empty input", () => {
    expect(isVerified({ verificationStatus: "pending" })).toBe(false);
    expect(isVerified({ isVerified: false })).toBe(false);
    expect(isVerified(null)).toBe(false);
    expect(isVerified({})).toBe(false);
  });
});

describe("normalizeRole() — synonyms and casing", () => {
  it("maps instructor/mentor/teacher to educator", () => {
    expect(normalizeRole("instructor")).toBe(ROLES.EDUCATOR);
    expect(normalizeRole("Mentor")).toBe(ROLES.EDUCATOR);
    expect(normalizeRole("TEACHER")).toBe(ROLES.EDUCATOR);
  });

  it("maps learner to student and trims/lowercases", () => {
    expect(normalizeRole("learner")).toBe(ROLES.STUDENT);
    expect(normalizeRole("  Admin ")).toBe(ROLES.ADMIN);
  });

  it("returns null for unknown/invalid roles", () => {
    expect(normalizeRole("wizard")).toBe(null);
    expect(normalizeRole(undefined)).toBe(null);
    expect(normalizeRole(42)).toBe(null);
  });
});

describe("roleAllows() vs can() — the verification gap", () => {
  it("an unverified educator's role permits create, but can() still denies it", () => {
    expect(roleAllows(educator, CAPABILITIES.COURSE_CREATE)).toBe(true);
    expect(can(CAPABILITIES.COURSE_CREATE, educator)).toBe(false);
  });

  it("a student's role does not permit create at all", () => {
    expect(roleAllows(student, CAPABILITIES.COURSE_CREATE)).toBe(false);
  });

  it("every mutating capability requires verification", () => {
    for (const cap of ALL_CAPS) {
      expect(requiresVerification(cap)).toBe(true);
    }
  });
});
