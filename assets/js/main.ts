import Fuse from './fuse.js';
import stats from './stats';
import {Hit, Page} from './types.js';

let pages: Page[];
let fuse: any;

const getInputEl = (): HTMLInputElement => {
  return document.querySelector('#search_input');
};

const setLoading = (loading: boolean): void => {
  if (loading) {
    getInputEl().placeholder = 'Loading...';
  } else {
    getInputEl().placeholder = 'Search by title';
  }
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
  stats.setFusejsInstantiationTime(startTime, performance.now());
};

const fetchJsonIndex = (): void => {
  const startTime = performance.now();
  setLoading(true);
  fetch(`${window.location.origin}/index.json`)
    .then(response => {
      stats.setJsonIndexResourceSize(response);
      return response.json();
    })
    .then(data => {
      pages = data;
      initFuse();
      enableInputEl();
      setLoading(false);
      stats.setJsonIndexFetchTime(startTime, performance.now());
      stats.setJsonIndexArrayLength(pages.length);
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
  document.querySelector('#search_results_container').innerHTML = html;
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
  renderResultsHtml(hits);
  stats.setHitCount(hits.length);
  stats.setSearchEventTime(startTime, performance.now());
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
