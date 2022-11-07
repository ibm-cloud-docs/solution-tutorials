#!/bin/bash
errorCode=0
errorCount=0

echo "Checking for unused images..."
for image in $(find images -type f \( -iname \*.jpg -o -iname \*.png -o -iname \*.svg \) | grep -v "\-hidden"); do
  if ! grep -q $image *.md scripts/indexGenerator/input.json; then
    echo rm $image
    errorCount=$((errorCount+1))
    errorCode=1
  fi
done

if [ $errorCode != 0 ]; then
  echo "Detected $errorCount unused images"
fi

exit $errorCode
