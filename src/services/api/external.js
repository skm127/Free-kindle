import { formatInternetArchiveBook, formatOpenLibraryBook, formatGutenbergBook } from './books.js';

export const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 3500 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const fetchInternetArchiveSearch = async (query, limit = 10) => {
  const queryClean = encodeURIComponent(`(title:(${query}) OR creator:(${query})) AND mediatype:texts`);
  const url = `https://archive.org/advancedsearch.php?q=${queryClean}&fl[]=identifier,title,creator,description,downloads,subject,date&sort[]=downloads+desc&rows=${limit}&output=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data.response?.docs || [];
  return docs.map(formatInternetArchiveBook);
};

export const fetchInternetArchivePopular = async (topic = 'fiction', limit = 10) => {
  const queryClean = encodeURIComponent(`subject:(${topic}) AND mediatype:texts AND downloads:[500 TO *]`);
  const url = `https://archive.org/advancedsearch.php?q=${queryClean}&fl[]=identifier,title,creator,description,downloads,subject,date&sort[]=downloads+desc&rows=${limit}&output=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data.response?.docs || [];
  return docs.map(formatInternetArchiveBook);
};

export const fetchOpenLibrarySearch = async (query, limit = 8) => {
  const response = await fetchWithTimeout(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.docs ? data.docs.map(formatOpenLibraryBook) : [];
};

export const fetchGutenbergSearch = async (query) => {
  const response = await fetchWithTimeout(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results ? data.results.map(formatGutenbergBook) : [];
};

export const interleaveArrays = (arr1, arr2) => {
  const result = [];
  const maxLength = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < arr1.length) result.push(arr1[i]);
    if (i < arr2.length) result.push(arr2[i]);
  }
  return result;
};
