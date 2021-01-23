#!/bin/bash
set -e
if grep -rI '!\[]' --exclude=README.md --exclude solution-template.md *.md
then
  echo "  -> [KO] Found images with no description. Fix them."
  exit 1
fi
