<!-- markdownlint-disable -->
# Tutorials

[![Build Status](https://v3.travis.ibm.com/cloud-docs-solutions/solution-tutorials.svg?token=3zVsKWBpyuw2qWyZGMDS&branch=draft)](https://v3.travis.ibm.com/cloud-docs-solutions/solution-tutorials)

[Quick builds](https://pages.github.ibm.com/cloud-docs-solutions/solution-tutorials/) done by [Travis](https://v3.travis.ibm.com/github/cloud-docs-solutions/solution-tutorials) using [this script](./scripts/preview-build.sh) and [this script](./scripts/preview-push.sh) on the `draft` branch.

[Full builds](https://test.cloud.ibm.com/docs/solution-tutorials/index.html#tutorials) done by the doc team in test environment.

[Production builds](https://cloud.ibm.com/docs/solution-tutorials/index.html#tutorials) done by the doc team in public.

[Process to make the docs public](https://github.ibm.com/Bluemix/cloud-portfolio-solutions/tree/master/solutions#how-do-we-make-the-solutions-public).

## I want to contribute a new tutorial

1. Fork this https://github.ibm.com/cloud-docs/tutorials
1. Use https://github.ibm.com/cloud-docs/tutorials/blob/draft/solution-template.md as a starting point
1. Follow the guidelines https://test.cloud.ibm.com/docs/writing?topic=writing-creating-tutorials.
1. Use draw.io to create your architecture diagram https://www.diagrams.net/.
1. When ready send a pull request.
1. Ping [the team](https://github.ibm.com/Bluemix/cloud-portfolio-solutions/wiki) to review the tutorial and make it public.

## To get a quick preview of the markdown on my own computer

1. Ensure you have node 10+, npm 6.9+
1. Change to your tutorials checkout directory
   ```
   cd tutorials
   ```
1. Run the preview script
   ```
   PORT=8080 ./scripts/preview-local.sh
   ```
1. Access the generated pages at http://127.0.0.1:8080

Limitations:
- the script does not render with the doc framework css so some advanced rendering may not work
- the script does not replace conrefs

_Based on https://test.cloud.ibm.com/docs/writing?topic=writing-transform-local_

