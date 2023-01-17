#!/bin/bash
COMMIT_MESSAGE=`date +"%Y-%m-%d %T%z"`' ('`git rev-parse HEAD`')'

# get the publish branch
mkdir build
git clone --depth=1 --branch=publish git@github.ibm.com:cloud-docs-solutions/solution-tutorials.git build

git config --global push.default simple
git config --global user.email "autobuild@not-a-dom.ain"
git config --global user.name "autobuild"

# remove all files from checkout
(cd build && git rm -rf .)

# bring back all files from this commit
tar cf - \
  --exclude=build \
  --exclude=.git \
  --exclude=.gitignore \
  --exclude=solution-template.md \
  --exclude=README.md \
  --exclude="*.course.json" \
  --exclude=scripts \
  --exclude=diagrams \
  --exclude="*.hidden.*" \
  --exclude="images/*hidden*" \
  --exclude=.vscode \
  --exclude=.travis.yml . | (cd build && tar xvf - )

# replace the private toc with the public version
(cd build && rm -f toc.yaml && mv toc-public.yaml toc.yaml)

# remove the custom markup used by tutorials-to-gitbook conversion
(cd scripts/remove-markup && npm install)
for source in build/*.md; do
  node scripts/remove-markup/main.js $source $source
done

# add all files
(cd build && git add . && git commit -m "$COMMIT_MESSAGE" && git push)
