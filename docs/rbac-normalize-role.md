# RBAC Model & `normalizeRole` Usage (`lib/auth/roles.ts`)

## Canonical Roles
- `student` (default unprivileged learner role)
- `educator` (canonical role for instructors; legacy `mentor` aliases normalize to `educator`)
- `moderator` (content & flag review capabilities)
- `admin` / `super_admin` (platform administration and treasury oversight)

## Why `normalizeRole` Is Required
Backend payloads or historical records may emit `"mentor"`, `"EDUCATOR"`, or mixed-case role strings. Always pass raw role strings through `normalizeRole(rawRole)` before comparing against `ROLES` or evaluating `CAPABILITIES`.

## Verification Gate (`isVerified`)
Educator publishing and payout actions require both `normalizeRole(user.role) === ROLES.EDUCATOR` and `isVerified(user) === true`.
