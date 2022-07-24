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
const SEARCH_RESULTS_COUNT_SELECTOR = '#client_side_search_results_count';
const SEARCH_RESULTS_SELECTOR = '#client_side_search_results';
const JSON_INDEX_URL = `${window.location.origin}/index.json`;

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

const getCountEl = (): HTMLSpanElement => {
  return document.querySelector(SEARCH_RESULTS_COUNT_SELECTOR);
};

const getResultsEl = (): HTMLDivElement => {
  return document.querySelector(SEARCH_RESULTS_SELECTOR);
};

const setLoading = (loading: boolean): void => {
  if (loading) {
    getInputEl().placeholder = 'Loading...';
  } else {
    getInputEl().placeholder = 'Search by title';
  }
};

const setHitCount = (count: number): void => {
  getCountEl().innerHTML = `<strong>${count}</strong>`;
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
  setLoading(true);
  fetch(JSON_INDEX_URL)
    .then(response => response.json())
    .then(data => {
      pages = data;
      initFuse();
      enableInputEl();
      setLoading(false);
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

const handleSearchEvent = (): void => {
  const startTime = performance.now();
  const query = getQuery();
  const hits = getHits(query);
  setHitCount(hits.length);
  renderResultsHtml(hits);
  logPerformance('handleSearchEvent', startTime, performance.now());
};

const handleDOMContentLoaded = (): void => {
  if (getInputEl()) {
    fetchJsonIndex();
    getInputEl().addEventListener('keyup', handleSearchEvent);
  }
};

const main = (): void => {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
};

main();
