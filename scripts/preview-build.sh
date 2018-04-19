#!/bin/bash
set -e
mkdir -p builddocs/input

# copy all files to doc input folder
tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=.git \
  --exclude=README.md \
  . | (cd builddocs/input && tar xvf - )

# get the gh-pages branch
rm -rf builddocs/output
git clone --depth=1 --branch=gh-pages git@github.ibm.com:Bluemix-Docs/tutorials.git builddocs/output

# retrieve the conref
(cd builddocs && curl -sSO "https://oauth2:$GITHUB_ENTERPRISE_TOKEN@raw.github.ibm.com/Bluemix-Docs/docs-build/master/markdown/cloudoeconrefs.yml")

# remove all files from gh-pages
(cd builddocs/output && git rm -rf .)

# generate a md helping with the conref
(cd scripts/conref && npm install && node tomd.js ../../builddocs/input/conref.md)

# generate the new files
npm install -g marked-it-cli
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt --conref-file=builddocs/cloudoeconrefs.yml

# check that there is no "{{"" not replaced in the output, ignoring binaries
if grep -rI "{{" builddocs/output
then
  echo "Found incorrect references"
  exit 1
fi
