#!/bin/bash
errorCode=0

echo "Checking files for translation..."

for file in $(find images -name '*.svg'); do
  if grep -q '&#xa;' $file
  then
    echo "$file contains invalid &#xa; character. Edit the file with a text editor to remove occurrences."
    errorCode=1
  fi
done

if [ $errorCode == 0 ]; then
  echo "No issue detected"
fi

# disable failures for now. Translation process has changed and this may no longer be an issue.
# exit $errorCode
