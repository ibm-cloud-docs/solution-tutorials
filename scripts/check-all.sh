#!/bin/bash
export ROOT_DIR="$( cd "$(dirname "$BASH_SOURCE")" ; cd ..; pwd -P )"
export SCRIPT_DIR=$ROOT_DIR/scripts

function travis_fold_start {
  echo -e "travis_fold:start:$1\r"
}

function travis_fold_end {
  echo "travis_fold:end:$1"
}

errorCode=0

TESTS=(
  $SCRIPT_DIR/check-translation.sh
  $SCRIPT_DIR/check-a11y.sh
  $SCRIPT_DIR/check-lastmodified.sh
  $SCRIPT_DIR/check-unused-images.sh
  $SCRIPT_DIR/check-wordsmatter.sh
  $SCRIPT_DIR/check-marked-it.sh
)
for test in "${TESTS[@]}"; do
  testBasename=`basename $test`
  travis_fold_start $testBasename
  if $test; then
    echo "✅ Passed - $testBasename"
  else
    echo "❌ Failed - $testBasename"
    errorCode=1
  fi
  travis_fold_end $testBasename
done

exit $errorCode
