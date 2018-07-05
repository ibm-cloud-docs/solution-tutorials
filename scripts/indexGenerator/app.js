const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');

Handlebars.registerHelper('replace', function( find, replace, options) {
  const string = options.fn(this);
  return string.replace( find, replace );
});

Handlebars.registerHelper('hasTag', function( solution, tag, options) {
  const string = options.fn(this);
  return (solution.tags.indexOf(tag) >= 0) ? string : null;
});

const input = require('./input.json');
const categories = input.categories;
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []);
const featured = solutions
  .filter((solution) => solution.featuredPosition)
  .sort((sol1, sol2) => sol1.featuredPosition - sol2.featuredPosition);

// const tagsSet = new Set();
// solutions.forEach((solution) => solution.tags.forEach((tag) => tagsSet.add(tag)));
// const tags = Array.from(tagsSet).sort();
// console.log(tags);

function writeFile(templateFile, dest) {
  console.log(`Writing ${dest}`);

  const indexTemplateSource = fs.readFileSync(templateFile);
  const indexTemplate = Handlebars.compile(`${indexTemplateSource}`);

  fs.writeFileSync(dest, indexTemplate({
    date: moment().format('YYYY-MM-DD'),
    categories,
    featured,
    tags: input.tags,
  }));
}

writeFile('./index.tmpl.md', '../../index.md');
writeFile('./index-redesign.tmpl.md', '../../index-redesign.md');
writeFile('./toc.tmpl.md', '../../toc');

console.log('Done!');
