const fs = require('fs');
const { exit } = require('process');

const filename = '../../scalable-webapp-kubernetes.md';
const template = fs.readFileSync(filename).toString('utf-8');

const input = require('../indexGenerator/input.json');
const categories = input.categories;
const tutorial = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []).find((solution) => filename.indexOf('/' + solution.url.replace('.html', '.md')) >=0);
if (!tutorial) {
  console.log('Tutorial not found');
  exit(1);
}
console.log(`Processing ${tutorial.url} (${tutorial.name})...`);

// find the services used in this tutorial by parsing the tags
const tagMapping = {
  'Kubernetes': 'containers',
  'Container Service': 'containers',
  'Container Registry': 'Registry',
  'Code Engine': 'codeengine',
  'VPC': 'vpc',
  'cloudant': 'Cloudant',
  'Cloud Functions': 'openwhisk',
  'Cloud Foundry': 'cloud-foundry-public',
  'OpenShift': 'openshift',
  'Log Analysis': 'Log-Analysis-with-LogDNA',
  'logdna': 'Log-Analysis-with-LogDNA',
  'sysdig': 'Monitoring-with-Sysdig',
  'Cloud Object Storage': 'cloud-object-storage',
  'cloud_object_storage': 'cloud-object-storage',
  'container_registry': 'Registry',
  'content_delivery_network': 'CDN',
  'Content Delivery Network': 'CDN',
  'Message hub': 'EventStreams',
  'event_stream': 'EventStreams',
  'virtual_servers': 'virtual-servers',
  'terraform': 'terraform',
  'databases_for_mongodb': 'databases-for-mongodb',
  'db2_warehouse': 'Db2whc',
  'api_gateway': 'api-gateway',
  'API Gateway': 'api-gateway',
  'cloud_internet_services': 'cis',
  'certificate_manager': 'certificate-manager',
  'IBM Watson Assistant': 'assistant',
  'db2_on_cloud': 'Db2onCloud',
  'watson_assistant': 'assistant',
  'speech_to_text': 'speech-to-text',
  'text_to_speech': 'text-to-speech',
  'continuous_delivery': 'ContinuousDelivery',
  'api_connect': 'apiconnect',
  'app_id': 'appid',
  'key_protect': 'key-protect',
  'analytics_engine': 'AnalyticsEngine',
  'cognos_dashboard': 'cognos-dashboard-embedded',
  'iot_platform': 'IoT',
  'virtual_router_appliance': 'virtual-router-appliance',
  'vmware': 'vmwaresolutions',
  'schematics': 'schematics',
  'Activity Tracker': 'Activity-Tracker-with-LogDNA',
}

const servicesMap = {};
tutorial.tags.concat(tutorial.requirements).forEach(value => {
  if (tagMapping[value]) {
    servicesMap[tagMapping[value]] = true
  };
});

if (Object.keys(servicesMap).length == 0) {
  console.log('No services found');
  exit(1);
}

const services = Object.keys(servicesMap).join(', ');
console.log(`Services used: ${services}`);

const lines = template.split('\n');

// front matter

const endOfFrontMatterIndex = readUntil(lines, 0, (value) => value.startsWith('lasttested'));
if (endOfFrontMatterIndex == -1) {
  console.log('No last tested in this tutorial');
  exit(1);
}

// const endOfFrontMatterIndex = lines.indexOf('---', 1);
// if (endOfFrontMatterIndex == -1) {
//   console.log('End of front-matter not found!');
//   exit(1);
// }
lines.splice(endOfFrontMatterIndex +  1, 0,
  '',
  'content-type: tutorial',
  `services: ${services}`,
  'account-plan:',
  'completion-time:'
);

function readUntil(array, start, match) {
  for (let index = start; index < array.length; index++) {
    const element = array[index];
    if (match(element)) {
      return index;
    }
  }
  return null;
}

// insert the new attribute definition
const firstAttributeDefinitionIndex = readUntil(lines, endOfFrontMatterIndex, (value) => {
  return value.startsWith('{:')
});
lines.splice(firstAttributeDefinitionIndex - 1, 0,
  '{:step: data-tutorial-type=\'step\'}'
);

// first H1
const firstH1Index = lines.findIndex((value) => {
  return value.startsWith('# ');
});
if (firstH1Index == -1) {
  console.log('No H1 found');
  exit(1);
}
lines.splice(firstH1Index + 1, 0, 
  '{: toc-content-type="tutorial"}',
  `{: toc-services="${services}"}`,
  '{: toc-completion-time=""}'
);

const notAStep = [
  'Services used',
  'Architecture',
  'Objectives',
  'Before you begin',
  'Expand the tutorial',
  'Related content'
];
// all H2
currentH2Index = firstH1Index;
while ((currentH2Index = readUntil(lines, currentH2Index, (value) => {
  return value.startsWith('## ');
}))) {

  if (notAStep.find((toIgnore) => {
    return lines[currentH2Index].indexOf(toIgnore) >= 0
  })) {
    currentH2Index = currentH2Index +1;
    continue;
  }

  if (lines[currentH2Index + 1].startsWith('{:')) {
    currentH2Index = currentH2Index + 1;
  }

  lines.splice(currentH2Index + 1, 0, 
    '{: step}'
  );

  currentH2Index = currentH2Index + 2;
}

// bring back everything together
// fs.writeFileSync(filename, lines.join('\n'));