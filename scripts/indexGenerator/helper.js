exports.htmlTomd = function(filename) {
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
};

exports.isExternalSolution = function(solution) {
  return solution.url.indexOf('/') >= 0;
};
