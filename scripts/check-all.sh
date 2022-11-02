#!/bin/bash
export ROOT_DIR="$( cd "$(dirname "$BASH_SOURCE")" ; cd ..; pwd -P )"
export SCRIPT_DIR=$ROOT_DIR/scripts

function travis_fold_start {
  echo "travis_fold:start:$1"
}

function travis_fold_end {
  echo "travis_fold:end:$1"
}

errorCode=0

TESTS=(
  $SCRIPT_DIR/check-domainname.sh
  $SCRIPT_DIR/check-translation.sh
  $SCRIPT_DIR/check-a11y.sh
  $SCRIPT_DIR/check-lastmodified.sh
  $SCRIPT_DIR/check-unused-images.sh
  $SCRIPT_DIR/check-wordsmatter.sh
  $SCRIPT_DIR/check-marked-it.sh
)
failedTests=""
for test in "${TESTS[@]}"; do
  testBasename=`basename $test`
  travis_fold_start $testBasename
  if $test; then
    echo "✅ Passed - $testBasename"
  else
    echo "❌ Failed - $testBasename"
    failedTests="$testBasename $failedTests"
    errorCode=1
  fi
  travis_fold_end $testBasename
done

if [ $errorCode != 0 ]; then
  echo "❌❌❌❌ One or most tests have failed: $failedTests"
fi

exit $errorCode
