# Contributing to Deen Bridge

Thank you for your interest in contributing to Deen Bridge! We welcome contributions from the community to help make Islamic education more accessible.

## Drips Wave Program

This repository participates in the **Stellar Drips Wave** bounty program. Contributors can earn rewards by resolving issues during Wave cycles. Everyone is welcome to contribute — no religious background or knowledge is required; our issues are regular engineering tasks.

### How It Works

1. **Find an Issue**: During an active Wave, browse this repo's issues in the [Drips Wave app](https://www.drips.network/wave)
2. **Apply**: Apply to work on the issue through the Drips Wave app; the maintainer reviews applications and assigns one contributor
3. **Submit a PR**: Complete the work and open a pull request (base branch `dev`) before the Wave ends
4. **Earn Points**: Once the issue is marked resolved during the Wave, you earn its Points, which convert to rewards from the Wave pool

### Complexity & Points

Points are assigned per issue by the maintainer in the Drips Wave dashboard using Drips' three complexity tiers:

| Complexity | Points | Typical Scope                              |
|------------|--------|--------------------------------------------|
| Trivial    | 100    | Typos, small bug fixes, minor copy changes |
| Medium     | 150    | Standard features or involved bug fixes    |
| High       | 200    | Complex features, refactors, integrations  |

Issues carry `complexity:trivial`, `complexity:medium`, or `complexity:high` labels that mirror these tiers.

### Wave Rules

- One contributor per issue — apply through the Drips Wave app; the maintainer reviews all applications and selects who is assigned
- PRs must be linked to the issue
- **PRs must target the `dev` branch** (not `main`)
- Code must pass all tests and linting
- Follow the coding standards below

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Fork the repository
# Clone your fork
git clone git@github.com:YOUR_USERNAME/dnb-frontend.git
cd dnb-frontend

# Add upstream remote
git remote add upstream git@github.com:Deen-Bridge/dnb-frontend.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## Branching Strategy

| Branch | Purpose                                                        |
|--------|----------------------------------------------------------------|
| `main` | Stable, production-ready code — releases only                  |
| `dev`  | Active development — **all pull requests must target `dev`**   |

Maintainers periodically merge `dev` into `main` for releases. Pull requests opened against `main` will be asked to retarget `dev`.

### Making Changes

1. Create a branch from the latest `dev`:
   ```bash
   git fetch upstream
   git checkout -b feature/your-feature-name upstream/dev
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   npm run lint
   npm run build
   npm run test:e2e   # Run Playwright E2E tests (requires build first)
   ```

4. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add wallet connection status indicator"
   ```

5. Push and create a PR **with `dev` as the base branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Follow the existing file structure
- Use descriptive variable and function names
- Keep components focused and small

### Styling

- Use Tailwind CSS utility classes
- Follow existing color scheme and design patterns
- Ensure responsive design (mobile-first)

### Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Guidelines

1. **Base Branch**: open the PR against `dev`, never `main`
2. **Title**: Use conventional commit format
3. **Description**: Explain what and why
4. **Link Issue**: Reference the issue number (`Closes #123`)
5. **Screenshots**: Include for UI changes
6. **Testing**: Describe how you tested

## Issue Guidelines

### Reporting Bugs

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment info
- Screenshots if applicable

### Requesting Features

Include:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Mockups or examples (optional)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Contributors of all backgrounds and faiths are welcome

## Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Review the documentation

## Testing

### Unit & Component Tests

_Coming soon — see separate issue for Jest/RTL setup._

### End-to-End Tests (Playwright)

E2E tests live in the `e2e/` directory and use Playwright to exercise critical user journeys in a headless browser.

**What is covered:**

- **Authentication** (`e2e/auth.spec.js`): login form submission, redirect to dashboard, logged-out redirect to login, logout flow
- **Course browsing** (`e2e/courses.spec.js`): course grid rendering, locked preview state, owned course access, empty state
- **Stellar payment** (`e2e/payment.spec.js`): full payment state machine (preview → confirm → processing → success), error state, API payload verification

**How it works:**

1. All backend API calls are intercepted by Playwright's `page.route()` and served from JSON fixtures in `e2e/fixtures/`. No real backend needed.
2. The Stellar wallet browser extension is replaced by a test-mode wallet (`components/stellar/e2eWallet.js`) enabled by `NEXT_PUBLIC_E2E_WALLET=true`. This flag is tree-shaken in production builds.
3. The Playwright `webServer` config builds and starts a production Next.js server automatically.

**Running locally:**

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps chromium

# Run E2E tests (builds app automatically)
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e -- --ui

# Run a specific test file
npm run test:e2e -- e2e/auth.spec.js
```

**CI:** The E2E job runs in GitHub Actions on every PR to `dev`/`main`. Playwright report is uploaded as an artifact on failure.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
