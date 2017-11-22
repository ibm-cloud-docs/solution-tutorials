var ghpages = require('gh-pages');
ghpages.publish('builddocs/output', {
  repo: 'https://' + process.env.GH_PAGES_TOKEN + '@github.ibm.com/Bluemix-Docs/tutorials.git',
  user: {
    email: 'autobuild@not-a-dom.ain',
    name: 'autobuild'
  }
}, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Publish complete');
  }
});
