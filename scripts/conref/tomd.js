const yaml = require('js-yaml');
const fs = require('fs');
const Handlebars = require('handlebars');

const destination = process.argv[2] || './conref.md'

// Get document, or throw exception on error
const doc = yaml.safeLoad(fs.readFileSync('../builddocs/cloudoeconrefs.yml', 'utf8'));
// console.log(doc);

const templateSource = fs.readFileSync('./tomd.tmpl.md');
const template = Handlebars.compile(`${templateSource}`);

Handlebars.registerHelper('value', function( aKey, options) {
  return doc.keyword[aKey];
});

console.log('Writing to', destination);
fs.writeFileSync(destination, template({
  keywords: Object.keys(doc.keyword),
}));
