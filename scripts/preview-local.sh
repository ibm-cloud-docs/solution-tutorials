#!/bin/bash

# Generate index.md
cd indexGenerator
node app.js
cd ../..

mkdir -p builddocs/input

# copy all files to doc input folder
tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=diagrams \
  --exclude=.vscode \
  --exclude=.git \
  --exclude=README.md \
  . | (cd builddocs/input && tar xvf - )

# generate the new files
marked-it-cli builddocs/input --output=builddocs/output --overwrite --header-file=scripts/header.txt

# revert the "?topic" links to plain html files
sed -i 's/"\/docs\/tutorials?topic=solution-tutorials-\(.*\)#\(.*\)"/"\1.html"/g' builddocs/output/index.html

# start server
watch-http-server builddocs/output/ &

# stop server and relauch script on *.md file changes
fswatch -1 -e ".*" -i "\\.md$" . | xargs -n1 -I{} kill $! && cd ./scripts && ./$(basename $0) && exit
