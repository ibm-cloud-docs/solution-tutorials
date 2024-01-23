#!/bin/bash
(mkdir -p builddocs && \
  git clone git@github.ibm.com:ibmcloud/ibm-vale.git builddocs/ibm-vale)

(cd builddocs &&
  wget https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_Linux_64-bit.tar.gz &&
#   wget "https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_macOS_arm64.tar.gz" &&
  tar xvf vale*.tar.gz vale)

./builddocs/vale -v

for source in *.md; do

  if [ "$source" == "README.md" ]; then
    continue
  fi

  # skip hidden tutorials
  if [[ "$source" == *"hidden.md" ]]; then
    continue
  fi

  if ./builddocs/vale --no-wrap --config builddocs/ibm-vale/.vale.ini --minAlertLevel=error $source; then
    errorCode=1
  fi

done

#exit $errorCode