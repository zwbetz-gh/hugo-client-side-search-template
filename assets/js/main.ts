import Fuse from './fuse.mjs';
import {Hit, Page} from './types.js';

const JSON_INDEX_URL = `${window.location.origin}/index.json`;
const QUERY_URL_PARAM = 'query';

/**
 * TEMPLATE_TODO: Optioal. Change how many hits are shown.
 */
const MAX_HITS_SHOWN = 10;

/**
 * TEMPLATE_TODO: Optioal. Change the style of a highlighted match.
 */
const LEFT_SIDE_MATCH_HTML = '<span style="background-color: #fff3cd;">';
const RIGHT_SIDE_MATCH_HTML = '</span>';

/**
 * TEMPLATE_TODO: Required. Tell Fuse.js which keys to search on.
 */
const FUSE_OPTIONS = {
  keys: ['title', 'country', 'crew', 'vehicle', 'purpose'],
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 3
};

let fuse: any;

const getInputEl = (): HTMLInputElement => {
  /**
   * TEMPLATE_TODO: Optional. If your HTML input element has a different selector, change it.
   */
  return document.querySelector('#search_input');
};

const enableInputEl = (): void => {
  getInputEl().disabled = false;
};

const initFuse = (pages: Page[]): void => {
  fuse = new Fuse(pages, FUSE_OPTIONS);
};

const doSearchIfUrlParamExists = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(QUERY_URL_PARAM)) {
    const query = decodeURIComponent(urlParams.get(QUERY_URL_PARAM));
    getInputEl().value = query;
    handleSearchEvent();
  }
};

/**
 * Copied from {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986}
 */
const encodeRFC3986URIComponent = (str: string): string => {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
};

const setUrlParam = (query: string): void => {
  const url = new URL(location.origin + location.pathname);
  url.search = `${QUERY_URL_PARAM}=${encodeRFC3986URIComponent(query)}`;
  window.history.replaceState({}, '', url);
};

const fetchJsonIndex = (): void => {
  fetch(JSON_INDEX_URL)
    .then(response => {
      return response.json();
    })
    .then(data => {
      const pages: Page[] = data;
      initFuse(pages);
      enableInputEl();
      doSearchIfUrlParamExists();
    })
    .catch(error => {
      console.error(`Failed to fetch JSON index: ${error.message}`);
    });
};

const highlightMatches = (hit: Hit, key: string) => {
  const text: string = hit.item[key];
  const match = hit.matches.find(match => match.key === key);

  if (!match) {
    return text;
  }

  const charIndexToReplacementText = new Map<number, string>();

  match.indices.forEach(indexPair => {
    const startIndex = indexPair[0];
    const endIndex = indexPair[1];

    const startCharText = `${LEFT_SIDE_MATCH_HTML}${text[startIndex]}`;
    const endCharText = `${text[endIndex]}${RIGHT_SIDE_MATCH_HTML}`;

    charIndexToReplacementText.set(startIndex, startCharText);
    charIndexToReplacementText.set(endIndex, endCharText);
  });

  return text
    .split('')
    .map((char, index) => charIndexToReplacementText.get(index) || char)
    .join('');
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
    <strong>${key}:</strong> ${highlightMatches(hit, key)}<br>
    `;
    })
    .join('\n');

  return `\
  <p>
    <strong>eva_number:</strong> <a href="${hit.item.url}">
    ${highlightMatches(hit, 'title')}
    </a><br>
    ${details}
  </p>`;
};

const renderHits = (hits: Hit[]): void => {
  const limitedHits = hits.slice(0, MAX_HITS_SHOWN);
  const html = limitedHits.map(createHitHtml).join('\n');
  /**
   * TEMPLATE_TODO: Optional. If your HTML results container element has a different selector, change it.
   */
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
  const query = getQuery();
  const hits = getHits(query);
  setUrlParam(query);
  renderHits(hits);
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
