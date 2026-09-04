import { readFileSync } from 'fs';
import { join } from 'path';

let cachedDriveBooks = null;
let cachedGithubBooks = null;

function loadBooks() {
  if (!cachedDriveBooks) {
    cachedDriveBooks = JSON.parse(readFileSync(join(process.cwd(), 'public/data/drive_books.json'), 'utf-8'));
  }
  if (!cachedGithubBooks) {
    cachedGithubBooks = JSON.parse(readFileSync(join(process.cwd(), 'public/data/github_books.json'), 'utf-8'));
  }
  return { drive: cachedDriveBooks, github: cachedGithubBooks };
}

export default function handler(req, res) {
  const { page = 1, limit = 20, genre, sort = 'popular', source } = req.query;
  const p = parseInt(page);
  const l = Math.min(parseInt(limit), 50);

  const { drive, github } = loadBooks();
  let allBooks = [...github];

  drive.forEach(b => {
    allBooks.push({
      id: b.id, title: b.title || 'Untitled', author: b.author || 'Unknown',
      categories: ['E-Books'], source: 'Google Drive',
      download_url: b.download_url, cover_url: b.cover_url
    });
  });

  if (genre) {
    const g = genre.toLowerCase();
    allBooks = allBooks.filter(b => (b.categories || []).some(c => c.toLowerCase().includes(g)));
  }
  if (source) {
    allBooks = allBooks.filter(b => (b.source || '').toLowerCase().includes(source.toLowerCase()));
  }

  if (sort === 'title') allBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else if (sort === 'author') allBooks.sort((a, b) => (a.author || '').localeCompare(b.author || ''));

  const total = allBooks.length;
  const start = (p - 1) * l;
  const results = allBooks.slice(start, start + l);

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.json({ books: results, total, page: p, limit: l, totalPages: Math.ceil(total / l) });
}
