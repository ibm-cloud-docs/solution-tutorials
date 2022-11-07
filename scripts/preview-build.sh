#!/bin/bash
set -e
mkdir -p builddocs/input

# copy all files to doc input folder
tar cf - \
  --exclude=builddocs \
  --exclude=scripts \
  --exclude=diagrams \
  --exclude=.vscode \
  --exclude=.git \
  --exclude=README.md \
  . | (cd builddocs/input && tar xvf - ) >/dev/null

# replace DomainName
sed -i 's/{DomainName}/cloud.ibm.com/g' builddocs/input/*.md

# get the gh-pages branch
rm -rf builddocs/output
git clone --depth=1 --branch=gh-pages git@github.ibm.com:cloud-docs/solution-tutorials.git builddocs/output

# retrieve the cloud-doc-builds/markdown repo
(cd builddocs && git clone https://oauth2:$GITHUB_ENTERPRISE_TOKEN@github.ibm.com/cloud-doc-build/markdown)

# remove all files from gh-pages
(cd builddocs/output && git rm -rf . >/dev/null)

# generate conref helpers
(cd scripts/conref && npm install && node tomd.js ../../builddocs/input)

# generate a list of all solutions, suitable to use in github issues
(cd scripts/solution-table && npm install && node totable.js ../../builddocs/input/)

# check that all section IDs are unique
(cd scripts/add-section-titles && npm install && node add-section-titles.js)

# generate the new files
npm install -g marked-it-cli
export VERSION=2
NODE_ENV=production marked-it-cli \
  builddocs/input \
  --output=builddocs/output \
  --header-file=scripts/header.txt \
  --footer-file=builddocs/markdown/footer.txt \
  --extension-file=builddocs/markdown/headerFooterExt.js \
  --extension-file=builddocs/markdown/generateSectionsExt.js \
  --extension-file=builddocs/markdown/accessibilityExt.js \
  --extension-file=builddocs/markdown/jsonTocExt.js \
  --conref-file=builddocs/markdown/cloudoekeyrefs.yml \
  --overwrite --verbose --toc-json \
  --extension-file=builddocs/markdown/videoExt.js \
  --extension-file=builddocs/markdown/terraformExt.js \
  --extension-file=builddocs/markdown/glossaryExt.js \
  --@glossary:definitions-file=$PWD/builddocs/markdown/glossary.json

# move the index to getting started
mv builddocs/output/index.html builddocs/output/getting-started.html

# and make a dummy index.html with all files
cat scripts/header.txt > builddocs/output/index.html
cat >> builddocs/output/index.html << EOF
  <ul>
EOF
for file in $(cd builddocs/output && ls *.html | sort); do
  echo "<li><a href=\"$file\">$file</a></li>" >> builddocs/output/index.html
done

# revert the "?topic" links to plain html files
sed -i 's/"\/cloud-docs\/solution-tutorials?topic=solution-tutorials-\(.*\)#\(.*\)"/"\1.html"/g' builddocs/output/index.html

# check that there is no "{site" not replaced in the output, ignoring binaries
if grep -rI "{site" --exclude=conref-table.html --exclude=index.html --exclude vscodesnippets.json builddocs/output
then
  echo "Found incorrect references"
  exit 1
fi
