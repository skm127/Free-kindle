import { readFileSync } from 'fs';
import { join } from 'path';

let cachedBooks = null;

function loadAllBooks() {
  if (!cachedBooks) {
    const drive = JSON.parse(readFileSync(join(process.cwd(), 'public/data/drive_books.json'), 'utf-8'));
    const github = JSON.parse(readFileSync(join(process.cwd(), 'public/data/github_books.json'), 'utf-8'));
    cachedBooks = [...github, ...drive.map(b => ({ ...b, source: 'Google Drive' }))];
  }
  return cachedBooks;
}

export default function handler(req, res) {
  const { q = '', genre, source, limit = 30 } = req.query;
  if (!q || q.length < 2) return res.json({ results: [], total: 0 });

  const query = q.toLowerCase();
  const l = Math.min(parseInt(limit), 50);
  let books = loadAllBooks();

  let results = books.filter(b => {
    const title = (b.title || '').toLowerCase();
    const author = (b.author || '').toLowerCase();
    return title.includes(query) || author.includes(query);
  });

  if (genre) {
    const g = genre.toLowerCase();
    results = results.filter(b => (b.categories || []).some(c => c.toLowerCase().includes(g)));
  }
  if (source) {
    results = results.filter(b => (b.source || '').toLowerCase().includes(source.toLowerCase()));
  }

  results.sort((a, b) => {
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    const aExact = aTitle === query ? 3 : aTitle.startsWith(query) ? 2 : aTitle.includes(query) ? 1 : 0;
    const bExact = bTitle === query ? 3 : bTitle.startsWith(query) ? 2 : bTitle.includes(query) ? 1 : 0;
    return bExact - aExact;
  });

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.json({ results: results.slice(0, l), total: results.length });
}
