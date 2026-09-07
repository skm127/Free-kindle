/**
 * Advanced Recommendation Service
 * Implements collaborative filtering, content-based filtering, and hybrid approaches
 */

import type { Book } from '../../types';

interface UserPreference {
  bookId: string;
  rating: number;
  timestamp: number;
}

interface RecommendationWeights {
  contentBased: number;
  collaborative: number;
  popularity: number;
  diversity: number;
}

class RecommendationService {
  private userPreferences: Map<string, UserPreference[]> = new Map();
  private bookSimilarityCache: Map<string, Map<string, number>> = new Map();
  private popularBooks: Book[] = [];
  private weights: RecommendationWeights = {
    contentBased: 0.4,
    collaborative: 0.3,
    popularity: 0.2,
    diversity: 0.1
  };

  /**
   * Calculate similarity between two books using multiple factors
   */
  private calculateBookSimilarity(book1: Book, book2: Book): number {
    const cacheKey = `${book1.id}_${book2.id}`;
    const reverseCacheKey = `${book2.id}_${book1.id}`;
    
    // Check cache
    if (this.bookSimilarityCache.has(cacheKey)) {
      return this.bookSimilarityCache.get(cacheKey)!;
    }
    if (this.bookSimilarityCache.has(reverseCacheKey)) {
      return this.bookSimilarityCache.get(reverseCacheKey)!;
    }

    let similarityScore = 0;

    // 1. Author similarity (30% weight)
    if (book1.author === book2.author) {
      similarityScore += 0.3;
    } else if (book1.authors && book2.authors) {
      const sharedAuthors = book1.authors.filter(a => book2.authors?.includes(a));
      if (sharedAuthors.length > 0) {
        similarityScore += 0.15 * sharedAuthors.length;
      }
    }

    // 2. Category/Genre similarity (40% weight)
    const categories1 = new Set(book1.categories || []);
    const categories2 = new Set(book2.categories || []);
    const intersection = new Set([...categories1].filter(x => categories2.has(x)));
    const union = new Set([...categories1, ...categories2]);
    
    if (union.size > 0) {
      const jaccardSimilarity = intersection.size / union.size;
      similarityScore += 0.4 * jaccardSimilarity;
    }

    // 3. Title similarity using word overlap (20% weight)
    const words1 = new Set(book1.title.toLowerCase().split(/\s+/));
    const words2 = new Set(book2.title.toLowerCase().split(/\s+/));
    const titleIntersection = new Set([...words1].filter(x => words2.has(x)));
    const titleUnion = new Set([...words1, ...words2]);
    
    if (titleUnion.size > 0) {
      const titleSimilarity = titleIntersection.size / titleUnion.size;
      similarityScore += 0.2 * titleSimilarity;
    }

    // 4. Source similarity (10% weight)
    if (book1.source === book2.source) {
      similarityScore += 0.1;
    }

    // Cache the result
    this.bookSimilarityCache.set(cacheKey, similarityScore);
    
    return similarityScore;
  }

  /**
   * Content-based filtering: recommend books similar to user's readlist
   */
  private contentBasedRecommendations(readlist: Book[], allBooks: Book[]): Map<string, number> {
    const scores = new Map<string, number>();

    for (const readBook of readlist) {
      for (const candidateBook of allBooks) {
        if (candidateBook.id === readBook.id) continue;

        const similarity = this.calculateBookSimilarity(readBook, candidateBook);
        const currentScore = scores.get(candidateBook.id) || 0;
        scores.set(candidateBook.id, currentScore + similarity);
      }
    }

    return scores;
  }

  /**
   * Collaborative filtering: recommend based on similar users' preferences
   */
  private collaborativeFilteringRecommendations(
    userReadlist: Book[],
    allUsersPreferences: Map<string, UserPreference[]>,
    allBooks: Book[]
  ): Map<string, number> {
    const scores = new Map<string, number>();
    const userBookIds = new Set(userReadlist.map(b => b.id));

    // Find similar users
    const similarUsers: Array<{ userId: string; similarity: number }> = [];

    for (const [userId, preferences] of allUsersPreferences) {
      if (userId === 'current') continue; // Skip current user

      const userBookIds2 = new Set(preferences.map(p => p.bookId));
      const intersection = new Set([...userBookIds].filter(x => userBookIds2.has(x)));
      const union = new Set([...userBookIds, ...userBookIds2]);

      if (union.size > 0) {
        const similarity = intersection.size / union.size;
        if (similarity > 0.1) { // Only consider reasonably similar users
          similarUsers.push({ userId, similarity });
        }
      }
    }

    // Aggregate recommendations from similar users
    for (const { userId, similarity } of similarUsers) {
      const preferences = allUsersPreferences.get(userId) || [];
      
      for (const pref of preferences) {
        if (userBookIds.has(pref.bookId)) continue; // Skip books user already read

        const weightedScore = pref.rating * similarity;
        const currentScore = scores.get(pref.bookId) || 0;
        scores.set(pref.bookId, currentScore + weightedScore);
      }
    }

    return scores;
  }

