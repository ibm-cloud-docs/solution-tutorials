#!/bin/bash
(mkdir -p builddocs && \
  git clone git@github.ibm.com:ibmcloud/ibm-vale.git builddocs/ibm-vale && \
  # stick with this version until fix https://github.ibm.com/ibmcloud/ibm-vale/commit/e2d1fbd40bfbaeaaa5351f183101789579422acf
  cd builddocs/ibm-vale && git checkout 976b9da8bc5222f0e1ed9e1f3581fcc64d4c30a6)

(cd builddocs &&
  wget https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_Linux_64-bit.tar.gz &&
#   wget "https://github.com/errata-ai/vale/releases/download/v2.28.0/vale_2.28.0_macOS_arm64.tar.gz" &&
  tar xvf vale*.tar.gz vale)

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