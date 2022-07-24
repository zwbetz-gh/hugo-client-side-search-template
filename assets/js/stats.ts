const getDurationFormattedAsMs = (
  startTime: number,
  endTime: number
): string => {
  const duration = (endTime - startTime).toFixed(1);
  return `${duration} ms`;
};

const setJsonIndexContentEncoding = (response: Response): void => {
  const el = document.querySelector('#json_index_content_encoding');
  const encoding = response.headers.get('content-encoding');
  el.textContent = encoding;
};

const setJsonIndexContentSize = (response: Response): void => {
  const el = document.querySelector('#json_index_content_size');
  const bytes = response.headers.get('content-length');
  const kbs = (Number(bytes) / 1000).toFixed(1);
  el.textContent = `${kbs} kB`;
};

const setJsonIndexFetchTime = (startTime: number, endTime: number): void => {
  const el = document.querySelector('#json_index_fetch_time');
  el.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setJsonIndexArrayLength = (length: number): void => {
  const el = document.querySelector('#json_index_array_length');
  el.textContent = String(length);
};

const setFusejsInstantiationTime = (
  startTime: number,
  endTime: number
): void => {
  const el = document.querySelector('#fusejs_instantiation_time');
  el.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setSearchEventTime = (startTime: number, endTime: number): void => {
  const el = document.querySelector('#search_event_time');
  el.textContent = getDurationFormattedAsMs(startTime, endTime);
};

const setHitCount = (length: number): void => {
  const el = document.querySelector('#hit_count');
  el.textContent = String(length);
};

const setQuery = (query: string): void => {
  const el = document.querySelector('#query');
  el.textContent = query;
};

export default {
  setJsonIndexContentEncoding,
  setJsonIndexContentSize,
  setJsonIndexFetchTime,
  setJsonIndexArrayLength,
  setFusejsInstantiationTime,
  setSearchEventTime,
  setHitCount,
  setQuery
};
