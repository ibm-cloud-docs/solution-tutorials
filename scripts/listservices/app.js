const fs = require('fs');
const helper = require('../indexGenerator/helper');
const conref = require('../conref/conref');

const input = require('../indexGenerator/input.json');
const categories = input.categories.filter(category => !category.hidden);
const solutions = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []);


const referencesPattern = /\[([^\]]*)\]\(([^)]*)\)/gm;
function getServiceName(text) {
  return conref.doReplacements(text.replace(referencesPattern, function(group, linkTitle, linkTarget) {//group, reference) {
    return linkTitle;//`[${linkTitle}](${makeFilename(linkTarget.substring(1))}.md)`;
  }))
    .replace(/&reg;/g, '')
    .replace(/&trade;/g, '');
}

const csvRecords = [];

// update the .md lastupdated dates based on file modification
solutions.filter((solution) => !helper.isExternalSolution(solution)).forEach(async (solution) => {
  const pathToSolution = `../../${helper.htmlTomd(solution.url)}`;
  const solutionContent = fs.readFileSync(pathToSolution).toString();

  const lines = solutionContent.split('\n').filter(line => line.trim().length > 0);
  let startIndex = lines.indexOf("This tutorial uses the following runtimes and services:");
  if (startIndex < 0) {
    console.log('No service listed', pathToSolution);
    return;
  }

  let services = [];
  startIndex++;
  do {
    line = lines[startIndex].trim();
    if (line.startsWith('*') || line.startsWith('-')) {
      // console.log('  adding service', line);
      services.push(line.substring(1).trim());
    } else {
      break;
    }
    startIndex++;
  } while(true)

  if (services.length === 0) {
    console.log('No services for', pathToSolution);
    return;
  }

  services = services.map(service => getServiceName(service)).sort();

  csvRecords.push({
      name: solution.name,
      services: services.join(', '),
      url: `https://cloud.ibm.com${helper.htmlLink(solution)}`,
    });
});

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'services.csv',
    header: [
        {id: 'name', title: 'NAME'},
        {id: 'services', title: 'SERVICES'},
        {id: 'url', title: 'URL'}
    ]
});
csvWriter.writeRecords(csvRecords);