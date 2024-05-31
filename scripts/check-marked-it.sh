#!/bin/bash
set -e
errorCode=0

echo "Checking for marked-it 2.0 compatibility issues..."

(mkdir -p build && git clone git@github.ibm.com:cloud-doc-build/docs-build-marked-it-20-updates.git build/marked-it)
(cd build/marked-it && npm install)

# copy files to another folder otherwise the tool will try
# to look recursively and check files that should not be checked
(mkdir -p build/check-marked-it && cp *.md build/check-marked-it)

# run the output
OUTPUT=$(node ./build/marked-it/bin/markedScript.js -i build/check-marked-it)

# detect any issue -- the tool does not return 1 in case of failures but log messages
if [ -z "$(echo "${OUTPUT}" | sed '/^-------------------- Indentation Warnings-----------------$/d' | sed '/^$/d')" ]; then
  echo "No errors detected"
else
  echo "$OUTPUT"
  echo "Errors detected in marked-it compatiblity. See above ^^^"
  errorCode=1
fi

exit $errorCode