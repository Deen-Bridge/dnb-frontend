# Profile navigation and content states

## Navigation

Authenticated users can open their profile from the dashboard user menu on both
desktop and mobile. The menu uses the authenticated user when available and
falls back to the menu's supplied user record, so a profile link is not built
with an undefined identifier while authentication is still hydrating.

## Profile collections

Profile tabs treat a valid empty API response as an empty state. Collection
responses may be returned as a direct array or an envelope such as `books`,
`spaces`, `followers`, `following`, or `items`; the UI normalizes those shapes
before rendering. Tab effects depend on both authentication readiness and the
profile identifier, so navigating between profiles does not leave stale content
visible or leave a tab in an indefinite loading state.
