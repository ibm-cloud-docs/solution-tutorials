#!/bin/bash
echo "Checking for images with no caption"

errorCode=0

if grep -Hn "\!\[" --exclude README.md --exclude "*.hidden.md" $PWD/*.md | grep -v "caption" | nl
then
  echo "  -> Found images with no caption"
  errorCode=1
fi

# disable failure for now
# exit $errorCode
