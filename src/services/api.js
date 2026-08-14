import driveBooksData from '../data/drive_books.json';


const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 10000 } = options;
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
  const cover = book.cover_url || 'https://via.placeholder.com/300x450/1e293b/d4af37?text=No+Cover';
  return {
    id: book.id,
    title: book.title || 'Untitled',
    author: authorName,
    authors: [authorName],
    cover: cover,
    coverUrl: cover,
    description: "A premium book from Catsby's E-Library.",
    source: 'Google Drive',
    download_url: book.download_url,
    categories: ['Fiction', 'E-Books']
  };
};

export const searchBooks = async (query, maxResults = 24) => {
  try {
    const [openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchOpenLibrarySearch(query, Math.ceil(maxResults / 2))
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchGutenbergSearch(query)
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);
    
    // Filter local drive books matching query
    const lowerQuery = query.toLowerCase();
    const driveBooks = driveBooksData
      .filter(b => b.title.toLowerCase().includes(lowerQuery) || b.author.toLowerCase().includes(lowerQuery))
      .map(formatDriveBook);
    
    // Interleave the results
    return interleaveArrays(driveBooks, interleaveArrays(gutenbergBooks, openLibraryDocs)).slice(0, maxResults);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};

export const getPopularBooks = async () => {
  try {
    const [openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchWithTimeout(`https://openlibrary.org/search.json?subject=fiction&limit=12&sort=editions`)
        .then(res => res.json())
        .then(data => data.docs ? data.docs.map(formatOpenLibraryBook) : [])
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchWithTimeout('https://gutendex.com/books/?topic=fiction')
        .then(res => res.json())
        .then(data => data.results ? data.results.map(formatGutenbergBook) : [])
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);

    const driveBooks = driveBooksData.map(formatDriveBook);
    return interleaveArrays(driveBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

export const getBooksByCategory = async (category) => {
  try {
    const [openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetchWithTimeout(`https://openlibrary.org/search.json?subject=${encodeURIComponent(category)}&limit=12&sort=editions`)
        .then(res => res.json())
        .then(data => data.docs ? data.docs.map(formatOpenLibraryBook) : [])
        .catch(err => { console.error('OL Error', err); return []; }),
      fetchWithTimeout(`https://gutendex.com/books/?topic=${encodeURIComponent(category)}`)
        .then(res => res.json())
        .then(data => data.results ? data.results.map(formatGutenbergBook) : [])
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);

    // For categories, just pass some drive books randomly or all
    const driveBooks = driveBooksData.map(formatDriveBook);
    return interleaveArrays(driveBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
  } catch (error) {
    console.error('Error fetching category books:', error);
    return [];
  }
};

export const getRecommendations = async (readlist) => {
  if (!readlist || readlist.length === 0) return [];
  try {
    // Extract common categories/subjects from readlist
    const allCategories = readlist.flatMap(book => book.categories || []);
    const categoryCounts = allCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    // Sort categories by frequency and pick the top one
    const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    
    if (topCategory) {
      return await getBooksByCategory(topCategory);
    }
    
    // Fallback if no categories
    return await getPopularBooks();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const fetchOpenLibrarySearch = async (query, limit) => {
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

const formatOpenLibraryBook = (item) => {
  const coverUrl = item.cover_i 
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
    : 'https://via.placeholder.com/300x450?text=No+Cover';

  return {
    id: `ol_${item.key}`,
    source: 'Open Library',
    title: item.title || 'Unknown Title',
    authors: item.author_name || ['Unknown Author'],
    description: item.first_sentence ? (typeof item.first_sentence === 'string' ? item.first_sentence : item.first_sentence[0]) : 'Available on Open Library. Millions of books are available to borrow or read for free.',
    coverUrl: coverUrl,
    publishedDate: item.first_publish_year ? item.first_publish_year.toString() : '',
    pageCount: item.number_of_pages_median || null,
    categories: item.subject ? item.subject.slice(0, 5) : [],
    previewLink: `https://openlibrary.org${item.key}`,
    webReaderLink: item.public_scan_b ? `https://openlibrary.org${item.key}/read` : null
  };
};

const formatGutenbergBook = (item) => {
  return {
    id: `gutenberg_${item.id}`,
    source: 'Project Gutenberg',
    title: item.title || 'Unknown Title',
    authors: item.authors ? item.authors.map(a => a.name) : ['Unknown Author'],
    description: `A public domain classic available via Project Gutenberg. Downloaded ${item.download_count} times.`,
    coverUrl: item.formats?.['image/jpeg'] || 'https://via.placeholder.com/300x450?text=No+Cover',
    publishedDate: 'Public Domain',
    pageCount: null,
    categories: item.subjects ? item.subjects.slice(0, 5) : [],
    previewLink: `https://www.gutenberg.org/ebooks/${item.id}`,
    webReaderLink: item.formats?.['text/html'] || item.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${item.id}`
  };
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
