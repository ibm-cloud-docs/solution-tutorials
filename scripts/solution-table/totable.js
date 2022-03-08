const yaml = require('js-yaml');
const fs = require('fs');
const Handlebars = require('handlebars');
const helper = require('../indexGenerator/helper');

helper.registerHelpers(Handlebars);
require('handlebars-helpers')();

const destinationDir = process.argv[2] || '.'

const input = require('../indexGenerator/input.json');
const categories = input.categories;
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions || []);
}, []).filter((solution) => !helper.isExternalSolution(solution));
solutions.forEach(solution => {
  solution.mdUrl = helper.htmlTomd(solution.url);
});
solutions.sort((s1, s2) => s1.mdUrl.localeCompare(s2.mdUrl));

{
  const templateSource = fs.readFileSync('./totable.md.tmpl');
  const template = Handlebars.compile(`${templateSource}`);
  const destination = destinationDir + './solution-table.md';
  console.log('Writing to', destination);
  fs.writeFileSync(destination, template({
    solutions,
  }));
}

{
  const templateSource = fs.readFileSync('./salesplay.md.tmpl');
  const template = Handlebars.compile(`${templateSource}`);
  const destination = destinationDir + './salesplay.md';
  console.log('Writing to', destination);
  fs.writeFileSync(destination, template({
    categories,
  }));
}

{
  const templateSource = fs.readFileSync('./solution-to-services.md.tmpl');
  const template = Handlebars.compile(`${templateSource}`);
  const destination = destinationDir + './solution-to-services.md';
  console.log('Writing to', destination);
  fs.writeFileSync(destination, template({
    categories,
  }));
}