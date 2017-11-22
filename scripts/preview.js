var ghpages = require('gh-pages');
ghpages.publish('builddocs/output', {
  repo: 'https://' + process.env.GH_PAGES_TOKEN + '@github.ibm.com/Bluemix-Docs/tutorials.git'
  silent: true
}, function(err) {});
