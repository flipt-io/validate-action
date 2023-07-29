# Contributing

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

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. Please adhere to this specification when contributing.

### Useful Scripts

- `npm run build` This compiles TypeScript code.
- `npm run format` This checks that formatting has been applied with Prettier.
- `npm run package` This packages the code into the dist folder. Must be updated to pass CI on `main`.
- `npm test` This runs all Jest tests in this repository.

## Legal

By submitting a Pull Request, you disavow any rights or claims to any changes
submitted to the Flipt project and assign the copyright of
those changes to Flipt Software Inc.

If you cannot or do not want to reassign those rights (your employment
contract for your employer may not allow this), you should not submit a PR.
Open an issue and someone else can do the work.

This is a legal way of saying "If you submit a PR to us, that code becomes ours".
99.9% of the time that's what you intend anyways; we hope it doesn't scare you
away from contributing.
