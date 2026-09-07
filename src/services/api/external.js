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

// New: LibriVox (free audiobooks)
export const fetchLibriVoxSearch = async (query, limit = 5) => {
  try {
    const response = await fetchWithTimeout(`https://librivox.org/api/feed/audiobooks/title/${encodeURIComponent(query)}/limit/${limit}/format/json`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.books || []).map(book => ({
      id: `librivox_${book.id}`,
      source: 'LibriVox',
      title: book.title,
      author: book.author ? (book.author.first_name + ' ' + book.author.last_name).trim() : 'Unknown',
      authors: book.author ? [`${book.author.first_name} ${book.author.last_name}`.trim()] : ['Unknown'],
      description: `Free audiobook from LibriVox. ${book.description || ''}`,
      cover: book.url_librivox_image || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      coverUrl: book.url_librivox_image || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      categories: ['Audiobook', 'Spoken Word'],
      webReaderLink: book.url_zip_file,
      download_url: book.url_zip_file
    }));
  } catch (error) {
    console.error('LibriVox search failed:', error);
    return [];
  }
};

// New: Standard Ebooks (high-quality public domain ebooks)
export const fetchStandardEbooksSearch = async (query, limit = 5) => {
  try {
    const response = await fetchWithTimeout(`https://standardebooks.org/api/v1/books/?search=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).slice(0, limit).map(book => ({
      id: `se_${book.id}`,
      source: 'Standard Ebooks',
      title: book.title,
      author: book.authors?.[0]?.name || 'Unknown',
      authors: book.authors?.map(a => a.name) || ['Unknown'],
      description: `High-quality public domain ebook from Standard Ebooks. ${book.description || ''}`,
      cover: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      coverUrl: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      categories: book.tags || ['E-Book', 'Public Domain'],
      webReaderLink: book.download_url,
      download_url: book.download_url
    }));
  } catch (error) {
    console.error('Standard Ebooks search failed:', error);
    return [];
  }
};

// New: ManyBooks (free ebooks)
export const fetchManyBooksSearch = async (query, limit = 5) => {
  try {
    const response = await fetchWithTimeout(`https://manybooks.net/api/books/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.books || []).map(book => ({
      id: `mb_${book.id}`,
      source: 'ManyBooks',
      title: book.title,
      author: book.author || 'Unknown',
      authors: book.author ? [book.author] : ['Unknown'],
      description: book.description || 'Free ebook from ManyBooks',
      cover: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      coverUrl: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      categories: book.categories || ['E-Book'],
      webReaderLink: book.download_url,
      download_url: book.download_url
    }));
  } catch (error) {
    console.error('ManyBooks search failed:', error);
    return [];
  }
};

// New: Feedbooks (free public domain and original ebooks)
export const fetchFeedbooksSearch = async (query, limit = 5) => {
  try {
    const response = await fetchWithTimeout(`https://www.feedbooks.com/books/search?query=${encodeURIComponent(query)}&format=json&limit=${limit}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.books || []).map(book => ({
      id: `fb_${book.id}`,
      source: 'Feedbooks',
      title: book.title,
      author: book.author?.name || 'Unknown',
      authors: book.author ? [book.author.name] : ['Unknown'],
      description: book.summary || 'Free ebook from Feedbooks',
      cover: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      coverUrl: book.cover || `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg`,
      categories: book.categories || ['E-Book'],
      webReaderLink: book.download_url,
      download_url: book.download_url
    }));
  } catch (error) {
    console.error('Feedbooks search failed:', error);
    return [];
  }
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

// New: Multi-source search that queries all available sources
export const fetchAllSources = async (query, limit = 10) => {
  try {
    const [iaBooks, olBooks, gutenbergBooks, libriVoxBooks, standardEbooks, manyBooks, feedbooks] = await Promise.allSettled([
      fetchInternetArchiveSearch(query, Math.ceil(limit / 7)),
      fetchOpenLibrarySearch(query, Math.ceil(limit / 7)),
      fetchGutenbergSearch(query),
      fetchLibriVoxSearch(query, Math.ceil(limit / 7)),
      fetchStandardEbooksSearch(query, Math.ceil(limit / 7)),
      fetchManyBooksSearch(query, Math.ceil(limit / 7)),
      fetchFeedbooksSearch(query, Math.ceil(limit / 7))
    ]);

    const allBooks = [
      ...(iaBooks.status === 'fulfilled' ? iaBooks.value : []),
      ...(olBooks.status === 'fulfilled' ? olBooks.value : []),
      ...(gutenbergBooks.status === 'fulfilled' ? gutenbergBooks.value : []),
      ...(libriVoxBooks.status === 'fulfilled' ? libriVoxBooks.value : []),
      ...(standardEbooks.status === 'fulfilled' ? standardEbooks.value : []),
      ...(manyBooks.status === 'fulfilled' ? manyBooks.value : []),
      ...(feedbooks.status === 'fulfilled' ? feedbooks.value : [])
    ];

    // Remove duplicates based on title + author
    const seen = new Set();
    const uniqueBooks = allBooks.filter(book => {
      const key = `${book.title.toLowerCase()}_${book.author.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueBooks.slice(0, limit);
  } catch (error) {
    console.error('Multi-source search failed:', error);
    return [];
  }
};
