#!/bin/bash
(mkdir -p build && \
  git clone git@github.ibm.com:ibmcloud/ibm-vale.git build/ibm-vale)

(cd build &&
  wget https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_Linux_64-bit.tar.gz &&
#   wget "https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_macOS_arm64.tar.gz" &&
  tar xvf vale*.tar.gz vale)

./build/vale -v

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  # skip hidden tutorials
  if [[ "$source" == *"hidden.md" ]]; then
    continue
  fi

  if ./build/vale --no-wrap --config build/ibm-vale/.vale.ini --minAlertLevel=error $source; then
    errorCode=1
  fi

done

#exit $errorCode