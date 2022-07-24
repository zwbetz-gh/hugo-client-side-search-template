const fs = require('fs');
const Papa = require('papaparse');
const {kebabCase, uniq} = require('lodash');
const {title} = require('process');

const createContent = (title, author) => {
  return `\
---
title: ${JSON.stringify(title)}
date: 2022-07-24T00:00:00-05:00
draft: false
author: ${JSON.stringify(author)}
---

SUMMARY

<!--more-->

CONTENT`;
};

const main = () => {
  const csv = fs.readFileSync('./books.csv', {encoding: 'utf-8'});
  const parsed = Papa.parse(csv);
  // console.log(parsed.data)

  let items = parsed.data.map(row => {
    return {
      title: row[1],
      author: row[2]
    };
  });

  items = uniq(items);

  for (let i = 0; i < 1_000; i++) {
    const item = items[i];
    const content = createContent(item.title, item.author);
    const filePath = `./content/${kebabCase(item.title)}.md`;
    fs.writeFileSync(filePath, content, {encoding: 'utf-8'});
  }
};

main();
