import Fuse from './fuse.js';
import stats from './stats';
import {Hit, Page} from './types.js';

const JSON_INDEX_URL = `${window.location.origin}/index.json`;
const QUERY_URL_PARAM = 'query';
const MAX_HITS_SHOWN = 10;
const FUSE_OPTIONS = {
  keys: [
    'title', // == common_name
    'latin_name',
    'additional_characteristices_notes'
  ]
};

let fuse: any;

const getInputEl = (): HTMLInputElement => {
  return document.querySelector('#search_input');
};

const enableInputEl = (): void => {
  getInputEl().disabled = false;
};

const initFuse = (pages: Page[]): void => {
  const startTime = performance.now();
  fuse = new Fuse(pages, FUSE_OPTIONS);
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
  fetch(JSON_INDEX_URL, {
    // Only for demo purposes: download a resource with cache busting, to bypass the cache completely.
    cache: 'no-store'
  })
    .then(response => {
      stats.setJsonIndexContentEncoding(response);
      stats.setJsonIndexContentSize(response);
      return response.json();
    })
    .then(data => {
      const pages: Page[] = data;
      initFuse(pages);
      enableInputEl();
      doSearchIfUrlParamExists();
      stats.setJsonIndexFetchTime(startTime, performance.now());
      stats.setJsonIndexArrayLength(pages.length);
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const createHtmlForHit = (hit: Hit): string => {
  const details = Object.keys(hit.item)
    .filter(key => {
      return key !== 'title' && key !== 'url';
    })
    .map(key => {
      return `\
    <strong>${key}:</strong> ${hit.item[key]}<br>
    `;
    })
    .join('\n');

  return `\
  <p>
    <strong>title:</strong> <a href="${hit.item.url}">${hit.item.title}</a><br>
    ${details}
  </p>`;
};

const renderResultsHtml = (hits: Hit[]): void => {
  const limitiedHits = hits.slice(0, MAX_HITS_SHOWN);

  const html = limitiedHits.map(createHtmlForHit).join('\n');
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
  if (getInputEl()) {
    fetchJsonIndex();
    getInputEl().addEventListener('keyup', handleSearchEvent);
  }
};

const main = (): void => {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
};

main();
