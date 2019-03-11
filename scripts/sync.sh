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
  --exclude="vpc-globally-available.md" \
  --exclude="vpc-vpn.md" \
  --exclude="vpc-secure-management-bastion-server.md" \
  --exclude="images/solution41-*" \
  --exclude="images/solution46-*" \
  --exclude="images/solution47-*" \
  --exclude=README.md \
  --exclude=scripts \
  --exclude=.travis.yml . | (cd build && tar xvf - )
(cd build && git add . && git commit -m "$COMMIT_MESSAGE" && git push)
