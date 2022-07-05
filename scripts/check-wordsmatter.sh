#!/bin/bash
errorCode=0

echo "Checking terms to replace..."

# based on https://w3.ibm.com/w3publisher/inclusive-it-terminology/terms-to-replace
TERMS_TO_REPLACE="blacklist|whitelist|slave|[^\/]master|master.repository|black.hat.hacker|white.hat.hacker|Chinese.wall|man.hour|man.day|sanity.test|sanity.check|segregate|segregation|Scrum.master|tribe"

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  if [ "$source" == "solution-template.md" ]; then
    continue
  fi

  echo -n "Checking $source..."
  LOOKUP=$(grep --color=always -Hn -i -E $TERMS_TO_REPLACE $source)
  # if grep returns some rows, it is a problem
  if [[ $? == 0 ]]; then
    echo "KO"
    echo "$LOOKUP" | sed 's/^/    /'
    errorCode=1
  else
    echo "OK"
  fi
done

if [ $errorCode == 0 ]; then
  echo "No issue detected"
fi

# don't fail yet -- other part of the documentation need to solve their issues first
# exit $errorCode