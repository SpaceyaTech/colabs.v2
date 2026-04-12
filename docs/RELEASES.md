# Release Process

This project uses **Google Release Please** to automate versioning and GitHub Releases. This approach is lightweight and secure, as it runs entirely within GitHub Actions and requires zero dependencies in the local `package.json`.

## How it Works

1.  **Commit with Conventional Commits**: Use prefixes like `feat:`, `fix:`, `chore:`, or `docs:` in your commit messages.
2.  **Release Pull Request**: When changes are pushed to the `main` branch, the **Release Please** GitHub Action analyzes your commits. If it finds new features or fixes, it will automatically open (or update) a new Pull Request titled `chore(main): release vX.Y.Z`.
3.  **Review and Merge**: When you are ready to release, simply review and merge the Release Pull Request.
4.  **Automatic Tagging**: Upon merging the PR, the Action will:
    *   Create a GitHub Tag (e.g., `v1.2.3`).
    *   Create a GitHub Release with an automatically generated changelog.
    *   Update the `version` in `package.json` on the `main` branch.

## Benefits

*   **Security**: No heavy release-related dependencies in `package.json`, reducing the attack surface and eliminating `npm audit` warnings.
*   **Transparency**: You can see exactly what the next release will look like by reviewing the Release PR before it is merged.
*   **Reliability**: Follows the Google-standard release pattern for high-quality projects.

## Configuration

The workflow is defined in [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml). It uses the `node` release type, which automatically handles `package.json` and `CHANGELOG.md`.
