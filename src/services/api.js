let _driveBooks = null;
let _driveBooksPromise = null;

const getDriveBooks = async () => {
  if (_driveBooks) return _driveBooks;
  if (!_driveBooksPromise) {
    _driveBooksPromise = fetch('/data/drive_books.json')
      .then(res => res.json())
      .then(data => { _driveBooks = data; return data; })
      .catch(err => { console.error('Failed to load drive books:', err); _driveBooksPromise = null; return []; });
  }
  return _driveBooksPromise;
};

const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 8000 } = options;
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

const formatDriveBook = (book) => {
  const authorName = book.author || 'Unknown Author';
  const titleEncoded = encodeURIComponent(book.title || 'Untitled');
  const cover = `https://covers.openlibrary.org/b/title/${titleEncoded}-M.jpg`;
  return {
    id: book.id,
    title: book.title || 'Untitled',
    author: authorName,
    authors: [authorName],
    cover: cover,
    coverUrl: cover,
    description: `A book by ${authorName}. Available for free reading and download.`,
    source: 'Google Drive',
    download_url: book.download_url,
    previewLink: book.download_url,
    categories: ['Fiction', 'E-Books']
  };
};

const formatInternetArchiveBook = (item) => {
  const creators = Array.isArray(item.creator) 
    ? item.creator 
    : (item.creator ? [item.creator] : ['Unknown Author']);
  
  let desc = 'Free readable book from the Internet Archive digital library.';
  if (item.description) {
    desc = Array.isArray(item.description) ? item.description[0] : item.description;
    // Strip basic html tags if any
    desc = desc.replace(/<[^>]*>?/gm, '').trim();
  }

  const coverUrl = `https://archive.org/services/img/${item.identifier}`;
  const subjects = Array.isArray(item.subject) 
    ? item.subject.slice(0, 5) 
    : (item.subject ? [item.subject] : ['Literature']);

  return {
    id: `ia_${item.identifier}`,
    source: 'Internet Archive',
    title: item.title || 'Unknown Title',
    author: creators[0],
    authors: creators,
    description: desc || 'Free readable book from Internet Archive.',
    cover: coverUrl,
    coverUrl: coverUrl,
    publishedDate: item.date ? item.date.substring(0, 4) : '',
    pageCount: null,
    categories: subjects,
    previewLink: `https://archive.org/details/${item.identifier}`,
    webReaderLink: `https://archive.org/embed/${item.identifier}`,
    download_url: `https://archive.org/details/${item.identifier}`
  };
};

const formatOpenLibraryBook = (item) => {
  const coverUrl = item.cover_i 
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
    : 'https://via.placeholder.com/300x450?text=No+Cover';

  return {
    id: `ol_${item.key}`,
    source: 'Open Library',
    title: item.title || 'Unknown Title',
    author: item.author_name ? item.author_name[0] : 'Unknown Author',
    authors: item.author_name || ['Unknown Author'],
    description: item.first_sentence 
      ? (typeof item.first_sentence === 'string' ? item.first_sentence : item.first_sentence[0]) 
      : 'Available on Open Library. Millions of books are available to borrow or read for free.',
    cover: coverUrl,
    coverUrl: coverUrl,
    publishedDate: item.first_publish_year ? item.first_publish_year.toString() : '',
    pageCount: item.number_of_pages_median || null,
    categories: item.subject ? item.subject.slice(0, 5) : [],
    previewLink: `https://openlibrary.org${item.key}`,
    webReaderLink: item.public_scan_b ? `https://openlibrary.org${item.key}/read` : null,
    download_url: `https://openlibrary.org${item.key}`
  };
};

const formatGutenbergBook = (item) => {
  const authors = item.authors && item.authors.length > 0 
    ? item.authors.map(a => a.name) 
    : ['Unknown Author'];

  return {
    id: `gutenberg_${item.id}`,
    source: 'Project Gutenberg',
    title: item.title || 'Unknown Title',
    author: authors[0],
    authors: authors,
    description: `A public domain classic available via Project Gutenberg. Downloaded ${item.download_count || 0} times.`,
    cover: item.formats?.['image/jpeg'] || 'https://via.placeholder.com/300x450?text=No+Cover',
    coverUrl: item.formats?.['image/jpeg'] || 'https://via.placeholder.com/300x450?text=No+Cover',
    publishedDate: 'Public Domain',
    pageCount: null,
    categories: item.subjects ? item.subjects.slice(0, 5) : [],
    previewLink: `https://www.gutenberg.org/ebooks/${item.id}`,
    webReaderLink: item.formats?.['text/html'] || item.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${item.id}`,
    download_url: item.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${item.id}`
  };
};

