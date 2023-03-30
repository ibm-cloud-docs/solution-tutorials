#!/bin/bash
echo "Checking rules on internal and external links, also broken links..."

errorCode=0

LINK_RULES=( \
  "https:/[a-z]" \
  "DomainName/}" \
  ")\[http" \
  "https://{DomainName}/docs" \
)
for rule in "${LINK_RULES[@]}"
do
  if grep -rI "$rule" --exclude=README.md --exclude solution-template.md *.md
  then
    echo "  -> Found references to $rule. Check related links."
    errorCode=1
  fi
done

exit $errorCode
