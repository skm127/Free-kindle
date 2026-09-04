let _driveBooks = null;
let _driveBooksPromise = null;

let _githubBooks = null;
let _githubBooksPromise = null;

export const getDriveBooks = async () => {
  if (_driveBooks) return _driveBooks;
  if (!_driveBooksPromise) {
    _driveBooksPromise = fetch('/data/drive_books.json')
      .then(res => res.json())
      .then(data => { _driveBooks = data; return data; })
      .catch(err => { console.error('Failed to load drive books:', err); _driveBooksPromise = null; return []; });
  }
  return _driveBooksPromise;
};

export const getGithubBooks = async () => {
  if (_githubBooks) return _githubBooks;
  if (!_githubBooksPromise) {
    _githubBooksPromise = fetch('/data/github_books.json')
      .then(res => res.json())
      .then(data => { _githubBooks = data; return data; })
      .catch(err => { console.error('Failed to load github books:', err); _githubBooksPromise = null; return []; });
  }
  return _githubBooksPromise;
};

export const formatDriveBook = (book) => {
  const authorName = book.author || 'Unknown Author';
  const titleEncoded = encodeURIComponent(book.title || 'Untitled');
  const cover = book.cover_url || `https://covers.openlibrary.org/b/title/${titleEncoded}-L.jpg`;
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
    webReaderLink: book.download_url,
    categories: ['Fiction', 'E-Books']
  };
};

export const formatInternetArchiveBook = (item) => {
  const creators = Array.isArray(item.creator) 
    ? item.creator 
    : (item.creator ? [item.creator] : ['Unknown Author']);
  
  let desc = 'Free readable book from the Internet Archive digital library.';
  if (item.description) {
    desc = Array.isArray(item.description) ? item.description[0] : item.description;
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

export const formatOpenLibraryBook = (item) => {
  const coverUrl = item.cover_i 
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
    : `https://covers.openlibrary.org/b/title/${encodeURIComponent(item.title || '')}-L.jpg`;

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

export const formatGutenbergBook = (item) => {
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
    cover: item.formats?.['image/jpeg'] || `https://covers.openlibrary.org/b/title/${encodeURIComponent(item.title || '')}-L.jpg`,
    coverUrl: item.formats?.['image/jpeg'] || `https://covers.openlibrary.org/b/title/${encodeURIComponent(item.title || '')}-L.jpg`,
    publishedDate: 'Public Domain',
    pageCount: null,
    categories: item.subjects ? item.subjects.slice(0, 5) : [],
    previewLink: `https://www.gutenberg.org/ebooks/${item.id}`,
    webReaderLink: item.formats?.['text/html'] || item.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${item.id}`,
    download_url: item.formats?.['application/epub+zip'] || `https://www.gutenberg.org/ebooks/${item.id}`
  };
};
