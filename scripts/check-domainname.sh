#!/bin/bash
echo "Checking for forbidden domain names..."

errorCode=0

DOMAIN_NAME_RULES=( \
  "console.bluemix.net" \
  "/cloud.ibm.com" \
  "/test.cloud.ibm.com" \
  "console.cloud.ibm.com" \
)
for rule in "${DOMAIN_NAME_RULES[@]}"
do
  if grep -rI "$rule" --exclude=README.md --exclude=*.hidden.md *.md | grep -v "https://cloud.ibm.com/catalog/architecture/"
  then
    echo "  -> Found references to $rule. Replace them with {DomainName}."
    errorCode=1
  fi
done

exit $errorCode
