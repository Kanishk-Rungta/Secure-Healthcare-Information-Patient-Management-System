```markdown
# Contributing

Thanks for your interest in contributing to this project. This file explains the recommended workflow, code style, testing expectations, and PR requirements.

## Getting started

1. Fork the repository.
2. Create a branch from `main` following the convention: `feature/<short-description>` or `fix/<short-description>`.
3. Ensure tests pass locally and linting is clean.

## Branching and commits

- Branch names: `feature/xxx`, `fix/xxx`, `chore/xxx`, `hotfix/xxx`.
- Commit message format (conventional-ish):

```
<type>(<scope>): Short summary

More details in the body (optional).

Example:
feat(auth): add refresh token endpoint
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`.

## Tests & linting

- Run lint and tests before opening a PR. Example commands:

```bash
cd backend && npm run lint && npm test
cd frontend && npm run lint && npm test
```

- Add tests for new features or critical bug fixes. Prefer unit tests for logic and lightweight integration tests for API routes.

## Pull request process

1. Open a PR from your branch to `main` with a descriptive title and linked issue if present.
2. Include a concise description of the change and provide testing steps.
3. Ensure CI passes (lint, tests, build). Address review comments promptly.
4. Squash and rebase commits where appropriate before merge.

## Code style

- Use the repository ESLint configuration. Follow existing code patterns and naming conventions.
- Keep functions small and single-responsibility.

## Security and Secrets

- Do not commit credentials or secrets. Add any secret files to `.gitignore`.
- Use environment variables and reference `.env.example` as the template.

## Reporting issues

- File an issue with a clear title, steps to reproduce, expected vs actual behavior, and logs or screenshots when helpful.

## Code of Conduct

By participating you agree to follow a respectful and inclusive code of conduct. If you want, I can add a full `CODE_OF_CONDUCT.md` to this repo.

---

If you'd like, I can create a PR template and issue templates in `.github/`.
```
