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
  --exclude=low-latency-real-time-bidding.md \
  --exclude=autoscale-virtual-server.md \
  --exclude=byoip.md \
  --exclude=configuring-IPSEC-VPN.md \
  --exclude=nat-config-private.md \
  --exclude=secure-network-enclosure.md \
  --exclude=images/solution33-secure-network-enclosure \
  --exclude=images/solution35-nat-config-private \
  --exclude=images/solution36-configuring-IPSEC-VPN \
  --exclude=images/solution37-byoip \
  --exclude=README.md \
  --exclude=scripts \
  --exclude=.travis.yml . | (cd build && tar xvf - )
(cd build && git add . && git commit -m "$COMMIT_MESSAGE" && git push)