export const searchBooks = async (query, maxResults = 40) => {
  try {
    const [iaBooks, openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchInternetArchiveSearch(query, 12)
        .catch(err => { console.error('IA Error', err); return []; }),
      fetchOpenLibrarySearch(query, 10)
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchGutenbergSearch(query)
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);
    
    // Fuzzy search Google Drive indexed books
    const allDriveBooks = await getDriveBooks();
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    const driveBooks = allDriveBooks
      .map(b => {
        const titleLower = (b.title || '').toLowerCase();
        const authorLower = (b.author || '').toLowerCase();
        const combined = titleLower + ' ' + authorLower;
        
        if (titleLower === query.toLowerCase()) return { ...b, score: 100 };
        if (titleLower.startsWith(query.toLowerCase())) return { ...b, score: 80 };
        const allMatch = queryWords.length > 0 && queryWords.every(w => combined.includes(w));
        if (allMatch) return { ...b, score: 60 };
        const anyTitleMatch = queryWords.some(w => titleLower.includes(w));
        if (anyTitleMatch) return { ...b, score: 40 };
        const anyAuthorMatch = queryWords.some(w => authorLower.includes(w));
        if (anyAuthorMatch) return { ...b, score: 20 };
        return null;
      })
      .filter(b => b !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map(formatDriveBook);
    
    // Interleave all 4 sources
    const onlineBooks = interleaveArrays(iaBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
    return interleaveArrays(driveBooks, onlineBooks).slice(0, maxResults);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

export const getPopularBooks = async () => {
  try {
    const [iaBooks, openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchInternetArchivePopular('fiction', 12)
        .catch(err => { console.error('IA Error', err); return []; }),
      fetchWithTimeout(`https://openlibrary.org/search.json?subject=fiction&limit=12&sort=editions`)
        .then(res => res.json())
        .then(data => data.docs ? data.docs.map(formatOpenLibraryBook) : [])
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchWithTimeout('https://gutendex.com/books/?topic=fiction')
        .then(res => res.json())
        .then(data => data.results ? data.results.map(formatGutenbergBook) : [])
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);

    const allDriveBooks = await getDriveBooks();
    const shuffled = [...allDriveBooks].sort(() => Math.random() - 0.5);
    const driveBooks = shuffled.slice(0, 24).map(formatDriveBook);

    const onlineBooks = interleaveArrays(iaBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
    return interleaveArrays(driveBooks, onlineBooks);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

export const getBooksByCategory = async (category) => {
  try {
    const [iaBooks, openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchInternetArchivePopular(category, 15)
        .catch(err => { console.error('IA Error', err); return []; }),
      fetchWithTimeout(`https://openlibrary.org/search.json?subject=${encodeURIComponent(category)}&limit=12&sort=editions`)
        .then(res => res.json())
        .then(data => data.docs ? data.docs.map(formatOpenLibraryBook) : [])
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchWithTimeout(`https://gutendex.com/books/?topic=${encodeURIComponent(category)}`)
        .then(res => res.json())
        .then(data => data.results ? data.results.map(formatGutenbergBook) : [])
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);

    const allDriveBooks = await getDriveBooks();
    const shuffled = [...allDriveBooks].sort(() => Math.random() - 0.5);
    const driveBooks = shuffled.slice(0, 20).map(formatDriveBook);

    const onlineBooks = interleaveArrays(iaBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
    return interleaveArrays(driveBooks, onlineBooks);
  } catch (error) {
    console.error('Error fetching category books:', error);
    return [];
  }
};

export const getRecommendations = async (readlist) => {
  if (!readlist || readlist.length === 0) return [];
  try {
    const allCategories = readlist.flatMap(book => book.categories || []);
    const categoryCounts = allCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    
    if (topCategory) {
      return await getBooksByCategory(topCategory);
    }
    
    return await getPopularBooks();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const fetchInternetArchiveSearch = async (query, limit = 12) => {
  const queryClean = encodeURIComponent(`(title:(${query}) OR creator:(${query}) OR description:(${query})) AND mediatype:texts`);
  const url = `https://archive.org/advancedsearch.php?q=${queryClean}&fl[]=identifier,title,creator,description,downloads,subject,date&sort[]=downloads+desc&rows=${limit}&output=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data.response?.docs || [];
  return docs.map(formatInternetArchiveBook);
};

const fetchInternetArchivePopular = async (topic = 'fiction', limit = 12) => {
  const queryClean = encodeURIComponent(`(subject:(${topic}) OR collection:(books)) AND mediatype:texts AND downloads:[300 TO *]`);
  const url = `https://archive.org/advancedsearch.php?q=${queryClean}&fl[]=identifier,title,creator,description,downloads,subject,date&sort[]=downloads+desc&rows=${limit}&output=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data.response?.docs || [];
  return docs.map(formatInternetArchiveBook);
};

const fetchOpenLibrarySearch = async (query, limit = 12) => {
  const response = await fetchWithTimeout(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.docs ? data.docs.map(formatOpenLibraryBook) : [];
};

const fetchGutenbergSearch = async (query) => {
  const response = await fetchWithTimeout(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results ? data.results.map(formatGutenbergBook) : [];
};

const interleaveArrays = (arr1, arr2) => {
  const result = [];
  const maxLength = Math.max(arr1.length, arr2.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < arr1.length) result.push(arr1[i]);
    if (i < arr2.length) result.push(arr2[i]);
  }
  return result;
};
