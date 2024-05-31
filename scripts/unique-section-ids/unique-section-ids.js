const fs = require('fs');
const { exit } = require('process');

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

let exitCode = 0;

tutorials.forEach((file) => {
  function log(...data) {
    console.log(`[${file}] ${data}`);
  }

  filename = `${directory}/${file}`;

  // console.log(`Processing ${file}...`);
  const lines = fs.readFileSync(filename).toString('utf-8').split('\n');

  let sectionPrefix = file.replace('.md', '')

  let sectionTitleIndex = 0;
  let sectionIndex = 0;
  while ((sectionTitleIndex = readUntil(lines, sectionTitleIndex,
      (line) => line.startsWith('## ') || line.startsWith('### ') || line.startsWith('#### '))) != null) {
    const section = lines[sectionTitleIndex];
    const anchor = lines[sectionTitleIndex + 1];
    if (!(anchor.startsWith('{: #') || anchor.startsWith('{:#'))) {
      log(`No anchor found for section ${section}`);
      lines.splice(sectionTitleIndex + 1, 0, `{: #${sectionPrefix}-${sectionIndex}}`);
      exitCode = 1
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
        lines[sectionTitleIndex + 1] = `{: #${sectionPrefix}-${sectionIndex}}`
        exitCode = 1
      }
      allSectionIds.add(sectionId)
    }

    sectionTitleIndex = sectionTitleIndex + 1;
    sectionIndex = sectionIndex + 1;
  }
});

exit(exitCode);
