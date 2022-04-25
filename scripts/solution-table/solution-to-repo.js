const octokit = require('octokit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const helper = require('../indexGenerator/helper');
const input = require('../indexGenerator/input.json');
const categories = input.categories;

async function main() {
  const solutions = helper.getSolutions(categories, false);

  // Team / Layer / Title / Git / Asset Type / IaC Technology / Visibility / Owner / State / Target Delivery / GTM / Priority / Revenue Impact / Support / Category
  const csv = createCsvWriter({
    path: 'solution-to-repo.csv',
    header: [
      { id: 'team', title: 'Team' },
      { id: 'layer', title: 'Layer' },
      { id: 'title', title: 'Title' },
      { id: 'git', title: 'Git' },
      { id: 'assetType', title: 'Asset Type' },
      { id: 'iac', title: 'IaC Technology' },
      { id: 'visibility', title: 'Visibility' },
      { id: 'owner', title: 'Owner' },
      { id: 'state', title: 'State' },
      { id: 'targetDelivery', title: 'Target Delivery' },
      { id: 'gtm', title: 'GTM' },
      { id: 'priority', title: 'Priority' },
      { id: 'revenue', title: 'Revenue Impact' },
      { id: 'support', title: 'Support' },
      { id: 'category', title: 'Category' },
      { id: 'url', title: 'Public URL' },
    ]
  });

  const github = new octokit.Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  for (const solution of solutions) {
    if (solution.repos) {
      for (const url of solution.repos) {
        const repoElements = url.split('/')
        const owner = repoElements[3];
        const repo = repoElements[4];
        console.log(`${owner}/${repo}`);
        const languages = (await github.request('GET /repos/{owner}/{repo}/languages', {
          owner,
          repo
        })).data;
        console.log(languages);

        let iac = null;
        if (languages.hasOwnProperty('HCL')) {
          iac = "Terraform";
        } else if (languages.hasOwnProperty('Shell')) {
          iac = "Script";
        } else if (languages.hasOwnProperty('Dockerfile')) {
          iac = "Docker";
        }

        await csv.writeRecords([{
          team: 'Portfolio Solutions',
          title: solution.name,
          owner: 'Frederic Lavigne',
          iac,
          git: url,
          assetType: 'Solution Blueprint',
          state: 'Released',
          category: solution.tags[0],
          url: `https://cloud.ibm.com${helper.htmlLink(solution)}`,
        }]);
      }
    }
  }
}


main();