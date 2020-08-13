# Tutorials

[![Build Status](https://travis.ibm.com/cloud-docs/solution-tutorials.svg?token=pqpHRY2jt29xa8JqgKgx&branch=draft)](https://travis.ibm.com/cloud-docs/solution-tutorials)

[Quick builds](https://pages.github.ibm.com/cloud-docs/solution-tutorials/) done by [Travis](https://travis.ibm.com/cloud-docs/solution-tutorials) using [this script](./scripts/preview-build.sh) and [this script](./scripts/preview-push.sh) on the `draft` branch.

[Full builds](https://test.cloud.ibm.com/docs/solution-tutorials/index.html#tutorials) done by the doc team in test environment.

[Production builds](https://cloud.ibm.com/docs/solution-tutorials/index.html#tutorials) done by the doc team in public.

[Process to make the docs public](https://github.ibm.com/Bluemix/cloud-portfolio-solutions/tree/master/solutions#how-do-we-make-the-solutions-public).

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

