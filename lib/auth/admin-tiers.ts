import { ROLES, normalizeRole } from "@/lib/auth/roles";
import { User } from "@/types/api";

export const TIERS = Object.freeze({
  STAFF: "staff",
  SUPER_ADMIN: "super_admin",
} as const);

export type AdminTier = typeof TIERS[keyof typeof TIERS];

export function normalizeTier(tier: unknown): AdminTier | null {
  if (typeof tier !== "string") return null;
  const t = tier.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (t === TIERS.STAFF) return TIERS.STAFF;
  if (t === TIERS.SUPER_ADMIN || t === "superadmin" || t === "owner") {
    return TIERS.SUPER_ADMIN;
  }
  return null;
}

export function getAdminTier(user?: Partial<User> | Record<string, any> | null): AdminTier { // TODO(types): Partial user payload with potential tier fields
  if (!user || typeof user !== "object") return TIERS.STAFF;

  const explicit = normalizeTier((user as any).tier) || normalizeTier((user as any).adminTier); // TODO(types): Dynamic admin tier field variations
  if (explicit) return explicit;

  const viaRole = normalizeTier((user as any).role); // TODO(types): Role field on user
  if (viaRole) return viaRole;

  return TIERS.STAFF;
}

export function isSuperAdmin(user?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): User payload
  if (!user || typeof user !== "object") return false;
  const role = normalizeRole((user as any).role); // TODO(types): Role field on user
  if (role !== ROLES.ADMIN) return false;
  return getAdminTier(user) === TIERS.SUPER_ADMIN;
}

export function canManageTeam(user?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): User payload
  return isSuperAdmin(user);
}

export function canDemoteAdmin(actor?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): Actor user payload
  return canManageTeam(actor);
}

export function canRevokeAdmin(actor?: Partial<User> | Record<string, any> | null): boolean { // TODO(types): Actor user payload
  return canManageTeam(actor);
}
