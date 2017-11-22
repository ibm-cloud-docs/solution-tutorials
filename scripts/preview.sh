#!/bin/bash
mkdir -p builddocs/input

# copy all files to doc input folder
tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=.git \
  --exclude=README.md \
  . | (cd builddocs/input && tar xvf - )

npm install -g marked-it-cli gh-pages
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt
NODE_DEBUG=gh-pages gh-pages -d builddocs/output
