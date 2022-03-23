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
exports.htmlTomd = htmlTomd;

function isExternalSolution(solution) {
  return solution.url.indexOf('/') >= 0;
}
exports.isExternalSolution = isExternalSolution;

function htmlLink(solution) {
  if (exports.isExternalSolution(solution)) {
    return solution.url;
  } else {
    const topic = solution.url.substring(0, solution.url.indexOf('.'));
    return `/docs/solution-tutorials?topic=solution-tutorials-${topic}#${topic}`;
  }
}
exports.htmlLink = htmlLink;

exports.registerHelpers = function(Handlebars) {
  Handlebars.registerHelper('replace', function( find, replace, options) {
    const string = options.fn(this);
    return string.replace( find, replace );
  });

  Handlebars.registerHelper('tocLink', function(solution, options) {
    if (isExternalSolution(solution)) {
      return solution.name ? `[${solution.name}](${solution.url})]` : solution.url;
    } else {
      return htmlTomd(solution.url);
    }
  });

  Handlebars.registerHelper('htmlLink', function(solution, options) {
    return htmlLink(solution);
  });

  Handlebars.registerHelper('hasTag', function( solution, tag, options) {
    const string = options.fn(this);
    return (solution.tags && solution.tags.indexOf(tag) >= 0) ? string : null;
  });
}

exports.getSolutions = function(categories, includeHidden = true) {
  const solutions = categories.reduce((previousValue, category) => {
    if (category.hidden && !includeHidden) {
      return previousValue;
    } else {
      return previousValue.concat(category.solutions || []);
    }
  }, []).filter((solution) => {
    if (solution.hidden && !includeHidden) {
      return false;
    } else {
      return !isExternalSolution(solution);
    }
  });
  return solutions;
}