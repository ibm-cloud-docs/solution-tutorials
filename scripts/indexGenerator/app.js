const fs = require('fs');
const moment = require('moment');
const Handlebars = require('handlebars');

Handlebars.registerHelper('replace', function( find, replace, options) {
  const string = options.fn(this);
  return string.replace( find, replace );
});

function htmlTomd(filename) {
  let string = filename.replace('.html', '.md');

  const slash = string.lastIndexOf('/');
  if (slash >= 0) {
    string = string.substring(slash + 1);
  }
  const query = string.indexOf('?');
  if (query >= 0) {
    string = string.substring(0, query);
  }
  return string;
}

function isExternalSolution(solution) {
  return solution.url.indexOf('/') >= 0;
}

Handlebars.registerHelper('tocLink', function(solution, options) {
  if (isExternalSolution(solution)) {
    return `[${solution.name}](${solution.url})]`;
  } else {
    return htmlTomd(solution.url);
  }
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

// inject last updated into the JSON by extract "lastupdated" from the .md
solutions.filter((solution) => !isExternalSolution(solution)).forEach((solution) => {
  const solutionContent = fs.readFileSync(`../../${htmlTomd(solution.url)}`).toString();
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
solutions.forEach((solution) => solution.tags.forEach((tag) => tagsSet.add(tag)));
const tags = Array.from(tagsSet).sort();
console.log(tags);

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
writeFile('./toc.tmpl.md', '../../toc');

console.log('Writing ../../tutorials.json');
input.categories = input.categories.filter((category) => !category.hidden);
input.categories.forEach((category) => {
  category.solutions = category.solutions.filter((solution) => !solution.hidden && !isExternalSolution(solution));
});
fs.writeFileSync('../../tutorials.json', JSON.stringify(input, null, 2));

console.log('Done!');
