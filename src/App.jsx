import React, { useState, useEffect } from 'react';
import { getPopularBooks, getRecommendations } from './services/api';
import { subscribeToAuthChanges, logoutUser } from './services/firebase';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import SearchView from './components/SearchView';
import BookModal from './components/BookModal';
import LoginView from './components/LoginView';
import BookshelfView from './components/BookshelfView';
import ReaderView from './components/ReaderView';
import WebImportView from './components/WebImportView';
import './index.css';

const safeParse = (key, fallback) => {
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
  const [activeTab, setActiveTab] = useState('home');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Auth and Readlist state
  const [user, setUser] = useState(() => safeParse('free-kindle-user', null));
  const [readlist, setReadlist] = useState(() => safeParse('free-kindle-readlist', []));
  const [readingProgress, setReadingProgress] = useState(() => safeParse('free-kindle-progress', {}));

  const [recommendations, setRecommendations] = useState([]);
  const [isReading, setIsReading] = useState(false);

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
  const toggleReadlist = (book) => {
    setReadlist(prev => {
      if (prev.some(b => b.id === book.id)) {
        return prev.filter(b => b.id !== book.id); // Remove
      } else {
        return [...prev, book]; // Add
      }
    });
  };

  const isInReadlist = (bookId) => {
    return readlist.some(b => b.id === bookId);
  };

  const updateProgress = (bookId, location) => {
    setReadingProgress(prev => ({
      ...prev,
      [bookId]: location
    }));
  };

  const handleReadBook = (book) => {
    setSelectedBook(book);
    setIsReading(true);
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
    if (isReading && selectedBook) {
      return (
        <ReaderView 
          book={selectedBook} 
          location={readingProgress[selectedBook.id]}
          onLocationChanged={updateProgress}
          onClose={() => { setIsReading(false); setSelectedBook(null); }}
        />
      );
    }

    switch (activeTab) {
      case 'search':
        return <SearchView onBookSelect={setSelectedBook} />;
      case 'catalog':
        return <CatalogView onBookSelect={setSelectedBook} />;
      case 'web':
        return (
          <WebImportView 
            onBookSelect={setSelectedBook}
            onReadBook={handleReadBook}
            onAddToReadlist={toggleReadlist}
            isInReadlist={isInReadlist}
          />
        );
      case 'profile':
        return user ? (
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
        );
      case 'home':
      default:
        return (
          <HomeView 
            books={books} 
            recommendations={recommendations} 
            isLoading={isLoading} 
            errorMsg={errorMsg} 
            onBookSelect={setSelectedBook} 
            onReadBook={handleReadBook} 
          />
        );
    }
  };

  return (
    <div className="app-layout">
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
