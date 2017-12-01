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

# remove all files from gh-pages
(cd builddocs/output && git rm -rf .)

# generate the new files
npm install -g marked-it-cli
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt
