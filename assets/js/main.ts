import Fuse from './fuse.js';

interface Page {
  title: string;
  url: string;
}

interface Hit {
  item: Page;
  refIndex: number;
}

let pages: Page[];
let fuse: any;

const getDurationFormattedAsMs = (
  startTime: number,
  endTime: number
): string => {
  const duration = (endTime - startTime).toFixed(1);
  return `${duration} ms`;
};

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
  setFusejsInstantiationTime(startTime, performance.now());
};

const setJsonIndexResourceSize = (bytes: string) => {
  const tdEl = document.querySelector('#json_index_resource_size');
  const kB = (Number(bytes) / 1000).toFixed(1);
  tdEl.textContent = `${kB} kB`;
};

const setJsonIndexFetchTime = (startTime: number, endTime: number) => {
  const tdEl = document.querySelector('#json_index_fetch_time');
  tdEl.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setJsonIndexArrayLength = (length: number) => {
  const tdEl = document.querySelector('#json_index_array_length');
  tdEl.textContent = String(length);
};

const setFusejsInstantiationTime = (startTime: number, endTime: number) => {
  const tdEl = document.querySelector('#fusejs_instantiation_time');
  tdEl.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setSearchEventTime = (startTime: number, endTime: number) => {
  const tdEl = document.querySelector('#search_event_time');
  tdEl.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setHitCount = (length: number) => {
  const tdEl = document.querySelector('#hit_count');
  tdEl.textContent = String(length);
};

const fetchJsonIndex = (): void => {
  const startTime = performance.now();
  setLoading(true);
  fetch(`${window.location.origin}/index.json`)
    .then(response => {
      setJsonIndexResourceSize(response.headers.get('Content-Length'));
      return response.json();
    })
    .then(data => {
      pages = data;
      initFuse();
      setJsonIndexFetchTime(startTime, performance.now());
      setJsonIndexArrayLength(pages.length);
      enableInputEl();
      setLoading(false);
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
  setHitCount(hits.length);
  renderResultsHtml(hits);
  setSearchEventTime(startTime, performance.now());
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
