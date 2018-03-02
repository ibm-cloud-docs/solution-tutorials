#!/bin/bash
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

git clone -n git@github.ibm.com:Bluemix-Docs/docs-build.git --depth 1 builddocs/docs-build
(cd builddocs/docs-build && git checkout HEAD markdown/cloudoeconrefs.yml)

# remove all files from gh-pages
(cd builddocs/output && git rm -rf .)

# generate the new files
npm install -g marked-it-cli
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt --conref-file=builddocs/docs-build/markdown/cloudoeconrefs.yml

# check that there is no "{{"" not replaced in the output, ignoring binaries
if grep -rI "{{" builddocs/output
then
  echo "Found incorrect references"
  exit 1
fi
