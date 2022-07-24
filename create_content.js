const fs = require('fs');
const Papa = require('papaparse');
const {kebabCase, uniq} = require('lodash');

const createContent = item => {
  return `\
---
title: ${JSON.stringify(item.eva_number)}
date: 2022-07-24T00:00:00-05:00
draft: false
country: ${JSON.stringify(item.country)}
crew: ${JSON.stringify(item.crew)}
vehicle: ${JSON.stringify(item.vehicle)}
param_date: ${JSON.stringify(item.param_date)}
duration: ${JSON.stringify(item.duration)}
purpose: ${JSON.stringify(item.purpose)}
---
`;
};

const mapData = parsed => {
  let items = parsed.data.map(row => {
    return {
      eva_number: row[0],
      country: row[1],
      crew: row[2],
      vehicle: row[3],
      param_date: row[4],
      duration: row[5],
      purpose: row[6]
    };
  });

  // Remove the header row
  items.shift();

  // Cleanup
  items = items.filter(item => {
    return !!item.title;
  });

  items = uniq(items);

  return items;
};

const writeContent = items => {
  // Skipping these to prevent hugo error:
  // Error: Error building site: "/Users/zacharybetz/dev/playground/hugo/hugo-client-side-search-template/content/87.md:2:1": failed to unmarshal YAML: yaml: control characters are not allowed
  const blockList = ['137', '233', '257', '356', '370', '371', '87'];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (blockList.includes(item.eva_number)) {
      continue;
    }
    const content = createContent(item);
    const filePath = `./content/${kebabCase(item.eva_number)}.md`;
    fs.writeFileSync(filePath, content, {encoding: 'utf-8'});
  }
};

const main = () => {
  const csv = fs.readFileSync('./data/extra_vehicular_activity.csv', {
    encoding: 'utf-8'
  });

  const parsed = Papa.parse(csv);
  // console.log(parsed.data.slice(0, 2));
  // console.log(parsed.data.length);

  const items = mapData(parsed);
  // console.log(items.slice(0, 2));

  writeContent(items);
};

main();
