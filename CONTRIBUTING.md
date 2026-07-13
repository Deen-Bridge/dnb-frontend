# Contributing to Deen Bridge

Thank you for your interest in contributing to Deen Bridge! We welcome contributions from the community to help make Islamic education more accessible.

## Drips Wave Program

This repository participates in the **Stellar Drips Wave** bounty program. Contributors can earn rewards by completing issues tagged with Wave labels.

### How It Works

1. **Find an Issue**: Look for issues with `wave:X` labels (where X is the point value)
2. **Claim the Issue**: Comment on the issue to express interest
3. **Submit a PR**: Complete the work and submit a pull request
4. **Earn Points**: Once merged, you earn points that translate to rewards

### Point Labels

| Label | Points | Typical Scope |
|-------|--------|---------------|
| `wave:1` | 1 point | Documentation, typos, small fixes |
| `wave:2` | 2 points | Bug fixes, minor features |
| `wave:3` | 3 points | New features, significant improvements |
| `wave:4` | 4 points | Complex features, architectural changes |

### Wave Rules

- One contributor per issue (first come, first served)
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
- Follow Islamic principles of brotherhood

## Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Review the documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
