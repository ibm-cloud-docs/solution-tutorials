#!/bin/bash
git config --global push.default simple
git config --global user.email "autobuild@not-a-dom.ain"
git config --global user.name "autobuild"

# commit to gh-pages
(cd builddocs/output && git add . && [[ -z $(git status -uno --porcelain) ]] || (git commit -m "changes in staging" && git push))
