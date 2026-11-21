# Web quality budgets and route matrix

CI checks the production build and the route matrix below. The budget check is
deliberately based on emitted assets, so it is reproducible without a browser
or a network-dependent performance score. Lighthouse and browser tests provide
the runtime LCP/CLS/interaction evidence in their existing jobs.

| Surface | Initial JavaScript | Largest emitted chunk |
| --- | ---: | ---: |
| Public/authenticated web | 25 MiB total | 1.5 MiB |

The accessibility route matrix covers public, authentication, dashboard,
admin, error, RTL, loading, empty, modal, form, and media states. A route may
require an authenticated test fixture; it must not be silently omitted.
Exceptions belong in the pull request with an owner and expiry date.
