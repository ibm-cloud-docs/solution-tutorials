const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');

const indexTemplateSource = fs.readFileSync('./index.tmpl.md');
const indexTemplate = Handlebars.compile(`${indexTemplateSource}`);

fs.writeFileSync('../../index.md', indexTemplate({
  categories: require('./input.json'),
  date: moment().format('YYYY-MM-DD'),
}));
