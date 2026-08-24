# Frontend RBAC (capability gating)

This document describes the client-side role-based access control (RBAC) layer:
a `can(action)` capability helper, route guards, and verified-educator gating.

> **Defense-in-depth only.** The real authorization boundary is the backend
> (role/ownership enforcement in `dnb-backend#88`, educator verification in
> `dnb-backend#92`). Nothing on the client is a security control on its own —
> its job is to stop the UI from *offering* actions the server will reject, so a
> logged-in student never sees, or can navigate into, instructor-only surfaces.

## Pieces

| Concern | Where |
| --- | --- |
| Roles, capabilities, `can()`, `isVerified()` | [`lib/auth/roles.js`](../lib/auth/roles.js) |
| Capability hook bound to the user (`useCan`) | [`hooks/useCan.js`](../hooks/useCan.js) |
| Route guard (composes over `ProtectedRoute`) | [`components/auth/RoleGuard.jsx`](../components/auth/RoleGuard.jsx) |
| Unauthorized screen | [`components/molecules/errors/Unauthorized.jsx`](../components/molecules/errors/Unauthorized.jsx) + [`app/dashboard/unauthorized/`](../app/dashboard/unauthorized/) |
| Verify-required prompt | [`components/auth/VerificationRequired.jsx`](../components/auth/VerificationRequired.jsx) |
| Trust badge | [`components/atoms/VerifiedBadge.jsx`](../components/atoms/VerifiedBadge.jsx) |

## Roles and capabilities

Roles: `student`, `educator`, `admin` (`lib/auth/roles.js` also normalises the
synonyms `instructor`/`mentor`/`teacher` → educator, `learner` → student).

Capabilities are `resource:action` strings:

- `course:create`, `course:edit`
- `book:create`
- `space:create`

Decision rules (`can(action, user)`):

- **Admin** is a superuser — allowed everything, no verification needed.
- **Educator** may hold the content-creation capabilities, but every one of them
  is **verification-gated**: an educator who has not completed verification is
  denied until they do.
- **Student** holds no mutating capability.
- **Fail closed**: unknown user, unknown role, or unknown action → denied.

`can()` is pure and synchronous — it reads only the passed `user` object, so it
is trivially unit-testable per role. The verification signal is read from the
user object (`isVerified` / `educatorVerified` / `isEducatorVerified`, or
`verificationStatus === "verified"`) since `dnb-backend#92` owns the canonical
field shape.

## Usage

Gate an affordance (hides it for students and unverified educators):

```jsx
import { useCan } from "@/hooks/useCan";
import { CAPABILITIES } from "@/lib/auth/roles";

const { can } = useCan();
{can(CAPABILITIES.COURSE_CREATE) && <CreateCourseButton />}
```

`useCan` **fails closed while auth is loading** — every check returns `false`
until the user is known, so no instructor affordance flashes before auth
resolves.

Gate a route/segment:

```jsx
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CAPABILITIES } from "@/lib/auth/roles";

export default function CreateCoursePage() {
  return (
    <RoleGuard capability={CAPABILITIES.COURSE_CREATE}>
      <CourseWizard />
    </RoleGuard>
  );
}
```

Outcomes for a gated capability:

- allowed → renders children
- right role, not yet verified → `VerificationRequired` prompt (recoverable;
  links to `/account/verification`)
- wrong role (e.g. student) → redirect to `/dashboard/unauthorized`

`RoleGuard` composes over `ProtectedRoute`, so authentication (redirect to
`/login`, loader while auth resolves) is handled first, then the
role/verification check runs.

## Gated surfaces

Route guards: `app/dashboard/courses/create`, `app/dashboard/courses/edit/[courseId]`.

Affordances hidden via `useCan`: the Create buttons on the courses, library, and
spaces pages, and the "Create Course" quick action in the command palette.

Trust badge (`VerifiedBadge`) renders only when the subject is a verified
educator — shown on the account profile and on user cards.

## Tests

`__tests__/auth/` — `can()` per-role matrix, `useCan` fail-closed, `RoleGuard`
outcomes (redirect / verify-prompt / children / no-flash-while-loading), and
`VerifiedBadge` visibility. Run with `npm test`.
