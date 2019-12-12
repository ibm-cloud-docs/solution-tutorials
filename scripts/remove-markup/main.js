const Mustache = require('mustache');
const fs = require('fs');

const sourceFilename = process.argv[2];
const destFilename = process.argv[3];

const sourceText = fs.readFileSync(sourceFilename).toString();
fs.writeFileSync(destFilename, Mustache.render(sourceText, { 
  istutorial: true,
  isworkshop: false,
}, null, ['<!--#', '#-->']));
