import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const coversDir = path.join(process.cwd(), 'public/covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

async function extractCoverFromEpub(url, outputFilePath) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);

    let coverEntry = null;
    zip.forEach((relPath, file) => {
      const lower = relPath.toLowerCase();
      if (lower.includes('cover') && lower.match(/\.(jpg|jpeg|png)$/i)) {
        coverEntry = file;
      }
    });

    // If no file with "cover" in name, find first image
    if (!coverEntry) {
      zip.forEach((relPath, file) => {
        const lower = relPath.toLowerCase();
        if (!coverEntry && lower.match(/\.(jpg|jpeg|png)$/i) && (lower.includes('image') || lower.includes('oebps'))) {
          coverEntry = file;
        }
      });
    }

    if (coverEntry) {
      const imgData = await coverEntry.async('nodebuffer');
      fs.writeFileSync(outputFilePath, imgData);
      return true;
    }
  } catch (err) {
    console.error('Error extracting cover from', url, err.message);
  }
  return false;
}

async function run() {
  const ghPath = path.join(process.cwd(), 'public/data/github_books.json');
  let ghBooks = JSON.parse(fs.readFileSync(ghPath, 'utf8'));

  // Ensure Deep Work is added with its REAL readable EPUB from the repo
  let dw = ghBooks.find(b => b.title && b.title.toLowerCase().includes('deep work'));
  if (!dw) {
    dw = {
      id: 'rm_deep_work_cal_newport',
      title: 'Deep Work: Rules for Focused Success in a Distracted World',
      author: 'Cal Newport',
      authors: ['Cal Newport'],
      categories: ['Self-Help & Mind', 'Bestsellers', 'Personal Growth'],
      download_url: 'https://raw.githubusercontent.com/rishabhmodi03/BOOKS/master/1.%20150/Deep%20work%20rules%20for%20focused%20success%20in%20a%20distracted%20world.epub',
      webReaderLink: 'https://raw.githubusercontent.com/rishabhmodi03/BOOKS/master/1.%20150/Deep%20work%20rules%20for%20focused%20success%20in%20a%20distracted%20world.epub',
      previewLink: 'https://raw.githubusercontent.com/rishabhmodi03/BOOKS/master/1.%20150/Deep%20work%20rules%20for%20focused%20success%20in%20a%20distracted%20world.epub',
      cover_url: '',
      coverUrl: '',
      source: 'Self-Improvement Library'
    };
    ghBooks.unshift(dw);
  } else {
    dw.download_url = 'https://raw.githubusercontent.com/rishabhmodi03/BOOKS/master/1.%20150/Deep%20work%20rules%20for%20focused%20success%20in%20a%20distracted%20world.epub';
    dw.webReaderLink = dw.download_url;
    dw.author = 'Cal Newport';
    dw.authors = ['Cal Newport'];
  }

  console.log('Extracting official covers from EPUBs for top books...');
  let extractedCount = 0;

  for (let i = 0; i < ghBooks.length; i++) {
    const b = ghBooks[i];
    const url = b.download_url || '';
    if (url.endsWith('.epub') || url.includes('raw.githubusercontent.com')) {
      const coverFileName = `${b.id}.jpg`;
      const outPath = path.join(coversDir, coverFileName);

      // Check if already extracted
      if (!fs.existsSync(outPath)) {
        const ok = await extractCoverFromEpub(url, outPath);
        if (ok) {
          b.cover_url = `/covers/${coverFileName}`;
          b.coverUrl = `/covers/${coverFileName}`;
          extractedCount++;
          console.log(`[${extractedCount}] Extracted official cover for: ${b.title}`);
        }
      } else {
        b.cover_url = `/covers/${coverFileName}`;
        b.coverUrl = `/covers/${coverFileName}`;
      }

      // Limit to first 60 major books to stay fast
      if (extractedCount >= 50) break;
    }
  }

  // Explicitly make sure Atomic Habits has its official extracted cover
  const ah = ghBooks.find(b => b.title && b.title.includes('Atomic Habits'));
  if (ah) {
    const ahCoverPath = path.join(coversDir, `${ah.id}.jpg`);
    if (!fs.existsSync(ahCoverPath)) {
      await extractCoverFromEpub(ah.download_url, ahCoverPath);
    }
    ah.cover_url = `/covers/${ah.id}.jpg`;
    ah.coverUrl = `/covers/${ah.id}.jpg`;
    console.log('Atomic Habits cover set to:', ah.cover_url);
  }

  // Explicitly make sure Deep Work has its official extracted cover
  if (dw) {
    const dwCoverPath = path.join(coversDir, `${dw.id}.jpg`);
    if (!fs.existsSync(dwCoverPath)) {
      await extractCoverFromEpub(dw.download_url, dwCoverPath);
    }
    dw.cover_url = `/covers/${dw.id}.jpg`;
    dw.coverUrl = `/covers/${dw.id}.jpg`;
    console.log('Deep Work cover set to:', dw.cover_url);
  }

  fs.writeFileSync(ghPath, JSON.stringify(ghBooks, null, 2));
  console.log(`Complete! Extracted ${extractedCount} official publisher covers into /covers/`);
}

run();
