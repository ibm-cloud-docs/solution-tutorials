#!/bin/bash
set -e
echo "Checking unique section ids..."

# check that all section IDs are unique
(cd scripts/unique-section-ids && npm install --silent && node unique-section-ids.js)
