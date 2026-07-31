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
