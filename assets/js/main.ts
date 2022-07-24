/**
 * TEMPLATE_TODO: Required. Remove this import and all usages of stats.
 */
import stats from './stats';

import Fuse from './fuse.js';
import {Hit, Page} from './types.js';

const JSON_INDEX_URL = `${window.location.origin}/index.json`;
const QUERY_URL_PARAM = 'query';

/**
 * TEMPLATE_TODO: Optioal. Change how many hits are shown.
 */
const MAX_HITS_SHOWN = 10;

/**
 * TEMPLATE_TODO: Required. Tell Fuse.js which keys to search on.
 */
const FUSE_OPTIONS = {
  keys: ['title', 'country', 'crew', 'vehicle', 'purpose']
};

let fuse: any;

/**
 * TEMPLATE_TODO: Optional. If your HTML input element has a different selector, change it.
 */
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
  fetch(JSON_INDEX_URL)
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

/**
 * TEMPLATE_TODO: Required. Change how your HTML is created.
 */
const createHitHtml = (hit: Hit): string => {
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
    <strong>eva_number:</strong> <a href="${hit.item.url}">${hit.item.title}</a><br>
    ${details}
  </p>`;
};

/**
 * TEMPLATE_TODO: Optional. If your HTML results container element has a different selector, change it.
 */
const renderHits = (hits: Hit[]): void => {
  const limitiedHits = hits.slice(0, MAX_HITS_SHOWN);
  const html = limitiedHits.map(createHitHtml).join('\n');
  document.querySelector('#search_results_container').innerHTML = html;
};

const getQuery = (): string => {
  const query = getInputEl().value.trim();
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
  renderHits(hits);
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
