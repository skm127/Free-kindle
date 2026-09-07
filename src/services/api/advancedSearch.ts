/**
 * Advanced Search Service
 * Implements fuzzy search, relevance ranking, and intelligent query processing
 */

import type { Book } from '../../types';

interface SearchQuery {
  terms: string[];
  excludedTerms: string[];
  exactPhrases: string[];
  filters: {
    author?: string;
    category?: string;
    source?: string;
    year?: number;
  };
}

interface SearchResult {
  book: Book;
  score: number;
  matchDetails: {
    titleMatch: boolean;
    authorMatch: boolean;
    categoryMatch: boolean;
    descriptionMatch: boolean;
  };
}

class AdvancedSearchService {
  /**
   * Parse search query into structured components
   */
  private parseQuery(query: string): SearchQuery {
    const terms: string[] = [];
    const excludedTerms: string[] = [];
    const exactPhrases: string[] = [];
    const filters: SearchQuery['filters'] = {};

    // Extract exact phrases in quotes
    const phraseRegex = /"([^"]+)"/g;
    let match;
    while ((match = phraseRegex.exec(query)) !== null) {
      exactPhrases.push(match[1].toLowerCase());
      query = query.replace(match[0], '');
    }

    // Extract filters (author:, category:, source:, year:)
    const filterRegex = /(author|category|source|year):([^\s]+)/g;
    while ((match = filterRegex.exec(query)) !== null) {
      const [, filterType, value] = match;
      if (filterType === 'year') {
        filters.year = parseInt(value);
      } else {
        filters[filterType as keyof typeof filters] = value.toLowerCase();
      }
      query = query.replace(match[0], '');
    }

    // Extract excluded terms (prefixed with -)
    const excludeRegex = /-([^\s]+)/g;
    while ((match = excludeRegex.exec(query)) !== null) {
      excludedTerms.push(match[1].toLowerCase());
      query = query.replace(match[0], '');
    }

    // Remaining terms are regular search terms
    const remainingTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    terms.push(...remainingTerms);

    return { terms, excludedTerms, exactPhrases, filters };
  }

  /**
   * Calculate relevance score for a book
   */
  private calculateRelevanceScore(book: Book, query: SearchQuery): number {
    let score = 0;
    const matchDetails = {
      titleMatch: false,
      authorMatch: false,
      categoryMatch: false,
      descriptionMatch: false
    };

    const titleLower = (book.title || '').toLowerCase();
    const authorLower = (book.author || '').toLowerCase();
    const descriptionLower = (book.description || '').toLowerCase();
    const categoriesLower = (book.categories || []).map(c => c.toLowerCase());

    // 1. Check excluded terms (should exclude if present)
    for (const excludedTerm of query.excludedTerms) {
      if (titleLower.includes(excludedTerm) || 
          authorLower.includes(excludedTerm) ||
          descriptionLower.includes(excludedTerm) ||
          categoriesLower.some(c => c.includes(excludedTerm))) {
        return -1; // Exclude this book
      }
    }

    // 2. Check filters
    if (query.filters.author && !authorLower.includes(query.filters.author)) {
      return -1;
    }
    if (query.filters.category && !categoriesLower.some(c => c.includes(query.filters.category!))) {
      return -1;
    }
    if (query.filters.source && book.source?.toLowerCase() !== query.filters.source) {
      return -1;
    }
    if (query.filters.year) {
      const bookYear = book.publishedDate ? parseInt(book.publishedDate) : 0;
      if (Math.abs(bookYear - query.filters.year) > 1) {
        return -1;
      }
    }

    // 3. Exact phrase matches (highest weight)
    for (const phrase of query.exactPhrases) {
      if (titleLower.includes(phrase)) {
        score += 100;
        matchDetails.titleMatch = true;
      }
      if (authorLower.includes(phrase)) {
        score += 80;
        matchDetails.authorMatch = true;
      }
      if (descriptionLower.includes(phrase)) {
        score += 40;
        matchDetails.descriptionMatch = true;
      }
      if (categoriesLower.some(c => c.includes(phrase))) {
        score += 60;
        matchDetails.categoryMatch = true;
      }
    }

    // 4. Regular term matches
    for (const term of query.terms) {
      // Title matches (very high weight)
      if (titleLower === term) {
        score += 90;
        matchDetails.titleMatch = true;
      } else if (titleLower.startsWith(term)) {
        score += 70;
        matchDetails.titleMatch = true;
      } else if (titleLower.includes(term)) {
        score += 50;
        matchDetails.titleMatch = true;
      }

      // Author matches (high weight)
      if (authorLower === term) {
        score += 85;
        matchDetails.authorMatch = true;
      } else if (authorLower.includes(term)) {
        score += 60;
        matchDetails.authorMatch = true;
      }

      // Category matches (medium weight)
      if (categoriesLower.some(c => c.includes(term))) {
        score += 45;
        matchDetails.categoryMatch = true;
      }

      // Description matches (lower weight)
      if (descriptionLower.includes(term)) {
        score += 25;
        matchDetails.descriptionMatch = true;
      }
    }

    // 5. Boost for multiple term matches
    const matchedTermsCount = query.terms.filter(term => 
      titleLower.includes(term) || 
      authorLower.includes(term) ||
      descriptionLower.includes(term) ||
      categoriesLower.some(c => c.includes(term))
    ).length;

    if (matchedTermsCount > 1) {
      score += matchedTermsCount * 10;
    }

    // 6. Boost for recently published books
    if (book.publishedDate) {
      const year = parseInt(book.publishedDate);
      if (!isNaN(year)) {
        const age = 2024 - year;
        if (age < 2) score += 15;
        else if (age < 5) score += 10;
        else if (age < 10) score += 5;
      }
    }

    // 7. Boost for books with covers (better user experience)
    if (book.cover || book.coverUrl) {
      score += 5;
    }

    return score;
  }

  /**
   * Perform advanced search
   */
  async search(query: string, books: Book[], maxResults: number = 40): Promise<Book[]> {
    if (!query.trim() || books.length === 0) {
      return [];
    }

    const parsedQuery = this.parseQuery(query);
    const results: SearchResult[] = [];

    for (const book of books) {
      const score = this.calculateRelevanceScore(book, parsedQuery);
      
      if (score > 0) {
        results.push({
          book,
          score,
          matchDetails: {
            titleMatch: score >= 50,
            authorMatch: score >= 60 && score <= 90,
            categoryMatch: score >= 40 && score <= 50,
            descriptionMatch: score >= 20 && score <= 40
          }
        });
      }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Return top results
    return results.slice(0, maxResults).map(result => result.book);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, books: Book[], maxSuggestions: number = 5): Promise<string[]> {
    if (!query.trim() || books.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();

    for (const book of books) {
      // Title suggestions
      if (book.title?.toLowerCase().startsWith(queryLower)) {
        suggestions.add(book.title);
      }

      // Author suggestions
      if (book.author?.toLowerCase().startsWith(queryLower)) {
        suggestions.add(book.author);
      }

      // Category suggestions
      for (const category of book.categories || []) {
        if (category.toLowerCase().startsWith(queryLower)) {
          suggestions.add(category);
        }
      }

      if (suggestions.size >= maxSuggestions * 2) {
        break;
      }
    }

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Perform fuzzy search (tolerates typos)
   */
  private fuzzyMatch(text: string, pattern: string, tolerance: number = 2): boolean {
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    if (textLower.includes(patternLower)) {
      return true;
    }

    // Simple Levenshtein distance for short patterns
    if (patternLower.length <= 8) {
      let distance = 0;
      const patternLen = patternLower.length;
      const textLen = textLower.length;

      for (let i = 0; i < Math.min(patternLen, textLen); i++) {
        if (patternLower[i] !== textLower[i]) {
          distance++;
        }
      }

      distance += Math.abs(patternLen - textLen);
      return distance <= tolerance;
    }

    return false;
  }

  /**
   * Search with fuzzy matching
   */
  async fuzzySearch(query: string, books: Book[], maxResults: number = 40): Promise<Book[]> {
    if (!query.trim() || books.length === 0) {
      return [];
    }

    const queryLower = query.toLowerCase();
    const results: Array<{ book: Book; score: number }> = [];

    for (const book of books) {
      let score = 0;

      // Fuzzy title match
      if (this.fuzzyMatch(book.title || '', queryLower)) {
        score += 40;
      }

      // Fuzzy author match
      if (this.fuzzyMatch(book.author || '', queryLower)) {
        score += 30;
      }

      // Fuzzy category match
      for (const category of book.categories || []) {
        if (this.fuzzyMatch(category, queryLower)) {
          score += 20;
          break;
        }
      }

      if (score > 0) {
        results.push({ book, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, maxResults).map(result => result.book);
  }
}

// Export singleton instance
export const advancedSearchService = new AdvancedSearchService();