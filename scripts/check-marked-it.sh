#!/bin/bash
set -e
errorCode=0

echo "Checking for marked-it 2.0 compatibility issues..."

(mkdir -p builddocs && git clone https://oauth2:$GITHUB_ENTERPRISE_TOKEN@github.ibm.com/cloud-doc-build/docs-build-marked-it-20-updates builddocs/marked-it)
(cd builddocs/marked-it && npm install)

# copy files to another folder otherwise the tool will try
# to look recursively and check files that should not be checked
(mkdir -p builddocs/check-marked-it && cp *.md builddocs/check-marked-it)

# run the output
OUTPUT=$(node ./builddocs/marked-it/bin/markedScript.js -i builddocs/check-marked-it)

# detect any issue -- the tool does not return 1 in case of failures but log messages
if [ -z "$(echo "${OUTPUT}" | sed '/^-------------------- Indentation Warnings-----------------$/d' | sed '/^$/d')" ]; then
  echo "No errors detected"
else
  echo "$OUTPUT"
  echo "Errors detected in marked-it compatiblity. See above ^^^"
  errorCode=1
fi

exit $errorCode