const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');

Handlebars.registerHelper('replace', function( find, replace, options) {
  const string = options.fn(this);
  return string.replace( find, replace );
});

const categories = require('./input.json');
const featured = categories
  .reduce((previousValue, currentValue) => {
    return previousValue.concat(currentValue.solutions);
  }, [])
  .filter((solution) => solution.featuredPosition)
  .sort((sol1, sol2) => sol1.featuredPosition - sol2.featuredPosition);


function writeFile(templateFile, dest) {
  console.log(`Writing ${dest}`);

  const indexTemplateSource = fs.readFileSync(templateFile);
  const indexTemplate = Handlebars.compile(`${indexTemplateSource}`);

  fs.writeFileSync(dest, indexTemplate({
    date: moment().format('YYYY-MM-DD'),
    categories,
    featured,
  }));
}

writeFile('./index.tmpl.md', '../../index.md');
writeFile('./index-redesign.tmpl.md', '../../index-redesign.md');
writeFile('./toc.tmpl.md', '../../toc');

console.log('Done!');
