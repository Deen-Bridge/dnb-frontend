import { User } from "@/types/api";

export const ROLES = Object.freeze({
  STUDENT: "student",
  EDUCATOR: "educator",
  ADMIN: "admin",
} as const);

export type Role = typeof ROLES[keyof typeof ROLES];

export const CAPABILITIES = Object.freeze({
  COURSE_CREATE: "course:create",
  COURSE_EDIT: "course:edit",
  BOOK_CREATE: "book:create",
  SPACE_CREATE: "space:create",
} as const);

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = Object.freeze({
  [ROLES.STUDENT]: Object.freeze([]),
  [ROLES.EDUCATOR]: Object.freeze([
    CAPABILITIES.COURSE_CREATE,
    CAPABILITIES.COURSE_EDIT,
    CAPABILITIES.BOOK_CREATE,
    CAPABILITIES.SPACE_CREATE,
  ]),
  [ROLES.ADMIN]: Object.freeze(Object.values(CAPABILITIES)),
});

const VERIFICATION_REQUIRED: ReadonlySet<Capability> = Object.freeze(
  new Set([
    CAPABILITIES.COURSE_CREATE,
    CAPABILITIES.COURSE_EDIT,
    CAPABILITIES.BOOK_CREATE,
    CAPABILITIES.SPACE_CREATE,
  ])
);

export function normalizeRole(role: unknown): Role | null {
  if (typeof role !== "string") return null;
  const r = role.trim().toLowerCase();
  if (r === ROLES.STUDENT || r === "learner") return ROLES.STUDENT;
  if (r === ROLES.EDUCATOR || r === "instructor" || r === "mentor" || r === "teacher") {
    return ROLES.EDUCATOR;
  }
  if (r === ROLES.ADMIN) return ROLES.ADMIN;
  return null;
}

export function isVerified(user?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): User object with potential verification flags
  if (!user || typeof user !== "object") return false;
  if ((user as any).isVerified === true) return true; // TODO(types): Verification flag variations
  if ((user as any).educatorVerified === true) return true; // TODO(types): Verification flag variations
  if ((user as any).isEducatorVerified === true) return true; // TODO(types): Verification flag variations
  if (
    typeof (user as any).verificationStatus === "string" && // TODO(types): Verification flag variations
    (user as any).verificationStatus.trim().toLowerCase() === "verified" // TODO(types): Verification flag variations
  ) {
    return true;
  }
  return false;
}

export function requiresVerification(action: Capability | string): boolean {
  return VERIFICATION_REQUIRED.has(action as Capability);
}

export function roleAllows(user?: Partial<User> | Record<string, any> | null, action?: Capability | string): boolean { // TODO(types): User object
  if (!user || !action) return false;
  const role = normalizeRole((user as any).role); // TODO(types): Role property on user
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;
  return (ROLE_CAPABILITIES[role] || []).includes(action as Capability);
}

export function can(action?: Capability | string, user?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): User object
  if (!action || !user || typeof user !== "object") return false;

  const role = normalizeRole((user as any).role); // TODO(types): Role property on user
  if (!role) return false;

  if (role === ROLES.ADMIN) return true;

  const allowed = ROLE_CAPABILITIES[role] || [];
  if (!allowed.includes(action as Capability)) return false;

  if (requiresVerification(action) && !isVerified(user)) return false;

  return true;
}
