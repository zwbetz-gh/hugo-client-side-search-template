import Fuse from './fuse.js';

interface Page {
  title: string;
  url: string;
}

interface Hit {
  item: Page;
  refIndex: number;
}

const LOGGING = true;
const SEARCH_INPUT_SELECTOR = '#client_side_search_input';
const SEARCH_RESULTS_SELECTOR = '#client_side_search_results';
const JSON_INDEX_URL = `${window.location.origin}/index.json`;
const HITS_LIMIT = 10;

let pages: Page[];
let fuse: any;

const logPerformance = (
  funcName: string,
  startTime: number,
  endTime: number
): void => {
  if (LOGGING) {
    const durationNum = (endTime - startTime).toFixed(2);
    console.log(`${funcName} took ${durationNum} ms`);
  }
};

const getInputEl = (): HTMLInputElement => {
  return document.querySelector(SEARCH_INPUT_SELECTOR);
};

const getResultsEl = (): HTMLElement => {
  return document.querySelector(SEARCH_RESULTS_SELECTOR);
};

const enableInputEl = (): void => {
  getInputEl().disabled = false;
};

const initFuse = (): void => {
  const startTime = performance.now();
  const options = {
    keys: ['title']
  };
  fuse = new Fuse(pages, options);
  logPerformance('initFuse', startTime, performance.now());
};

const fetchJsonIndex = (): void => {
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

const renderResultsHtml = (hits: Hit[]): void => {
  const html = hits
    .map(hit => {
      return `\
    <p>
      <a href="${hit.item.url}">${hit.item.title}</a>
    </p>`;
    })
    .join('\n');
  getResultsEl().innerHTML = html;
};

const getQuery = (): string => {
  return getInputEl().value.trim();
};

const getHits = (query: string): Hit[] => {
  return fuse.search(query);
};

const limitHits = (hits: Hit[]): Hit[] => {
  return hits.splice(0, HITS_LIMIT);
};

const handleSearchEvent = (): void => {
  const startTime = performance.now();
  const query = getQuery();
  const hits = getHits(query);
  const limitedHits = limitHits(hits);
  renderResultsHtml(limitedHits);
  logPerformance('handleSearchEvent', startTime, performance.now());
};

const main = (): void => {
  if (getInputEl()) {
    fetchJsonIndex();
    getInputEl().addEventListener('keyup', handleSearchEvent);
  }
};

main();
