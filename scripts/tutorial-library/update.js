const fs = require('fs');
const { exit } = require('process');

const filename = process.argv[2];
const template = fs.readFileSync(filename).toString('utf-8');

const rewrite = process.argv[3] == "true"

function log(...data) {
  console.log(`[${filename}] ${data}`);
}

const input = require('../indexGenerator/input.json');
const categories = input.categories;
const tutorial = categories.reduce((previousValue, currentValue) => {
  return previousValue.concat(currentValue.solutions);
}, []).find((solution) => filename.indexOf('/' + solution.url.replace('.html', '.md')) >=0);
if (!tutorial) {
  log('Tutorial not found');
  exit(1);
}
log(`Processing ${tutorial.url} (${tutorial.name})...`);

function readUntil(array, start, match) {
  for (let index = start; index < array.length; index++) {
    const element = array[index];
    if (match(element)) {
      return index;
    }
  }
  return null;
}

// find the services used in this tutorial by parsing the tags
const tagMapping = {
  'keyword.registry': 'Registry',
  'keyword.containers': 'containers',
  'Kubernetes': 'containers',
  'kubernetes': 'containers',
  'Container Service': 'containers',
  'Container Registry': 'Registry',
  'Code Engine': 'codeengine',
  'VPC': 'vpc',
  'vpc': 'vpc',
  'Virtual Private Cloud': 'vpc',
  'cloudant': 'Cloudant',
  'Cloud Functions': 'openwhisk',
  'OpenShift': 'openshift',
  'Log Analysis': 'Log-Analysis-with-LogDNA',
  'monitoring': 'Monitoring-with-Sysdig',
  'logdna': 'Log-Analysis-with-LogDNA',
  'logging': 'Log-Analysis-with-LogDNA',
  'sysdig': 'Monitoring-with-Sysdig',
  'Cloud Object Storage': 'cloud-object-storage',
  'cloud_object_storage': 'cloud-object-storage',
  'container_registry': 'Registry',
  'content_delivery_network': 'CDN',
  'Content Delivery Network': 'CDN',
  'cdn': 'CDN',
  'Message hub': 'EventStreams',
  'event_stream': 'EventStreams',
  'message-hub': 'EventStreams',
  'messagehub': 'EventStreams',
  'virtual_servers': 'virtual-servers',
  'terraform': 'terraform',
  'databases_for_mongodb': 'databases-for-mongodb',
  'db2_warehouse': 'Db2whc',
  'api_gateway': 'api-gateway',
  'API Gateway': 'api-gateway',
  'cloud_internet_services': 'cis',
  'certificate_manager': 'certificate-manager',
  'cloudcerts':'certificate-manager',
  'IBM Watson Assistant': 'assistant',
  'db2_on_cloud': 'Db2onCloud',
  'Db2_on_Cloud': 'Db2onCloud',
  'vlans': 'vlans',
  'watson_assistant': 'assistant',
  'conversation': 'assistant',
  'sqlquery': 'sql-query',
  'load-balancer': 'loadbalancer-service',
  'speech_to_text': 'speech-to-text',
  'text_to_speech': 'text-to-speech',
  'continuous_delivery': 'ContinuousDelivery',
  'api_connect': 'apiconnect',
  'security-advisor': 'security-advisor',
  'app_id': 'appid',
  'key_protect': 'key-protect',
  'iae': 'AnalyticsEngine',
  'virtual-server': 'virtual-servers',
  'analytics_engine': 'AnalyticsEngine',
  'cognos_dashboard': 'cognos-dashboard-embedded',
  'iot_platform': 'IoT',
  'iot_': 'IoT',
  'virtual_router_appliance': 'virtual-router-appliance',
  'vmware': 'vmwaresolutions',
  'schematics': 'schematics',
  'activitytracker': 'Activity-Tracker-with-LogDNA',
  'Activity Tracker': 'Activity-Tracker-with-LogDNA',
  'Vyatta': 'virtual-router-appliance',
  'Push Notifications': 'mobilepush',
  'push-notifications': 'mobilepush',
  'openwhisk': 'openwhisk',
  'iam': 'account',
  'visualrecognition': 'visual-recognition',
  'contdelivery': 'ContinuousDelivery',
  'dashdblong': 'Db2whc',
  'hscrypto': 'hs-crypto',
  'streaminganalytics': 'StreamingAnalytics',
  'filestorage': 'FileStorage',
  'dns': 'dns',
  'postgresql': 'databases-for-postgresql',
  'transit-gateway': 'transit-gateway',
  'toneanalyzer': 'tone-analyzer',
  'data-shield': 'data-shield',
}

