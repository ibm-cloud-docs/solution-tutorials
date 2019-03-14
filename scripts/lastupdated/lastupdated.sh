#!/bin/bash

# restore last modified date based on git last commit
(cd ../.. && git ls-files *.md | \
  while read file; do \
    echo $file; \
    touch -t $(date -jf "%s" $(git log --date=local -1 --format="@%ct" "$file" | cut -b 2-) +%Y%m%d%H%M) "$file"; \
  done)

# and update the .md
npm install && node lastupdated.js
