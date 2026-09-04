import { getDriveBooks, getGithubBooks, formatDriveBook } from './books.js';
import { 
  fetchInternetArchiveSearch, 
  fetchOpenLibrarySearch, 
  fetchGutenbergSearch, 
  interleaveArrays 
} from './external.js';

export const searchBooks = async (query, maxResults = 40) => {
  try {
    const [allDriveBooks, allGhBooks, iaBooks, openLibraryDocs, gutenbergBooks] = await Promise.all([
      getDriveBooks(),
      getGithubBooks(),
      fetchInternetArchiveSearch(query, 10).catch(() => []),
      fetchOpenLibrarySearch(query, 8).catch(() => []),
      fetchGutenbergSearch(query).catch(() => [])
    ]);
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    
    // Fast search Google Drive indexed books
    const driveMatches = allDriveBooks
      .map(b => {
        const titleLower = (b.title || '').toLowerCase();
        const authorLower = (b.author || '').toLowerCase();
        const combined = `${titleLower} ${authorLower}`;
        
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
      .slice(0, 25)
      .map(formatDriveBook);

    // Fast search GitHub books
    const ghMatches = allGhBooks
      .map(b => {
        const titleLower = (b.title || '').toLowerCase();
        const authorLower = (b.author || '').toLowerCase();
        const catLower = (b.categories || []).join(' ').toLowerCase();
        const combined = `${titleLower} ${authorLower} ${catLower}`;
        
        if (titleLower === query.toLowerCase()) return { ...b, score: 95 };
        if (titleLower.startsWith(query.toLowerCase())) return { ...b, score: 75 };
        const allMatch = queryWords.length > 0 && queryWords.every(w => combined.includes(w));
        if (allMatch) return { ...b, score: 55 };
        const anyWord = queryWords.some(w => combined.includes(w));
        if (anyWord) return { ...b, score: 35 };
        return null;
      })
      .filter(b => b !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    const curatedLocal = interleaveArrays(driveMatches, ghMatches);
    const onlineBooks = interleaveArrays(iaBooks, interleaveArrays(gutenbergBooks, openLibraryDocs));
    return interleaveArrays(curatedLocal, onlineBooks).slice(0, maxResults);
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
};
