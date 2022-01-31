#!/bin/bash
errorCode=0
errorCount=0

echo "Checking for unused images..."
for image in $(find images -type f \( -iname \*.jpg -o -iname \*.png -o -iname \*.svg \)); do
  if ! grep -q $image *.md; then
    echo $image not found in markdown files
    errorCount=$((errorCount+1))
    errorCode=1
  fi
done

if [ $errorCode == 0 ]; then
  echo "No issue detected"
else
  echo "Detected $errorCount unused images"
fi

# don't fail the build just yet
# exit $errorCode
