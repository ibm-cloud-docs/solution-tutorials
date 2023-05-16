#!/bin/bash
echo "Checking if lastupdated was updated..."

errorCode=0

# travis does pull only with depth=50
# we need to ensure we have the latest and greatest otherwise we can't accurately check date
git pull --unshallow --ff-only 2>/dev/null

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  # skip hidden tutorials
  if [[ "$source" == *"hidden.md" ]]; then
    continue
  fi

  # get last modified from git
  gitDate=$(git log -1 --format="%ad" --date=format:'%Y-%m-%d' -- $source)

  # get last modified from the md
  mdDate=$(grep lastupdated $source | awk '{print $2}' | tr -d \")

  # if md is bigger than git, ignore
  if [[ "$mdDate" > "$gitDate" ]]; then
    continue
  fi

  # compare and include special events like mass updates for formatting
  if [[ "$gitDate" != @("$mdDate"|"2022-06-30"|"2023-02-02"|"2023-02-03") ]]; then
    echo "$source lastupdated was not updated after its last commit (from git:$gitDate from md:$mdDate)"
    errorCode=1
  fi

done

exit $errorCode