const fs = require('fs');
const Handlebars = require('handlebars');

const conref = require('./conref.js');

const destinationFile = process.argv[2] || '.'

Handlebars.registerHelper('value', function( aKey, options) {
  return conref.getValue(aKey)
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
});

Handlebars.registerHelper('placeholder', function( aKey, options) {
  return `{{site.data.keyword.${aKey}}}`;
});

function writeFile(templateFile, destinationFile) {
  const templateSource = fs.readFileSync(templateFile);
  const template = Handlebars.compile(`${templateSource}`);

  console.log('Writing to', destinationFile);
  fs.writeFileSync(destinationFile, template({
    keywords: conref.getKeys(),
  }));
}

writeFile('./tovscodesnippets.json.tmpl', destinationFile);
