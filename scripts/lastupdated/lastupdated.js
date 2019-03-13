const fs = require('fs');
const moment = require('moment');
const helper = require('../indexGenerator/helper');

const input = require('../indexGenerator/input.json');
const categories = input.categories;
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []);

// update the .md lastupdated dates based on file modification
solutions.filter((solution) => !helper.isExternalSolution(solution)).forEach((solution) => {
  const pathToSolution = `../../${helper.htmlTomd(solution.url)}`;

  // get file last modified
  const modifiedTime = fs.statSync(pathToSolution).mtime;
  const lastUpdated = moment(modifiedTime).format('YYYY-MM-DD');

  const solutionContent = fs.readFileSync(pathToSolution).toString();
  const dateStartPosition = solutionContent.indexOf('lastupdated:');
  if (dateStartPosition >= 0) {
    const dateEndPosition = solutionContent.indexOf('\n', dateStartPosition);
    newSolutionContent = solutionContent.substring(0, dateStartPosition) +
      `lastupdated: "${lastUpdated}"\n` +
      solutionContent.substring(dateEndPosition+1);
    if (newSolutionContent !== solutionContent) {
      fs.writeFileSync(pathToSolution, newSolutionContent);
    }
    solution.lastUpdated = lastUpdated;
  }
});