  /**
   * Popularity-based recommendations
   */
  private popularityBasedRecommendations(allBooks: Book[]): Map<string, number> {
    const scores = new Map<string, number>();

    // Simulate popularity based on various factors
    for (const book of allBooks) {
      let popularityScore = 0;

      // Newer books might be more popular
      if (book.publishedDate) {
        const year = parseInt(book.publishedDate);
        if (!isNaN(year)) {
          const age = 2024 - year;
          popularityScore += Math.max(0, 10 - age) * 0.1;
        }
      }

      // Books with more categories might be more discoverable
      if (book.categories && book.categories.length > 0) {
        popularityScore += book.categories.length * 0.05;
      }

      // Random factor to simulate real popularity variance
      popularityScore += Math.random() * 0.2;

      scores.set(book.id, popularityScore);
    }

    return scores;
  }

  /**
   * Diversity-based recommendations to ensure variety
   */
  private diversityBasedRecommendations(
    recommendedBooks: Book[],
    allBooks: Book[]
  ): Map<string, number> {
    const scores = new Map<string, number>();
    const recommendedCategories = new Set<string>();

    // Collect categories from already recommended books
    for (const book of recommendedBooks) {
      (book.categories || []).forEach(cat => recommendedCategories.add(cat));
    }

    // Boost books from underrepresented categories
    for (const book of allBooks) {
      if (recommendedBooks.some(rb => rb.id === book.id)) continue;

      const bookCategories = book.categories || [];
      const underrepresentedCategories = bookCategories.filter(
        cat => !recommendedCategories.has(cat)
      );

      if (underrepresentedCategories.length > 0) {
        const diversityScore = underrepresentedCategories.length * 0.1;
        const currentScore = scores.get(book.id) || 0;
        scores.set(book.id, currentScore + diversityScore);
      }
    }

    return scores;
  }

  /**
   * Get hybrid recommendations combining multiple approaches
   */
  async getRecommendations(
    readlist: Book[],
    allBooks: Book[],
    options?: Partial<RecommendationWeights>
  ): Promise<Book[]> {
    // Update weights if provided
    if (options) {
      this.weights = { ...this.weights, ...options };
    }

    if (readlist.length === 0) {
      // If no readlist, return popular books
      return this.popularBooks.slice(0, 20);
    }

    // Get scores from different approaches
    const contentScores = this.contentBasedRecommendations(readlist, allBooks);
    const collaborativeScores = this.collaborativeFilteringRecommendations(
      readlist,
      this.userPreferences,
      allBooks
    );
    const popularityScores = this.popularityBasedRecommendations(allBooks);

    // Combine scores with weights
    const combinedScores = new Map<string, number>();

    for (const book of allBooks) {
      if (readlist.some(rb => rb.id === book.id)) continue;

      const contentScore = contentScores.get(book.id) || 0;
      const collaborativeScore = collaborativeScores.get(book.id) || 0;
      const popularityScore = popularityScores.get(book.id) || 0;

      const combinedScore =
        contentScore * this.weights.contentBased +
        collaborativeScore * this.weights.collaborative +
        popularityScore * this.weights.popularity;

      if (combinedScore > 0) {
        combinedScores.set(book.id, combinedScore);
      }
    }

    // Convert to array and sort by score
    const recommendations = Array.from(combinedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([bookId]) => allBooks.find(b => b.id === bookId))
      .filter((book): book is Book => book !== undefined);

    // Apply diversity boost
    const diversityScores = this.diversityBasedRecommendations(recommendations, allBooks);
    for (const [bookId, diversityScore] of diversityScores) {
      const index = recommendations.findIndex(b => b.id === bookId);
      if (index !== -1) {
        // Move book up in recommendations based on diversity score
        const book = recommendations.splice(index, 1)[0];
        const insertIndex = Math.max(0, Math.floor(recommendations.length * (1 - diversityScore)));
        recommendations.splice(insertIndex, 0, book);
      }
    }

    return recommendations.slice(0, 20);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: UserPreference[]): void {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Set popular books (would normally come from analytics)
   */
  setPopularBooks(books: Book[]): void {
    this.popularBooks = books;
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.bookSimilarityCache.clear();
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();