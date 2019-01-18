#!/bin/bash
set -e
mkdir -p builddocs/input

DOMAIN_NAME_RULES=( \
  "console.bluemix.net" \
  "/cloud.ibm.com" \
  "console.cloud.ibm.com" \
)
for rule in "${DOMAIN_NAME_RULES[@]}"
do
  echo " -----------------------
Checking for references to ${rule}"
  if grep -rI "$rule" --exclude=README.md *.md
  then
    echo "  -> [KO] Found references to $rule. Replace them with {DomainName}."
    DOMAIN_NAME_CHECK="ko"
  else
    echo "  -> [OK] No reference found"
  fi
done
if [ $DOMAIN_NAME_CHECK ]; then
  echo "{DomainName} check failed"
  exit 1;
fi

# copy all files to doc input folder
tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=.git \
  --exclude=README.md \
  . | (cd builddocs/input && tar xvf - )

# replace DomainName
sed -i 's/{DomainName}/cloud.ibm.com/g' builddocs/input/*.md

# get the gh-pages branch
rm -rf builddocs/output
git clone --depth=1 --branch=gh-pages git@github.ibm.com:Bluemix-Docs/tutorials.git builddocs/output

# retrieve the conref
(cd builddocs && curl -sSO "https://oauth2:$GITHUB_ENTERPRISE_TOKEN@raw.github.ibm.com/cloud-doc-build/markdown/master/cloudoeconrefs.yml")

# remove all files from gh-pages
(cd builddocs/output && git rm -rf .)

# generate a md helping with the conref
(cd scripts/conref && npm install && node tomd.js ../../builddocs/input/conref.md)

# generate the new files
npm install -g marked-it-cli
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt --conref-file=builddocs/cloudoeconrefs.yml

# check that there is no "{{"" not replaced in the output, ignoring binaries
if grep -rI "{{" --exclude=conref.html builddocs/output
then
  echo "Found incorrect references"
  exit 1
fi
