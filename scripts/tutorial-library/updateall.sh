#!/bin/bash
set -e

find ../.. -name '*.md' ! -path '*README*' ! -path '*index.md' ! -path '*/getting-started.md' ! -path '*/solution-template.md' -maxdepth 1 -print0 | while read -d $'\0' file
do
  node update.js $file false
done