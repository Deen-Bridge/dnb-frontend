# Contributing to Deen Bridge

Thank you for your interest in contributing to Deen Bridge! We welcome contributions from the community to help make Islamic education more accessible.

## Contribution Workflow

1. Find or open an issue describing the change.
2. Create a focused branch from `dev` and implement the change.
3. Run the relevant checks described below.
4. Open a pull request against `dev`, link the issue, and summarize the changes and checks.

Everyone is welcome to contribute to the platform's engineering work.

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

### Theming

The app supports light and dark mode, so prefer semantic tokens over raw colors — `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`. A hardcoded `bg-white` or `#hex` keeps its value when the theme flips and usually ends up unreadable.

Two brand tokens exist and they are not interchangeable. `bg-accent` is a fixed dark surface meant to carry white text. `text-brand-text` is the brand colour for text, and it has a separate value per theme — a single fixed colour cannot stay readable on both a light and a dark background. Reach for `dark:` variants only when no token expresses what you need.

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

## Admin Area Development

Work on admin-facing pages has a few extra requirements beyond the general workflow above. Read [`docs/rbac.md`](docs/rbac.md) and [`docs/admin-architecture.md`](docs/admin-architecture.md) before picking up your first admin issue.

### Where things live

| Path | Purpose |
|------|---------|
| `lib/auth/roles.js` | Base RBAC — roles (`student` / `educator` / `admin`), capabilities, fail-closed `can()` |
| `lib/auth/admin-tiers.js` | Admin role tiers (`staff` / `super-admin`) and tier gating, kept isolated so tiers can evolve |
| `components/auth/AdminTierGuard.jsx` | Page-level guard enforcing super-admin-only surfaces |
| `components/auth/StepUpConfirmDialog.jsx` | Reusable confirm-to-proceed dialog for sensitive actions |

### Conventions

- **Super-admin-only pages must render inside `AdminTierGuard`.** Never rely on hidden navigation alone — unknown/loading users must see a denial state, not the page.
- Destructive actions (demote, revoke, delete) go through the step-up confirmation dialog; no plain `confirm()` calls.
- Tier checks always go through the helpers in `lib/auth/admin-tiers.js` — never read `user.tier` ad hoc inside components.
- The backend is the real authorization boundary; client-side gating is defense-in-depth only (see `docs/rbac.md`).

### Seeding an admin user locally

Roles come from the [dnb-backend](https://github.com/Deen-Bridge/dnb-backend) user record — the frontend only reads `user.role` (and the tier fields for admins), it never assigns them. To get an admin user for local development:

1. Run dnb-backend locally and point `NEXT_PUBLIC_API_URL` at it (see `.env.example`), then set your test user's `role` to `admin` (plus its `tier` to `super_admin` if you are working on team management) via the backend's seed step or database.
2. For pure UI work you can instead edit the `userInfo` cookie in your browser devtools and change its `role` value. Client-side checks exist to stop the UI *offering* actions the server would reject — this trick is acceptable for local development only, never in shipped code.
3. Log out and back in so the auth provider picks up the updated record.

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

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
