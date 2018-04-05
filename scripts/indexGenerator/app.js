const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');

Handlebars.registerHelper('replace', function( find, replace, options) {
  const string = options.fn(this);
  return string.replace( find, replace );
});

console.log('Writing index.md');

const indexTemplateSource = fs.readFileSync('./index.tmpl.md');
const indexTemplate = Handlebars.compile(`${indexTemplateSource}`);

fs.writeFileSync('../../index.md', indexTemplate({
  categories: require('./input.json'),
  date: moment().format('YYYY-MM-DD'),
}));

console.log('Writing toc');

const tocTemplateSource = fs.readFileSync('./toc.tmpl.md');
const tocTemplate = Handlebars.compile(`${tocTemplateSource}`);

fs.writeFileSync('../../toc', tocTemplate({
  categories: require('./input.json'),
  date: moment().format('YYYY-MM-DD'),
}));

console.log('Done!');
