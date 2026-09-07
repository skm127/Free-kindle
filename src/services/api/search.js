import { getDriveBooks, getGithubBooks, formatDriveBook } from './books.js';
import { 
  fetchInternetArchiveSearch, 
  fetchOpenLibrarySearch, 
  fetchGutenbergSearch,
  fetchAllSources,
  interleaveArrays 
} from './external.js';
import { securityService, rateLimiters } from '../security.ts';

export const searchBooks = async (query, maxResults = 40) => {
  // Apply rate limiting
  const userId = 'search_user'; // In production, use actual user ID
  if (!securityService.checkRateLimit(userId, rateLimiters.search)) {
    console.warn('Search rate limit exceeded');
    return [];
  }

  // Sanitize input
  const sanitizedQuery = securityService.sanitizeInput(query);
  
  try {
    // Try to use advanced search service first
    try {
      const { advancedSearchService } = await import('./advancedSearch.ts');
      const [allDriveBooks, allGhBooks] = await Promise.all([
        getDriveBooks(),
        getGithubBooks()
      ]);
      
      const allLocalBooks = [...allGhBooks, ...allDriveBooks.map(formatDriveBook)];
      const advancedResults = await advancedSearchService.search(sanitizedQuery, allLocalBooks, maxResults);
      
      if (advancedResults.length > 0) {
        return advancedResults;
      }
    } catch (advancedError) {
      console.warn('Advanced search failed, falling back to basic search:', advancedError);
    }

    // Try multi-source search first for broader results
    try {
      const multiSourceResults = await fetchAllSources(sanitizedQuery, Math.ceil(maxResults / 2));
      if (multiSourceResults.length > 0) {
        // Combine with local search for comprehensive results
        const [allDriveBooks, allGhBooks] = await Promise.all([
          getDriveBooks(),
          getGithubBooks()
        ]);
        
        const allLocalBooks = [...allGhBooks, ...allDriveBooks.map(formatDriveBook)];
        const queryWords = sanitizedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        
        // Fast search local books
        const localMatches = allLocalBooks
          .map(b => {
            const titleLower = (b.title || '').toLowerCase();
            const authorLower = (b.author || '').toLowerCase();
            const combined = `${titleLower} ${authorLower}`;
            
            if (titleLower === sanitizedQuery.toLowerCase()) return { ...b, score: 100 };
            if (titleLower.startsWith(sanitizedQuery.toLowerCase())) return { ...b, score: 80 };
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
          .slice(0, 20);
        
        return interleaveArrays(localMatches, multiSourceResults).slice(0, maxResults);
      }
    } catch (multiSourceError) {
      console.warn('Multi-source search failed, falling back to original search:', multiSourceError);
    }

    // Fallback to original search logic
    const [allDriveBooks, allGhBooks, iaBooks, openLibraryDocs, gutenbergBooks] = await Promise.all([
      getDriveBooks(),
      getGithubBooks(),
      fetchInternetArchiveSearch(sanitizedQuery, 10).catch(() => []),
      fetchOpenLibrarySearch(sanitizedQuery, 8).catch(() => []),
      fetchGutenbergSearch(sanitizedQuery).catch(() => [])
    ]);
    
    const queryWords = sanitizedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    
    // Fast search Google Drive indexed books
    const driveMatches = allDriveBooks
      .map(b => {
        const titleLower = (b.title || '').toLowerCase();
        const authorLower = (b.author || '').toLowerCase();
        const combined = `${titleLower} ${authorLower}`;
        
        if (titleLower === sanitizedQuery.toLowerCase()) return { ...b, score: 100 };
        if (titleLower.startsWith(sanitizedQuery.toLowerCase())) return { ...b, score: 80 };
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
        
        if (titleLower === sanitizedQuery.toLowerCase()) return { ...b, score: 95 };
        if (titleLower.startsWith(sanitizedQuery.toLowerCase())) return { ...b, score: 75 };
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
