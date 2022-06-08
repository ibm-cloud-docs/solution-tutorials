#!/bin/bash
echo "Show URLs..."

for source in *.md; do
  if [ "$source" == "README.md" ]; then
    continue
  fi

  if [ "$source" == "solution-template.md" ]; then
    continue
  fi

  echo "$source"

  cat "$source" | grep -Eo "(http|https)://github[a-zA-Z0-9./?=_%:-]*" | sort -u | sed 's/^/  /'
done
