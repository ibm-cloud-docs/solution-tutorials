const yaml = require('js-yaml');
const fs = require('fs');
const Handlebars = require('handlebars');

const destination = process.argv[2] || './solution-table.md'

const helper = require('../indexGenerator/helper');
const input = require('../indexGenerator/input.json');
const categories = input.categories;
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []).filter((solution) => !helper.isExternalSolution(solution));
solutions.forEach(solution => {
  solution.mdUrl = helper.htmlTomd(solution.url);
});
solutions.sort((s1, s2) => s1.mdUrl.localeCompare(s2.mdUrl));

const templateSource = fs.readFileSync('./totable.md.tmpl');
const template = Handlebars.compile(`${templateSource}`);

console.log('Writing to', destination);
fs.writeFileSync(destination, template({
  solutions,
}));
