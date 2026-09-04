process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import fs from 'fs';
import path from 'path';

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/\.(epub|pdf|mobi|azw3)$/i, '')
    .replace(/by\s+.*$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveCover(title) {
  const cleaned = cleanTitle(title);
  if (!cleaned) return null;

  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleaned)}&fields=title,cover_i&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data.docs?.[0];
    if (doc?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
  } catch (_e) {}
  return null;
}

async function run() {
  console.log('--- Resolving GitHub Books Covers ---');
  const ghPath = path.join(process.cwd(), 'public/data/github_books.json');
  const ghBooks = JSON.parse(fs.readFileSync(ghPath, 'utf8'));

  let ghUpdated = 0;
  for (let i = 0; i < ghBooks.length; i++) {
    const b = ghBooks[i];
    const currentCover = b.cover_url || b.coverUrl || '';
    if (!currentCover.includes('/b/id/')) {
      const cover = await resolveCover(b.title);
      if (cover) {
        b.cover_url = cover;
        b.coverUrl = cover;
        ghUpdated++;
      }
      // Small pause to avoid rate-limiting
      await new Promise(r => setTimeout(r, 120));
    }
    if ((i + 1) % 25 === 0) {
      console.log(`GitHub books processed: ${i + 1}/${ghBooks.length} (updated: ${ghUpdated})`);
    }
  }

  fs.writeFileSync(ghPath, JSON.stringify(ghBooks, null, 2));
  console.log(`GitHub Books complete: ${ghUpdated} covers updated.`);

  console.log('--- Resolving Drive Books Covers (Top 300) ---');
  const drivePath = path.join(process.cwd(), 'public/data/drive_books.json');
  const driveBooks = JSON.parse(fs.readFileSync(drivePath, 'utf8'));

  let driveUpdated = 0;
  const limit = Math.min(300, driveBooks.length);
  for (let i = 0; i < limit; i++) {
    const b = driveBooks[i];
    const currentCover = b.cover_url || b.coverUrl || '';
    if (!currentCover.includes('/b/id/')) {
      const cover = await resolveCover(b.title);
      if (cover) {
        b.cover_url = cover;
        driveUpdated++;
      }
      await new Promise(r => setTimeout(r, 120));
    }
    if ((i + 1) % 25 === 0) {
      console.log(`Drive books processed: ${i + 1}/${limit} (updated: ${driveUpdated})`);
    }
  }

  fs.writeFileSync(drivePath, JSON.stringify(driveBooks, null, 2));
  console.log(`Drive Books complete: ${driveUpdated} covers updated.`);
}

run();
