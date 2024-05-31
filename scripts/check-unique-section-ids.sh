#!/bin/bash
set -e

# check that all section IDs are unique
(cd scripts/add-section-titles && npm install --silent && node add-section-titles.js)
