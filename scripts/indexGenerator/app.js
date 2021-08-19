const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');
const helper = require('./helper');

// load handlebar helpers
require('handlebars-helpers')();
helper.registerHelpers(Handlebars);

const input = require('./input.json');
const categories = input.categories;
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []);
const featured = solutions
  .filter((solution) => solution.featuredPosition)
  .sort((sol1, sol2) => sol1.featuredPosition - sol2.featuredPosition);


// inject last updated into the JSON
solutions.filter((solution) => !helper.isExternalSolution(solution)).forEach((solution) => {
  const pathToSolution = `../../${helper.htmlTomd(solution.url)}`;

  const solutionContent = fs.readFileSync(pathToSolution).toString();
  const dateStartPosition = solutionContent.indexOf('lastupdated:');
  if (dateStartPosition >= 0) {
    const dateEndPosition = solutionContent.indexOf('\n', dateStartPosition);
    const lastUpdated = solutionContent
      .substring(dateStartPosition + 'lastupdated:'.length, dateEndPosition)
      .trim()
      .replace(/"/g, '');
    solution.lastUpdated = lastUpdated;
  }
});

const tagsSet = new Set();
solutions.forEach((solution) => {
  if (solution.tags) {
    solution.tags.forEach((tag) => tagsSet.add(tag));
  }
});
const tags = Array.from(tagsSet).sort();
console.log(tags);

function writeFile(templateFile, dest, includeHidden = true) {
  console.log(`Writing ${dest}`);

  const indexTemplateSource = fs.readFileSync(templateFile);
  const indexTemplate = Handlebars.compile(`${indexTemplateSource}`);

  fs.writeFileSync(dest, indexTemplate({
    lastupdated: moment().format('YYYY-MM-DD'),
    categories,
    featured,
    tags: input.tags,
    includeHidden,
  }));
}

writeFile('./toc.yaml.tmpl', '../../toc.yaml');
writeFile('./toc.yaml.tmpl', '../../toc-public.yaml', false);

console.log('Writing ../../tutorials.json');
input.categories = input.categories.filter((category) => !category.hidden);
input.categories.forEach((category) => {
  category.solutions = category.solutions.filter((solution) => !solution.hidden && !helper.isExternalSolution(solution));
  category.solutions.forEach((solution) => {
    delete solution.requirements;
    delete solution.supportsCloudShell;
    delete solution.cloudShellComments;
  });
});
fs.writeFileSync('../../tutorials.json', JSON.stringify(input, null, 2));

console.log('Done!');
