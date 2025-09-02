# Contributing

Thanks for contributing! This doc outlines how to work effectively on this repo.

## Branching
- main: stable
- feature branches: feature/<short-description>
- bugfix branches: fix/<short-description>

## Commit Messages (Conventional Commits)
- feat: add new feature
- fix: bug fix
- docs: documentation changes
- style: formatting only (no code behavior changes)
- refactor: code change that neither fixes a bug nor adds a feature
- test: adding or updating tests
- chore: tooling/infra

Examples:
- feat(charts): add capacity planning chart
- fix(api): handle network errors in getDemandForecast

## Pull Requests
- Keep PRs focused and small.
- Include screenshots/gifs for UI changes.
- Ensure `npm run lint:fix` and `npm run format` pass.
- PR description:
  - What changed
  - Why
  - How to test
  - Any follow-ups

## Code Style
- ESLint + Prettier enforced.
- Prefer small, composable components.
- Keep API calls isolated in `src/services/`.
- Reuse charts from `src/components/charts/`.

## Tests (future)
- Add unit tests for chart helpers and services when backend stabilizes.