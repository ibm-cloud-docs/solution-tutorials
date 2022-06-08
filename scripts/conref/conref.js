function doReplacements(text) {
  let processed = text;
  Object.keys(replacements).forEach(key => {
    processed = processed.replace(new RegExp(key, 'g'), replacements[key]);
  });
  return processed;
}

function getKeys() {
  return keywords;
}

function getValue(key) {
  return replacements[`{{site.data.keyword.${key}}}`];
}

const conref = require('read-yaml').sync('../../builddocs/markdown/cloudoekeyrefs.yml');
const replacements = {};
const keywords = Object.keys(conref.keyword);
Object.keys(conref.keyword).forEach(key => {
  replacements[`{{site.data.keyword.${key}}}`] = conref.keyword[key];
});
// ignore all {: #header}, {:tip}, etc.
replacements['{:(.*)}'] = '';

module.exports = { doReplacements, getValue, getKeys };
