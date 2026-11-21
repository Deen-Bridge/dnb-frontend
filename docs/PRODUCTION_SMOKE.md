# Production release smoke contract (#700)

The production smoke project is a small, non-mutating Playwright contract for
the journeys that must remain usable after a release. It runs against a
deployed-like URL and does not intercept application requests or invent API
responses. Authenticated journeys use a dedicated staging account supplied as
an external Playwright storage state; credentials and tokens are never stored
in this repository.

## Journeys and policy

| Journey | Default path | Owner | Blocking policy |
| --- | --- | --- | --- |
| Signup and Google login entry points | `/en/signup`, `/en/login` | Release engineering | Block release on HTTP 5xx or an application error |
| Course browse and resume | `/en/dashboard/courses` | Learning team | Block release with `SMOKE_STORAGE_STATE` |
| Scholarship state | `/en/dashboard/scholarships` | Learning team | Block release with `SMOKE_STORAGE_STATE` |
| Video-call authorization | `/en/dashboard/spaces` | Community team | Block release with `SMOKE_STORAGE_STATE` |
| Safe payment/donation preview | `/en/dashboard/sadaqah` | Payments team | Block release with `SMOKE_STORAGE_STATE`; the suite never submits payment |

Paths can be replaced with stable staging fixtures using `SMOKE_*_PATH`
variables. The authenticated paths must use a staging account whose data is
safe to reset and contains at least one resumable course, scholarship state,
authorized call room, and payment preview configuration.

## Running a release candidate

```bash
SMOKE_BASE_URL=https://staging.example.com \
SMOKE_STORAGE_STATE=/secure/ci/staging-user.json \
npm run test:e2e:smoke
```

The Playwright configuration retains traces and screenshots for failures.
Each test attaches only the target origin, journey, path, environment label,
and whether storage state was supplied. Request or correlation IDs are added
as annotations when the deployed service returns them. Secrets, cookies, and
response bodies are not attached.

## Test-data reset

Reset the dedicated staging account through the backend's approved seed/reset
job before each release-candidate run. Do not reset production data. The reset
must restore the fixture user, one resumable course, one scholarship record,
one authorized call room, and a donation preview with no submitted payment.

The smoke suite is read-only by design; payment, account creation, and Google
authentication are represented by their production entry points and are not
submitted by automation.