const servicesMap = {};
tutorial.tags.concat(tutorial.requirements).forEach(value => {
  if (tagMapping[value]) {
    servicesMap[tagMapping[value]] = true
  };
});

if (Object.keys(servicesMap).length == 0) {
  log('No services found');
  exit(1);
}

const lines = template.split('\n');
if (readUntil(lines, 0, (value) => value.indexOf('content-type: tutorial') >= 0)) {
  log('Already processed');
  exit(0);
}

// remove the "Services used" section and extract the services used
const servicesUsedIndex = readUntil(lines, 0, (value) => value.startsWith('## Services '));
if (servicesUsedIndex) {
  const nextSectionIndex = readUntil(lines, servicesUsedIndex + 1, (value) => (value.startsWith('## ')));

  const servicesUsed = lines.filter((value, index) => {
    if (index > servicesUsedIndex && index < nextSectionIndex && (value.trim().startsWith('* ') || value.trim().startsWith('- '))) {
      return true;
    } else {
      return false;
    }
  })

  servicesUsed.forEach((service) => {
    let found = false;
    Object.keys(tagMapping).forEach((key) => {
      if (service.indexOf(key) >= 0 || service.indexOf(tagMapping[key]) >= 0) {
        servicesMap[tagMapping[key]] = true;
        found = true;
      }
    });
    if (!found) {
      log(`Service not found: ${service}`);
    }
  });

  lines.splice(servicesUsedIndex, nextSectionIndex - servicesUsedIndex);
} else {
  log('No services used section found');
}

const services = Object.keys(servicesMap).join(', ');
log(`Services used: ${services}`);

// front matter
const endOfFrontMatterIndex = readUntil(lines, 0, (value) => value.startsWith('lasttested'));
if (endOfFrontMatterIndex == -1) {
  log('No last tested in this tutorial');
  exit(1);
}

lines.splice(endOfFrontMatterIndex +  1, 0,
  '',
  'content-type: tutorial',
  `services: ${services}`,
  'account-plan:',
  'completion-time:'
);

// insert the new attribute definition
const firstAttributeDefinitionIndex = readUntil(lines, endOfFrontMatterIndex, (value) => {
  return value.startsWith('{:')
});
lines.splice(firstAttributeDefinitionIndex, 0,
  '{:step: data-tutorial-type=\'step\'}'
);

// first H1
let firstH1Index = lines.findIndex((value) => {
  return value.startsWith('# ');
});
if (firstH1Index == -1) {
  log('No H1 found');
  exit(1);
}
if (lines[firstH1Index + 1].startsWith('{')) {
  firstH1Index++;
}

lines.splice(firstH1Index + 1, 0, 
  '{: toc-content-type="tutorial"}',
  `{: toc-services="${services}"}`,
  '{: toc-completion-time=""}'
);

// insert the reference to the cost just after the title, as a tip
const insertCostTipIndex = readUntil(lines, firstH1Index + 1, (value) => (value.trim().length == 0 || !value.startsWith('{')));
lines.splice(insertCostTipIndex, 0,
  '',
  '<!--##istutorial#-->',
  'This tutorial may incur costs. Use the [Cost Estimator](https://{DomainName}/estimator/review) to generate a cost estimate based on your projected usage.',
  '{: tip}',
  '<!--#/istutorial#-->'
);

// remove the architecture section
const architectureIndex = readUntil(lines, firstH1Index, (value) => value.startsWith('## Architecture'));
if (architectureIndex) {
  lines.splice(architectureIndex, 2);
} else {
  log('No architecture section found');
}

// all H2
const notAStep = [
  'Services used',
  'Architecture',
  'Objectives',
  'Before you begin',
  'Expand the tutorial',
  'Related content'
];
currentH2Index = 0;
while ((currentH2Index = readUntil(lines, currentH2Index, (value) => {
  return value.startsWith('## ');
}))) {

  if (notAStep.find((toIgnore) => {
    return lines[currentH2Index].toLowerCase().indexOf(toIgnore.toLowerCase()) >= 0
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
if (rewrite) {
  fs.writeFileSync(filename, lines.join('\n'));
}