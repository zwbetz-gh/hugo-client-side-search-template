import Fuse from './fuse.js';

LOGGING_BOOL = true;
JSON_INDEX_URL_STR = `${window.location.origin}/index.json`;
HITS_LIMIT_NUM = 10;

let pagesArr;
let fuse;

const logPerformance = (funcStr, startTimeNum, endTimeNum) => {
  if (LOGGING_BOOL) {
    const durationNum = (endTimeNum - startTimeNum).toFixed(2);
    console.log(`${funcStr} took ${durationNum} ms`);
  }
};

const getInputEl = () => {
  return document.querySelector('#client_side_search_input');
};

const getResultsEl = () => {
  return document.querySelector('#client_side_search_results');
};

const enableInputEl = () => {
  getInputEl().disabled = false;
};

const initFuse = () => {
  const startTimeNum = performance.now();
  const options = {
    keys: ['title']
  };
  fuse = new Fuse(pagesArr, options);
  logPerformance('initFuse', startTimeNum, performance.now());
};

const fetchJsonIndex = () => {
  const startTimeNum = performance.now();
  fetch(JSON_INDEX_URL_STR)
    .then(response => response.json())
    .then(data => {
      pagesArr = data;
      initFuse();
      enableInputEl();
      logPerformance('fetchJsonIndex', startTimeNum, performance.now());
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const renderResultsHtml = (limitedHitsArr) => {
  const htmlArr = limitedHitsArr.map(hit => {
    return `\
    <p>
      <a href="${hit.item.url}">${hit.item.title}</a>
    </p>`;
  });
  const htmlStr = htmlArr.join('\n');
  getResultsEl().innerHTML = htmlStr;
};

const handleSearchEvent = () => {
  const startTimeNum = performance.now();
  const queryStr = getInputEl().value.trim();
  const hitsArr = fuse.search(queryStr);
  const limitedHitsArr = hitsArr.splice(0, HITS_LIMIT_NUM);
  renderResultsHtml(limitedHitsArr);
  logPerformance('handleSearchEvent', startTimeNum, performance.now());
};

const main = () => {
  fetchJsonIndex();
  getInputEl().addEventListener('keyup', handleSearchEvent);
};

main();
