const yaml = require('js-yaml');
const fs = require('fs');
const Handlebars = require('handlebars');

const destinationFolder = process.argv[2] || '.'

// Get document, or throw exception on error
const doc = yaml.safeLoad(fs.readFileSync('../../builddocs/cloudoeconrefs.yml', 'utf8'));
// console.log(doc);

Handlebars.registerHelper('value', function( aKey, options) {
  return doc.keyword[aKey];
});

Handlebars.registerHelper('placeholder', function( aKey, options) {
  return `{{site.data.keyword.${aKey}}}`;
});

function writeFile(templateFile, destinationFile) {
  const templateSource = fs.readFileSync(templateFile);
  const template = Handlebars.compile(`${templateSource}`);

  console.log('Writing to', destinationFile);
  fs.writeFileSync(destinationFile, template({
    keywords: Object.keys(doc.keyword),
  }));
}

writeFile('./tomd.md.tmpl', `${destinationFolder}/conref.md`);
writeFile('./tovscodesnippets.json.tmpl', `${destinationFolder}/vscodesnippets.json`);
