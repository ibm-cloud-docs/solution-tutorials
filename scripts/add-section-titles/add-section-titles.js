const fs = require('fs');
const { exit } = require('process');

const rewrite = true

let directory = '../..'
let tutorials = fs.readdirSync(directory);
tutorials = tutorials.filter(file => file.endsWith('.md') && file !== 'README.md' && file !== 'index.md');

const allSectionIds = new Set();

function readUntil(array, start, match) {
  for (let index = start; index < array.length; index++) {
    const element = array[index];
    if (match(element)) {
      return index;
    }
  }
  return null;
}

tutorials.forEach((file) => {
  function log(...data) {
    console.log(`[${file}] ${data}`);
  }

  filename = `${directory}/${file}`;

  log(`Processing ${file}...`);
  const lines = fs.readFileSync(filename).toString('utf-8').split('\n');

  let sectionPrefix = file.replace('.md', '')
  log(`Using ${sectionPrefix} as prefix`);


  let sectionTitleIndex = 0;
  let sectionIndex = 0;
  while ((sectionTitleIndex = readUntil(lines, sectionTitleIndex, (line) => line.startsWith('## '))) != null) {
    const section = lines[sectionTitleIndex];
    const anchor = lines[sectionTitleIndex + 1];
    if (!(anchor.startsWith('{: #') || anchor.startsWith('{:#'))) {
      log(`No anchor found for section ${section}, adding one`);
      lines.splice(sectionTitleIndex + 1, 0, `{: #${sectionPrefix}-${sectionIndex}}`);
    } else {
      sectionId = anchor.trim()
        .replace('{:', '')
        .replace('#', '')
        .replace(' ', '')
        .replace('}', '');
      if (!sectionId.startsWith(sectionPrefix)) {
        lines[sectionTitleIndex + 1] = `{: #${sectionPrefix}-${sectionId}}`
      }
      if (allSectionIds.has(sectionId)) {
        log(`Duplicate ID ${sectionId}`);
      }
      allSectionIds.add(sectionId)
    }

    sectionTitleIndex = sectionTitleIndex + 1;
    sectionIndex = sectionIndex + 1;
  }

  // bring back everything together
  if (rewrite) {
    log('Rewriting...');
    fs.writeFileSync(filename, lines.join('\n'));
  }
});