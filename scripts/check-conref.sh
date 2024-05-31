#!/bin/bash
set -e

rm -rf build/check-conref
mkdir -p build/check-conref/input
mkdir -p build/check-conref/output

# copy all files to doc input folder
echo "Preparing files..."
tar cf - \
  --exclude=build \
  --exclude=scripts \
  --exclude=diagrams \
  --exclude=.vscode \
  --exclude=.git \
  --exclude=README.md \
  . | (cd build/check-conref/input && tar xvf - ) 2>/dev/null

# retrieve the cloud-doc-builds/markdown repo
echo "Getting conrefs..."
(cd build/check-conref && git clone git@github.ibm.com:cloud-doc-build/markdown.git)

# convert md to html
echo "Converting to html..."
npm install --silent -g marked-it-cli
export VERSION=2
NODE_ENV=production marked-it-cli \
  build/check-conref/input \
  --output=build/check-conref/output \
  --extension-file=build/check-conref/markdown/headerFooterExt.js \
  --extension-file=build/check-conref/markdown/generateSectionsExt.js \
  --extension-file=build/check-conref/markdown/accessibilityExt.js \
  --extension-file=build/check-conref/markdown/jsonTocExt.js \
  --conref-file=build/check-conref/markdown/cloudoekeyrefs.yml \
  --overwrite --toc-json \
  --extension-file=build/check-conref/markdown/videoExt.js \
  --extension-file=build/check-conref/markdown/terraformExt.js \
  --extension-file=build/check-conref/markdown/glossaryExt.js \
  --@glossary:definitions-file=$PWD/build/check-conref/markdown/glossary.json

# check that there is no "{site" not replaced in the output, ignoring binaries
if grep -rI "{site" --exclude=conref-table.html --exclude=index.html --exclude vscodesnippets.json build/check-conref/output
then
  echo "Found incorrect references"
  exit 1
fi
