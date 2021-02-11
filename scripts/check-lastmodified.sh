#!/bin/bash
errorCode=0

echo "Checking if lastupdated was updated..."

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  # get last modified from git
  gitDate=$(git log -1 --format="%cd" --date=format:'%Y-%m-%d' -- $source)

  # get last modified from the md
  mdDate=$(grep lastupdated $source | awk '{print $2}' | tr -d \")

  # if md is bigger than git, ignore
  if [[ "$mdDate" > "$gitDate" ]]; then
    continue
  fi

  # compare
  if [[ "$gitDate" != "$mdDate" ]]; then
    echo "$source lastupdated was not updated after its last commit (from git:$gitDate from md:$mdDate)"
    errorCode=1
  fi

done

if [ $errorCode == 0 ]; then
  echo "No issue detected"
fi

exit $errorCode