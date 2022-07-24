import Fuse from './fuse.js';
import stats from './stats';
import {Hit, Page} from './types.js';

const JSON_INDEX_URL = `${window.location.origin}/index.json`;
const QUERY_URL_PARAM = 'query';

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

const initFusejs = (): void => {
  const startTime = performance.now();
  const options = {
    keys: ['title']
  };
  fuse = new Fuse(pages, options);
  stats.setFusejsInstantiationTime(startTime, performance.now());
};

const doSearchIfUrlParamExists = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(QUERY_URL_PARAM)) {
    const query = decodeURIComponent(urlParams.get(QUERY_URL_PARAM));
    getInputEl().value = query;
    handleSearchEvent();
  }
};

const setUrlParam = (query: string): void => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(QUERY_URL_PARAM, encodeURIComponent(query));
  window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
};

const fetchJsonIndex = (): void => {
  const startTime = performance.now();
  setLoading(true);
  fetch(JSON_INDEX_URL)
    .then(response => {
      stats.setJsonIndexResourceSize(response);
      return response.json();
    })
    .then(data => {
      pages = data;
      initFusejs();
      enableInputEl();
      setLoading(false);
      doSearchIfUrlParamExists();
      stats.setJsonIndexFetchTime(startTime, performance.now());
      stats.setJsonIndexArrayLength(pages.length);
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const createHtmlForHit = (hit: Hit): string => {
  return `\
  <p>
    <a href="${hit.item.url}">${hit.item.title}</a>
  </p>`;
};

const renderResultsHtml = (hits: Hit[]): void => {
  const html = hits.map(createHtmlForHit).join('\n');
  document.querySelector('#search_results_container').innerHTML = html;
};

const getQuery = (): string => {
  const query = getInputEl().value.trim();
  stats.setQuery(query);
  return query;
};

const getHits = (query: string): Hit[] => {
  return fuse.search(query);
};

const handleSearchEvent = (): void => {
  const startTime = performance.now();
  const query = getQuery();
  const hits = getHits(query);
  setUrlParam(query);
  renderResultsHtml(hits);
  stats.setHitCount(hits.length);
  stats.setSearchEventTime(startTime, performance.now());
};

const handleDOMContentLoaded = (): void => {
  fetchJsonIndex();
  getInputEl().addEventListener('keyup', handleSearchEvent);
};

const main = (): void => {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
};

main();
