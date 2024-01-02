#!/bin/bash
export ROOT_DIR="$( cd "$(dirname "$BASH_SOURCE")" ; cd ..; pwd -P )"
export SCRIPT_DIR=$ROOT_DIR/scripts

errorCode=0

TESTS=(
  $SCRIPT_DIR/check-domainname.sh
  $SCRIPT_DIR/check-a11y.sh
  $SCRIPT_DIR/check-lastmodified.sh
  $SCRIPT_DIR/check-unused-images.sh
  $SCRIPT_DIR/check-wordsmatter.sh
  $SCRIPT_DIR/check-images-with-no-caption.sh
  $SCRIPT_DIR/check-marked-it.sh
  $SCRIPT_DIR/check-linkrules.sh
  $SCRIPT_DIR/check-with-vale.sh
)
failedTests=""
for test in "${TESTS[@]}"; do
  testBasename=`basename $test`
  echo "Running $testBasename"
  if $test; then
    echo "✅ Passed - $testBasename"
  else
    echo "❌
❌
❌
❌ Failed - $testBasename
❌
❌
❌"
    failedTests="$testBasename $failedTests"
    errorCode=1
  fi
done

if [ $errorCode != 0 ]; then
  echo "❌❌❌❌ One or more tests have failed: $failedTests"
fi

exit $errorCode
