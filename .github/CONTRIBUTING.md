# Contributions

We welcome contributions in the form of issues and pull requests.

## Issues

Log issues for both bugs and enhancement requests.  Logging issues are important for the open community.

## Enhancements and Feature Requests

We ask that before significant effort is put into code changes, that we have agreement on taking the change before time is invested in code changes.

1. Create a feature request.
2. When we agree to take the enhancement, create a pull request.

## Development Life Cycle

Note that before a PR will be accepted, you must ensure:

- all tests are passing
- all CI checks are passing
- `npm run format` reports no issues
- `npm run lint` reports no issues

### Useful Scripts

- `npm run build` This compiles TypeScript code.
- `npm run format` This checks that formatting has been applied with Prettier.
- `npm run package` This packages the code into the dist folder. Must be updated to pass CI on `main`.
- `npm test` This runs all Jest tests in this repository.
