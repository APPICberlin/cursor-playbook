# Archive Policy

- Obsolete code, experiments, or replaced implementations must be moved to `ARCHIVE/` within the same repo.
- Never import from `ARCHIVE/`. The guardian will fail the check if imports target this folder.
- Each archived file should include a short header at the top describing: date, reason, replacement path/PR.
- The PR description must mention the archival and link to the replacement if applicable.
- The `ARCHIVE/` folder is excluded from builds and tests.
