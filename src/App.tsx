import React, { useState, useEffect, Suspense, lazy } from 'react';
import { getPopularBooks, getRecommendations } from './services/api/index.js';
import { subscribeToAuthChanges, logoutUser } from './services/firebase';
import { analyticsService } from './services/analytics';
import Sidebar from './components/Sidebar';
import BookModal from './components/BookModal';
import Accessibility from './components/Accessibility';
import './index.css';
import type { Book, User, ReadingProgress } from './types';

// Lazy load components for code splitting
const HomeView = lazy(() => import('./components/HomeView'));
const CatalogView = lazy(() => import('./components/CatalogView'));
const SearchView = lazy(() => import('./components/SearchView'));
const LoginView = lazy(() => import('./components/LoginView'));
const BookshelfView = lazy(() => import('./components/BookshelfView'));
const ReaderView = lazy(() => import('./components/ReaderView'));
const WebImportView = lazy(() => import('./components/WebImportView'));
const RankingsView = lazy(() => import('./components/RankingsView'));

// Loading component for Suspense fallback
const LoadingView = () => (
  <div className="loader-container">
    <div className="loader"></div>
  </div>
);

const safeParse = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.warn(`Corrupted localStorage key "${key}", resetting.`);
    localStorage.removeItem(key);
    return fallback;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Auth and Readlist state
  const [user, setUser] = useState<User | null>(() => safeParse<User | null>('free-kindle-user', null));
  const [readlist, setReadlist] = useState<Book[]>(() => safeParse<Book[]>('free-kindle-readlist', []));
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(() => safeParse<ReadingProgress>('free-kindle-progress', {}));

  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [isReading, setIsReading] = useState<boolean>(false);

  // Subscribe to real Firebase auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('free-kindle-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('free-kindle-readlist', JSON.stringify(readlist));
  }, [readlist]);

  useEffect(() => {
    localStorage.setItem('free-kindle-progress', JSON.stringify(readingProgress));
  }, [readingProgress]);

  // Fetch recommendations when readlist changes
  useEffect(() => {
    let cancelled = false;
    if (readlist.length > 0) {
      getRecommendations(readlist).then(data => {
        if (!cancelled) setRecommendations(data);
      });
    } else {
      setRecommendations([]);
    }
    return () => { cancelled = true; };
  }, [readlist]);

  // Readlist helper functions
  const toggleReadlist = (book: Book) => {
    setReadlist(prev => {
      if (prev.some(b => b.id === book.id)) {
        return prev.filter(b => b.id !== book.id); // Remove
      } else {
        return [...prev, book]; // Add
      }
    });
  };

  const isInReadlist = (bookId: string): boolean => {
    return readlist.some(b => b.id === bookId);
  };

  const updateProgress = (bookId: string, location: number | string) => {
    setReadingProgress(prev => ({
      ...prev,
      [bookId]: location
    }));
  };

  const handleReadBook = (book: Book) => {
    setSelectedBook(book);
    setIsReading(true);
    analyticsService.trackBookReadStart(book.id, book.title);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_e) { /* ignore */ }
    setUser(null);
    localStorage.removeItem('free-kindle-user');
  };

  useEffect(() => {
    const loadInitialBooks = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const popularBooks = await getPopularBooks();
        setBooks(popularBooks);
        if (popularBooks.length === 0) {
          setErrorMsg('No books found. Check your internet connection.');
        }
      } catch (err) {
        console.error('Failed to load initial books', err);
        setErrorMsg('Failed to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialBooks();
  }, []);

  const renderActiveView = () => {
    return (
      <Suspense fallback={<LoadingView />}>
        {isReading && selectedBook ? (
          <ReaderView 
            book={selectedBook} 
            location={readingProgress[selectedBook.id]}
            onLocationChanged={updateProgress}
            onClose={() => { setIsReading(false); setSelectedBook(null); }}
          />
        ) : (
          <>
            {activeTab === 'search' && <SearchView onBookSelect={setSelectedBook} />}
            {activeTab === 'rankings' && <RankingsView onBookSelect={setSelectedBook} onReadBook={handleReadBook} />}
            {activeTab === 'catalog' && <CatalogView onBookSelect={setSelectedBook} />}
            {activeTab === 'web' && (
              <WebImportView 
                onBookSelect={setSelectedBook}
                onReadBook={handleReadBook}
                onAddToReadlist={toggleReadlist}
                isInReadlist={isInReadlist}
              />
            )}
            {activeTab === 'profile' && (
              user ? (
                <BookshelfView 
                  user={user} 
                  readlist={readlist} 
                  readingProgress={readingProgress}
                  onLogout={handleLogout}
                  onBookSelect={setSelectedBook}
                  onReadBook={handleReadBook}
                />
              ) : (
                <LoginView onLogin={setUser} />
              )
            )}
            {(activeTab === 'home' || activeTab === '') && (
              <HomeView 
                books={books} 
                recommendations={recommendations} 
                isLoading={isLoading} 
                errorMsg={errorMsg} 
                onBookSelect={setSelectedBook} 
                onReadBook={handleReadBook} 
              />
            )}
          </>
        )}
      </Suspense>
    );
  };

  return (
    <div className="app-layout">
      <Accessibility />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        <div className="view-container">
          {renderActiveView()}
        </div>
      </main>

      <BookModal 
        book={isReading ? null : selectedBook} 
        onClose={() => setSelectedBook(null)}
        onToggleReadlist={() => selectedBook && toggleReadlist(selectedBook)}
        isInReadlist={selectedBook ? isInReadlist(selectedBook.id) : false}
        onReadBook={() => selectedBook && handleReadBook(selectedBook)}
      />
    </div>
  );
}

export default App;