#!/bin/bash
COMMIT_MESSAGE=`date +"%Y-%m-%d %T%z"`' ('`git rev-parse HEAD`')'

mkdir build
git clone https://$PUBLIC_GITHUB_USER:$PUBLIC_GITHUB_TOKEN@github.com/IBM-Bluemix-Docs/tutorials build

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
  --exclude=autoscale-virtual-server.md \
  --exclude=extended-cloud-security.md \
  --exclude="images/solution49-*" \
  --exclude=vpc-app-deploy.md \
  --exclude="images/solution50-*" \
  --exclude=scalable-webapp-openshift.md \
  --exclude=README.md \
  --exclude="*.course.json" \
  --exclude=scripts \
  --exclude=.vscode \
  --exclude=.travis.yml . | (cd build && tar xvf - )

# replace the private toc with the public version
(cd build && rm -f toc && mv toc-public toc)

# restore the translation files
(cd build && git checkout HEAD nl)

# add all files
(cd build && git add . && git commit -m "$COMMIT_MESSAGE" && git push)
