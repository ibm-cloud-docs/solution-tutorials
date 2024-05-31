#!/bin/bash
set -e

rm -rf build/conref
mkdir -p build/conref/

echo "Getting conrefs..."
(cd build/conref && git clone git@github.ibm.com:cloud-doc-build/markdown.git)
(cd scripts/tool-conref && npm install && node snippets.js ../../.vscode/conref.code-snippets)
