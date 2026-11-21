# Profile content states

Issue [#740](https://github.com/Deen-Bridge/dnb-frontend/issues/740) requires
profile tabs to distinguish loading, unavailable, failed, and authoritative
empty results. `ProfileContent` now clears tab data when `profileId` changes,
includes that dependency in the courses/spaces effects, and ignores late
responses from the previous profile.

Successful empty responses render a truthful, accessible status message rather
than a placeholder claiming the feature is unfinished. Missing profile context
renders an unavailable state, while request failures continue to use the retry
error component. The API response remains the source of truth for whether a
profile has courses, books, spaces, followers, or following entries.
