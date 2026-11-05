# Branch policy

`main` holds release history. `dev` is the integration branch. Both branches require pull requests and disallow force pushes and deletion.

| Branch | Starts from | Pull request target | Purpose |
| --- | --- | --- | --- |
| `feature/<issue>-<slug>` | `dev` | `dev` | Product changes |
| `bugfix/<issue>-<slug>` | `dev` | `dev` | Fixes for unreleased work |
| `upstream-sync/<YYYY-MM-DD>` | `dev` | `dev` | Merge updates from `upstream/master` |
| `release/<version>` | `dev` | `main` | Prepare a Berry release |
| `hotfix/<issue>-<slug>` | `main` | `main` | Fix a released version |

After a release or hotfix reaches `main`, merge `main` back into `dev`. Use the tag families defined by the release workflows (`dsh-v*` and per-package `vendor-*`); retain existing upstream DeepSeek Harness tags.

Upstream remains the `upstream` remote, with `master` as its source branch. Bring upstream changes through an `upstream-sync` branch and review them before merging into `dev`.
