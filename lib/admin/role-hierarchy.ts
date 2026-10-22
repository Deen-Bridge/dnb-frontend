const RANK: Record<string, number> = { student: 0, user: 0, educator: 1, mentor: 1, admin: 2, superadmin: 3 };

export function roleRank(role?: string | null): number {
  return RANK[String(role || "student").toLowerCase()] ?? 0;
}

/** Client-side guard only; the backend has the final word. */
export function canModerateUser(actorRole?: string | null, targetRole?: string | null): boolean {
  return roleRank(actorRole) > roleRank(targetRole);
}
