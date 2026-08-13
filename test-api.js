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

const getPopularBooks = async () => {
  try {
    const [openLibraryDocs, gutenbergBooks] = await Promise.all([
      fetch(`https://openlibrary.org/search.json?subject=fiction&limit=12&sort=editions`)
        .then(res => res.json())
        .then(data => data.docs ? data.docs.map(formatOpenLibraryBook) : [])
        .catch(err => { console.error('OL Error', err); return []; }),
      fetch(`https://gutendex.com/books/?topic=fiction`)
        .then(res => res.json())
        .then(data => data.results ? data.results.map(formatGutenbergBook) : [])
        .catch(err => { console.error('Gutenberg Error', err); return []; })
    ]);

    return interleaveArrays(gutenbergBooks, openLibraryDocs);
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

getPopularBooks().then(books => {
  console.log("Found", books.length, "books");
  if (books.length > 0) {
    console.log("First book:", JSON.stringify(books[0], null, 2));
  }
}).catch(console.error);
