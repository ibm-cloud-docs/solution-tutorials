#!/bin/bash
set -e

ROOT_DIR="$( cd "$(dirname "$0")" ; cd ..; pwd -P )"

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac

# Generate index.md
(cd "$ROOT_DIR/scripts/indexGenerator" && npm install && node app.js)

mkdir -p "$ROOT_DIR/builddocs/input"

# copy all files to doc input folder
(cd "$ROOT_DIR" && tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=diagrams \
  --exclude=.vscode \
  --exclude=.git \
  --exclude=README.md \
  . | (cd "$ROOT_DIR/builddocs/input" && tar xvf - ))

# generate the new files
npm install -g marked-it-cli
marked-it-cli "$ROOT_DIR/builddocs/input" --output="$ROOT_DIR/builddocs/output" --overwrite --header-file="$ROOT_DIR/scripts/header.txt"

# revert the "?topic" links to plain html files
if [[ "$machine" == "Mac" ]]; then
  sed -i '' 's/"\/docs\/solution-tutorials?topic=solution-tutorials-\(.*\)#\(.*\)"/"\1.html"/g' "$ROOT_DIR/builddocs/output/index.html"
else
  sed -i 's/"\/docs\/solution-tutorials?topic=solution-tutorials-\(.*\)#\(.*\)"/"\1.html"/g' "$ROOT_DIR/builddocs/output/index.html"
fi

# start server
npm install -g http-server
http-server "$ROOT_DIR/builddocs/output"
