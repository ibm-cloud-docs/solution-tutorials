
# Tutorials

[![Build Status](https://v3.travis.ibm.com/cloud-docs-solutions/solution-tutorials.svg?token=3zVsKWBpyuw2qWyZGMDS&branch=review)](https://v3.travis.ibm.com/cloud-docs-solutions/solution-tutorials)

* Solution tutorials are written in `main` branch.
* Upon commits, a [Travis](https://v3.travis.ibm.com/cloud-docs-solutions/solution-tutorials) build is triggered
   * it runs [checks](./scripts/check-all.sh)
   * and copy [all but some files](./scripts/main-to-source.sh) to the `source` branch.
* The [doc framework build](https://ibm.enterprise.slack.com/archives/C013H1ZDUPR) kicks in and dispatches files from `source` to the `draft/review/next-publish-push` branches.
* Once happy with the content of `publish`, a PR (automatically created by the doc framework) needs to be merged.

To control content, follow the [doc guidelines](https://test.cloud.ibm.com/docs-draft/writing?topic=writing-source-tagging).
