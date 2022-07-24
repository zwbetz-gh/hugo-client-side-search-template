const fs = require('fs');
const Papa = require('papaparse');
const {kebabCase, uniq} = require('lodash');

const createContent = item => {
  return `\
---
title: ${JSON.stringify(item.common_name)}
date: 2022-07-24T00:00:00-05:00
draft: false
latin_name: ${JSON.stringify(item.latin_name)}
family_name: ${JSON.stringify(item.family_name)}
plant_type: ${JSON.stringify(item.plant_type)}
bloom_time: ${JSON.stringify(item.bloom_time)}
flower_color: ${JSON.stringify(item.flower_color)}
size_at_maturity: ${JSON.stringify(item.size_at_maturity)}
water_needs: ${JSON.stringify(item.water_needs)}
additional_characteristices_notes: ${JSON.stringify(
    item.additional_characteristices_notes
  )}
---

SUMMARY goes here.

<!--more-->

CONTENT goes here.`;
};

const main = () => {
  const csv = fs.readFileSync('./San_Francisco_Plant_Finder_Data.csv', {
    encoding: 'utf-8'
  });

  const parsed = Papa.parse(csv);

  // console.log(parsed.data.slice(0, 2));
  // console.log(parsed.data.length);

  let items = parsed.data.map(row => {
    return {
      common_name: row[1],
      latin_name: row[0],
      family_name: row[2],
      plant_type: row[4],
      bloom_time: row[5],
      flower_color: row[6],
      size_at_maturity: row[7],
      water_needs: row[13],
      additional_characteristices_notes: row[21]
    };
  });

  // Remove the header row
  items.shift();

  const uniqItems = uniq(items);

  // console.log(uniqItems.slice(0, 2))

  for (let i = 0; i < uniqItems.length; i++) {
    const item = uniqItems[i];
    const content = createContent(item);
    const filePath = `./content/${kebabCase(item.common_name)}.md`;
    fs.writeFileSync(filePath, content, {encoding: 'utf-8'});
  }
};

main();
