/**
 * Annotations and Highlighting Service
 * Manages user highlights, notes, and bookmarks in books
 */

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  cfiRange: string; // EPUB CFI range for the highlight
  color: string;
  timestamp: number;
  pageNumber?: number;
}

export interface Note {
  id: string;
  bookId: string;
  text: string;
  cfiRange: string;
  highlightId?: string;
  timestamp: number;
  pageNumber?: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  cfi: string;
  timestamp: number;
  pageNumber?: number;
  title?: string;
}

class AnnotationsService {
  private highlights: Map<string, Highlight[]> = new Map();
  private notes: Map<string, Note[]> = new Map();
  private bookmarks: Map<string, Bookmark[]> = new Map();
  private storageKey = 'free-kindle-annotations';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load annotations from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        
        if (parsed.highlights) {
          Object.entries(parsed.highlights).forEach(([bookId, highlights]) => {
            this.highlights.set(bookId, highlights as Highlight[]);
          });
        }
        
        if (parsed.notes) {
          Object.entries(parsed.notes).forEach(([bookId, notes]) => {
            this.notes.set(bookId, notes as Note[]);
          });
        }
        
        if (parsed.bookmarks) {
          Object.entries(parsed.bookmarks).forEach(([bookId, bookmarks]) => {
            this.bookmarks.set(bookId, bookmarks as Bookmark[]);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }

  /**
   * Save annotations to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        highlights: Object.fromEntries(this.highlights),
        notes: Object.fromEntries(this.notes),
        bookmarks: Object.fromEntries(this.bookmarks)
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save annotations:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== HIGHLIGHTS ====================

  /**
   * Add a highlight
   */
  addHighlight(bookId: string, text: string, cfiRange: string, color: string = '#ffff00'): Highlight {
    const highlight: Highlight = {
      id: this.generateId(),
      bookId,
      text,
      cfiRange,
      color,
      timestamp: Date.now()
    };

    const bookHighlights = this.highlights.get(bookId) || [];
    bookHighlights.push(highlight);
    this.highlights.set(bookId, bookHighlights);
    this.saveToStorage();

    return highlight;
  }

  /**
   * Get all highlights for a book
   */
  getHighlights(bookId: string): Highlight[] {
    return this.highlights.get(bookId) || [];
  }

  /**
   * Update a highlight
   */
  updateHighlight(highlightId: string, updates: Partial<Highlight>): boolean {
    for (const [bookId, highlights] of this.highlights.entries()) {
      const index = highlights.findIndex(h => h.id === highlightId);
      if (index !== -1) {
        highlights[index] = { ...highlights[index], ...updates };
        this.highlights.set(bookId, highlights);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  /**
   * Delete a highlight
   */
  deleteHighlight(highlightId: string): boolean {
    for (const [bookId, highlights] of this.highlights.entries()) {
      const index = highlights.findIndex(h => h.id === highlightId);
      if (index !== -1) {
        highlights.splice(index, 1);
        this.highlights.set(bookId, highlights);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // ==================== NOTES ====================

  /**
   * Add a note
   */
  addNote(bookId: string, text: string, cfiRange: string, highlightId?: string): Note {
    const note: Note = {
      id: this.generateId(),
      bookId,
      text,
      cfiRange,
      highlightId,
      timestamp: Date.now()
    };

    const bookNotes = this.notes.get(bookId) || [];
    bookNotes.push(note);
    this.notes.set(bookId, bookNotes);
    this.saveToStorage();

    return note;
  }

  /**
   * Get all notes for a book
   */
  getNotes(bookId: string): Note[] {
    return this.notes.get(bookId) || [];
  }

  /**
   * Update a note
   */
  updateNote(noteId: string, updates: Partial<Note>): boolean {
    for (const [bookId, notes] of this.notes.entries()) {
      const index = notes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates };
        this.notes.set(bookId, notes);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  /**
   * Delete a note
   */
  deleteNote(noteId: string): boolean {
    for (const [bookId, notes] of this.notes.entries()) {
      const index = notes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        notes.splice(index, 1);
        this.notes.set(bookId, notes);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // ==================== BOOKMARKS ====================

  /**
   * Add a bookmark
   */
  addBookmark(bookId: string, cfi: string, title?: string): Bookmark {
    const bookmark: Bookmark = {
      id: this.generateId(),
      bookId,
      cfi,
      timestamp: Date.now(),
      title
    };

    const bookBookmarks = this.bookmarks.get(bookId) || [];
    bookBookmarks.push(bookmark);
    this.bookmarks.set(bookId, bookBookmarks);
    this.saveToStorage();

    return bookmark;
  }

  /**
   * Get all bookmarks for a book
   */
  getBookmarks(bookId: string): Bookmark[] {
    return this.bookmarks.get(bookId) || [];
  }

  /**
   * Update a bookmark
   */
  updateBookmark(bookmarkId: string, updates: Partial<Bookmark>): boolean {
    for (const [bookId, bookmarks] of this.bookmarks.entries()) {
      const index = bookmarks.findIndex(b => b.id === bookmarkId);
      if (index !== -1) {
        bookmarks[index] = { ...bookmarks[index], ...updates };
        this.bookmarks.set(bookId, bookmarks);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  /**
   * Delete a bookmark
   */
  deleteBookmark(bookmarkId: string): boolean {
    for (const [bookId, bookmarks] of this.bookmarks.entries()) {
      const index = bookmarks.findIndex(b => b.id === bookmarkId);
      if (index !== -1) {
        bookmarks.splice(index, 1);
        this.bookmarks.set(bookId, bookmarks);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a location is bookmarked
   */
  isBookmarked(bookId: string, cfi: string): boolean {
    const bookmarks = this.getBookmarks(bookId);
    return bookmarks.some(b => b.cfi === cfi);
  }

  /**
   * Toggle bookmark at location
   */
  toggleBookmark(bookId: string, cfi: string, title?: string): Bookmark | null {
    if (this.isBookmarked(bookId, cfi)) {
      const bookmarks = this.getBookmarks(bookId);
      const existing = bookmarks.find(b => b.cfi === cfi);
      if (existing) {
        this.deleteBookmark(existing.id);
      }
      return null;
    } else {
      return this.addBookmark(bookId, cfi, title);
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Get all annotations for a book
   */
  getAllAnnotations(bookId: string): {
    highlights: Highlight[];
    notes: Note[];
    bookmarks: Bookmark[];
  } {
    return {
      highlights: this.getHighlights(bookId),
      notes: this.getNotes(bookId),
      bookmarks: this.getBookmarks(bookId)
    };
  }

  /**
   * Clear all annotations for a book
   */
  clearBookAnnotations(bookId: string): void {
    this.highlights.delete(bookId);
    this.notes.delete(bookId);
    this.bookmarks.delete(bookId);
    this.saveToStorage();
  }

  /**
   * Export annotations for a book
   */
  exportAnnotations(bookId: string): string {
    const annotations = this.getAllAnnotations(bookId);
    return JSON.stringify(annotations, null, 2);
  }

  /**
   * Import annotations for a book
   */
  importAnnotations(bookId: string, data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.highlights) {
        this.highlights.set(bookId, parsed.highlights);
      }
      if (parsed.notes) {
        this.notes.set(bookId, parsed.notes);
      }
      if (parsed.bookmarks) {
        this.bookmarks.set(bookId, parsed.bookmarks);
      }
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import annotations:', error);
      return false;
    }
  }
}

// Export singleton instance
export const annotationsService = new AnnotationsService();