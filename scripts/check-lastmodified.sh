#!/bin/bash
errorCode=0

# travis does pull only with depth=50
# we need to ensure we have the latest and greatest otherwise we can't accurately check date
git pull --unshallow --ff-only

echo "Checking if lastupdated was updated..."

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  if [ "$source" == "solution-template.md" ]; then
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
  if [[ "$gitDate" != @("$mdDate"|"2021-09-27"|"2021-09-23"|"2021-08-16"|"2021-10-22"|"2022-06-30") ]]; then
    echo "$source lastupdated was not updated after its last commit (from git:$gitDate from md:$mdDate)"
    errorCode=1
  fi

done

if [ $errorCode == 0 ]; then
  echo "No issue detected"
fi

exit $errorCode