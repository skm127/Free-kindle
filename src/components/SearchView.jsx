import React, { useState } from 'react';
import { searchBooks } from '../services/api';
import BookCard from './BookCard';

const SearchView = ({ onBookSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const books = await searchBooks(query);
      setResults(books);
      if (books.length === 0) {
        setError('No books found for this search.');
      }
    } catch (_err) {
      setError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Search Library</h2>
      
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          className="search-input-large" 
          placeholder="Title, author, or keyword..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{error}</div>
      ) : (
        <div className="book-grid">
          {results.map(book => (
            <BookCard key={book.id} book={book} onClick={onBookSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
