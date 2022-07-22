import Fuse from './fuse.js';

LOGGING = true;
JSON_INDEX_URL = `${window.location.origin}/index.json`;
HITS_LIMIT = 10;

let pages;
let fuse;

const logPerformance = (funcName, startTime, endTime) => {
  if (LOGGING) {
    const durationNum = (endTime - startTime).toFixed(2);
    console.log(`${funcName} took ${durationNum} ms`);
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
  const startTime = performance.now();
  const options = {
    keys: ['title']
  };
  fuse = new Fuse(pages, options);
  logPerformance('initFuse', startTime, performance.now());
};

const fetchJsonIndex = () => {
  const startTime = performance.now();
  fetch(JSON_INDEX_URL)
    .then(response => response.json())
    .then(data => {
      pages = data;
      initFuse();
      enableInputEl();
      logPerformance('fetchJsonIndex', startTime, performance.now());
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const renderResultsHtml = (hits) => {
  const htmls = hits.map(hit => {
    return `\
    <p>
      <a href="${hit.item.url}">${hit.item.title}</a>
    </p>`;
  });
  const html = htmls.join('\n');
  getResultsEl().innerHTML = html;
};

const handleSearchEvent = () => {
  const startTime = performance.now();
  const query = getInputEl().value.trim();
  const hits = fuse.search(query);
  const limitedHits = hits.splice(0, HITS_LIMIT);
  renderResultsHtml(limitedHits);
  logPerformance('handleSearchEvent', startTime, performance.now());
};

const main = () => {
  fetchJsonIndex();
  getInputEl().addEventListener('keyup', handleSearchEvent);
};

main();
