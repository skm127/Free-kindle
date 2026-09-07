import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, User, ReadingProgress, ReaderSettings } from '../types';

interface AppState {
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Book State
  books: Book[];
  setBooks: (books: Book[]) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
  
  // User State
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Readlist State
  readlist: Book[];
  toggleReadlist: (book: Book) => void;
  isInReadlist: (bookId: string) => boolean;
  
  // Reading Progress
  readingProgress: ReadingProgress;
  updateProgress: (bookId: string, location: number | string) => void;
  
  // Recommendations
  recommendations: Book[];
  setRecommendations: (books: Book[]) => void;
  
  // Reader State
  isReading: boolean;
  setIsReading: (reading: boolean) => void;
  
  // Reader Settings
  readerSettings: ReaderSettings;
  updateReaderSettings: (settings: Partial<ReaderSettings>) => void;
}

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 100,
  theme: 'dark',
  lineHeight: 1.6
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Book State
      books: [],
      setBooks: (books) => set({ books }),
      selectedBook: null,
      setSelectedBook: (book) => set({ selectedBook: book }),
      isLoading: true,
      setIsLoading: (loading) => set({ isLoading: loading }),
      errorMsg: '',
      setErrorMsg: (msg) => set({ errorMsg: msg }),
      
      // User State
      user: null,
      setUser: (user) => set({ user }),
      
      // Readlist State
      readlist: [],
      toggleReadlist: (book) => set((state) => ({
        readlist: state.readlist.some(b => b.id === book.id)
          ? state.readlist.filter(b => b.id !== book.id)
          : [...state.readlist, book]
      })),
      isInReadlist: (bookId) => get().readlist.some(b => b.id === bookId),
      
      // Reading Progress
      readingProgress: {},
      updateProgress: (bookId, location) => set((state) => ({
        readingProgress: { ...state.readingProgress, [bookId]: location }
      })),
      
      // Recommendations
      recommendations: [],
      setRecommendations: (books) => set({ recommendations: books }),
      
      // Reader State
      isReading: false,
      setIsReading: (reading) => set({ isReading: reading }),
      
      // Reader Settings
      readerSettings: DEFAULT_READER_SETTINGS,
      updateReaderSettings: (settings) => set((state) => ({
        readerSettings: { ...state.readerSettings, ...settings }
      })),
    }),
    {
      name: 'free-kindle-storage',
      partialize: (state) => ({
        user: state.user,
        readlist: state.readlist,
        readingProgress: state.readingProgress,
        readerSettings: state.readerSettings,
      }),
    }
  )
);