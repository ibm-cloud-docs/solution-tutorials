#!/bin/bash
errorCode=0

echo "Checking if lastupdated was updated..."

for source in *.md; do
  # get last modified from git
  gitDate=$(git log -1 --format="%ad" --date=format:'%Y-%m-%d' -- $source)

  # get last modified from the md
  mdDate=$(grep lastupdated $source | awk '{print $2}' | tr -d \")

  # compare
  if [ $gitDate != $mdDate ]; then
    echo from git:$gitDate from md:$mdDate $source
    errorCode=1
  fi

done

exit $errorCode