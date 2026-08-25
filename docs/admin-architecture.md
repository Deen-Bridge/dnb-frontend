# Admin section architecture

This document is for contributors picking up their **first admin issue** in the
DeenBridge frontend. It maps out where the admin section lives (or will live),
how access control applies, which shared primitives to build pages from, and
what the backend contract looks like.

> **Status: planned, not yet shipped.** There is no `app/[locale]/admin/`
> directory on this branch yet — the admin area is being built across a series
> of parallel issues. Everything below describes the *planned* architecture and
> the conventions you should follow so your page lands consistently. Anything
> not built yet is tracked in [Known gaps](#known-gaps); if a file or route
> referenced here doesn't exist when you start, that's expected, not a bug.

## Route map

Admin routes will live under their own segment, parallel to the existing
sections (`dashboard`, `account`, …):

```
app/[locale]/
├── (pages)/                  # public marketing pages
├── account/                  # authenticated user settings
├── dashboard/                # educator/student workspace
│   └── unauthorized/         # RoleGuard redirect target (exists today)
├── admin/                    # ← planned admin section
│   ├── layout.jsx            # shell: sidebar/nav + <AdminGuard>
│   ├── page.jsx              # overview / metrics home
│   ├── users/                # user lookup & moderation
│   ├── educators/            # verification queue (dnb-backend#92)
│   └── content/              # courses / books / spaces review
├── transparency/
├── verify-email/
└── offline/
```

Conventions:

- One folder per admin domain, one `page.jsx` per screen — same as every other
  section under `app/[locale]/`.
- The admin `layout.jsx` owns authentication + role gating **once**, so
  individual pages don't repeat it (see [RBAC model](#rbac-model)).
- All user-facing strings go through next-intl message files (`messages/`) like
  every other section; see [`docs/i18n-rtl`](i18n-rtl/) for RTL examples.
- Screens are client components composed from `components/ui` primitives;
  server components only for static shells/metadata.

![Planned admin overview](screenshots/dashboard.png)

*(Screenshot slot — replace once an admin overview exists. For now this shows
the existing dashboard shell whose layout conventions the admin shell follows:
sidebar navigation, `PageHeader`, card grid.)*

## RBAC model

The full capability system is documented in
[`docs/rbac.md`](rbac.md) — read that first; this section only covers what's
specific to admin pages.

- Roles come from [`lib/auth/roles.js`](../lib/auth/roles.js):
  `student`, `educator`, `admin`. `normalizeRole()` tolerates casing and common
  synonyms before any decision.
- `can(action, user)` is **fail-closed and synchronous**; the React hook
  `useCan()` also fails closed while auth is still loading.
- **Admin is a superuser**: `can()` short-circuits to allowed for admins and
  skips the educator-verification gate.
- Client checks are **defense-in-depth only** — the real boundary is the
  backend. An admin UI must never be the thing standing between a user and
  destructive data; assume every request can be replayed by anyone with curl.

How admin routes gate access:

```jsx
// app/[locale]/admin/layout.jsx (planned)
import { ProtectedRoute } from "@/hooks/protected-route";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/lib/auth/roles";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <RoleGuard role={ROLES.ADMIN}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
```

- Wrong role → redirect to `/dashboard/unauthorized` (existing behavior).
- Gating happens in the layout so deep links to any admin child route are
  covered by default — a new admin page should need **no** guard code of its
  own unless it needs a *narrower* rule than the whole section.

## Shared primitives inventory

Build admin screens exclusively from these existing pieces instead of ad-hoc
markup. Everything below is a real file in [`components/ui/`](../components/ui/)
today.

| Concern | Primitive(s) |
| --- | --- |
| Page frame | `page-shell.jsx` (`PageShell`), `page-header.jsx` (`PageHeader`: icon/title/subtitle/actions), `page-shell.jsx` spacing tokens |
| Layout & nav | `sidebar.jsx`, `breadcrumb.jsx`, `navigation-menu.jsx`, `separator.jsx`, `resizable.jsx`, `scroll-area.jsx` |
| Data display | `table.jsx`, `card.jsx`, `card-grid.jsx`, `badge.jsx`, `avatar.jsx`, `chart.jsx`, `empty-state.jsx`, `skeleton.jsx`, `pagination.jsx` |
| Forms | `form.jsx`, `input.jsx`, `textarea.jsx`, `select.jsx`, `checkbox.jsx`, `radio-group.jsx`, `switch.jsx`, `slider.jsx`, `input-otp.jsx`, `calendar.jsx`, `label.jsx` |
| Overlays | `dialog.jsx`, `alert-dialog.jsx` (confirmations/destructive actions), `sheet.jsx`, `drawer.jsx`, `popover.jsx`, `hover-card.jsx`, `tooltip.jsx`, `command.jsx` |
| Menus & toggles | `dropdown-menu.jsx`, `context-menu.jsx`, `menubar.jsx`, `tabs.jsx`, `accordion.jsx`, `collapsible.jsx`, `toggle.jsx`, `toggle-group.jsx` |
| Feedback | `alert.jsx`, `sonner.jsx` (toasts), `progress.jsx`, `carousel.jsx`, `aspect-ratio.jsx`, `marquee.jsx` |
| Theming | `theme-toggle.jsx` |

Auth/gating pieces outside `components/ui`:

| Concern | Where |
| --- | --- |
| Role/capability decisions | [`lib/auth/roles.js`](../lib/auth/roles.js), [`hooks/useCan.js`](../hooks/useCan.js) |
| Guards | [`components/auth/RoleGuard.jsx`](../components/auth/RoleGuard.jsx), [`components/auth/VerificationRequired.jsx`](../components/auth/VerificationRequired.jsx) |

Accessibility rules apply fully: run `npm run a11y` mentally as you write —
labeled form controls, `aria-label`s on icon-only buttons, real `<button>`s,
single `h1` per page. See [`docs/accessibility.md`](accessibility.md).

## API contract assumptions

The admin UI consumes backend endpoints that are owned by dnb-backend issues.
Until each endpoint ships, treat these assumptions as the working contract and
code defensively against them:

| Assumption | Detail |
| --- | --- |
| Role comes on the user record | `user.role` is a string normalized by `normalizeRole()`; synonyms (`instructor`, `mentor`, `teacher`, `learner`) may arrive until backend canonicalization lands. |
| Verification signal field name is tolerant | Accepts `isVerified` / `educatorVerified` / `isEducatorVerified` booleans or `verificationStatus === "verified"` — mirror this tolerance if you read it anywhere new (canonical shape: `dnb-backend#92`). |
| Authorization is enforced server-side | Never trust a `200` because the UI allowed the click; handle `401`/`403` gracefully (`Unauthorized` screen or toast) rather than assuming success. |
| List endpoints paginate | Assume paginated responses for user/content lists; use the `table.jsx` + `pagination.jsx` pair and render loading via `skeleton.jsx`. |
| Destructive actions confirm twice | Wrap irreversible moderation actions in `alert-dialog.jsx`; the backend does not soft-delete on our behalf unless documented otherwise. |
| Errors fail closed | Unknown shape, missing field, or network error → deny/hide the affordance, never default to showing privileged controls. |

When an endpoint differs from these assumptions, fix this table in the same PR
that adapts the code — the contract lives here, not in tribal memory.

## How-to: add a new admin page

Checklist for adding e.g. `admin/reports`. Follow top to bottom; each step
links to the convention behind it.

1. [ ] **Confirm scope** — the page belongs in the admin section (staff-only
       operation), not the dashboard or account area. If educators use it too,
       it probably belongs under `dashboard/` with a capability gate instead.
2. [ ] **Create the route folder** — `app/[locale]/admin/<name>/page.jsx`.
       No guard code needed in the page; the section layout covers auth+role.
3. [ ] **Add i18n messages** — all strings into the relevant `messages/*.json`
       files; no hardcoded English in JSX. Keep keys namespaced per page
       (`admin.reports.*`). Remember RTL-safe layouts (logical properties).
4. [ ] **Compose from primitives** — `PageShell` → `PageHeader` → content in
       `Card`/`Table`. Empty data renders `EmptyState`, loading renders
       `Skeleton`. Do not hand-roll buttons, dialogs, or tables.
5. [ ] **Wire data defensively** — per the API contract assumptions above:
       pagination, graceful `403`, fail-closed rendering while auth loads.
6. [ ] **Gate affordances, not just routes** — if individual actions within
       the page vary by role, hide them with `useCan(CAPABILITIES.…)` so the
       UI never offers what the server would reject.
7. [ ] **Destructive action?** — confirm via `AlertDialog`, then toast the
       result (`sonner.jsx`).
8. [ ] **Accessibility pass** — labeled inputs, `aria-label` on icon-only
       buttons, one `h1`, keyboard-operable everything (`npm run a11y` clean).
9. [ ] **Tests** — add unit tests under `__tests__/` mirroring the RBAC test
       style (per-role matrix for anything permission-dependent).
10. [ ] **Screenshot** — drop a capture in `docs/screenshots/` and link it
        here in this document's route map or your PR description.
11. [ ] **Update docs** — new route added to the route map above; any new
        backend assumption added to the contract table; known gap closed?
        Update [Known gaps](#known-gaps).

## Known gaps

Nothing in the admin section is shipped yet. This table links each gap to the
issue that owns it — check there before filing "missing" bugs.

| Gap | Impact | Tracked in |
| --- | --- | --- |
| Team management page (admin members, invitations, role assignment) | No staff-management surface; roles must be edited directly in the backend DB | [#315 team management page](https://github.com/Deen-Bridge/dnb-frontend/issues/315) |
| Step-up authentication for sensitive admin actions | High-risk operations (role changes, deletions) currently rely on session auth alone; re-auth challenge pattern not yet implemented | [#311 step-up pattern](https://github.com/Deen-Bridge/dnb-frontend/issues/311) |
| README / contributor onboarding not updated for admin work | First-time contributors lack a top-level pointer to this document | [#343 README updates](https://github.com/Deen-Bridge/dnb-frontend/issues/343) |
| No `app/[locale]/admin/` routes exist | Every route in the map above is planned; building them is spread across parallel issues | (this epic — link the specific page issue in your PR) |
| Admin-specific capabilities absent from `CAPABILITIES` map | Fine-grained admin actions (e.g. `user:ban`) not modeled yet; admin is treated as unconditional superuser | (to be filed alongside first capability-gated admin feature) |

## Questions?

If this document contradicts the code, the code wins — but please open an
issue or PR fixing the doc so the next contributor isn't misled.
