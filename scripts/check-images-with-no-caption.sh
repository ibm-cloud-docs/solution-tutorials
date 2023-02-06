#!/bin/bash
echo "Checking for images with no caption"

errorCode=0

if grep -Hn "\!\[" --exclude README.md --exclude "*.hidden.md" $PWD/*.md | grep -v "caption="
then
  echo "  -> Found images with no caption"
  errorCode=1
else
  echo "  -> All images have captions!"
fi

exit $errorCode
