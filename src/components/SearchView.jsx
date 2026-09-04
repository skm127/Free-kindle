import React, { useState, useEffect, useMemo } from 'react';
import { searchBooks } from '../services/api/index.js';
import BookCard from './BookCard';
import { Search, Filter, Sparkles, X } from 'lucide-react';

const POPULAR_TAGS = [
  'Atomic Habits',
  'Thinking Fast and Slow',
  'Deep Work',
  'Psychology of Money',
  'Python',
  'Cybersecurity',
  'Meditations',
  'Data Science'
];

const SOURCES = [
  { id: 'all', name: 'All Sources' },
  { id: 'drive', name: 'Google Drive' },
  { id: 'archive', name: 'Internet Archive' },
  { id: 'openlibrary', name: 'Open Library' },
  { id: 'gutenberg', name: 'Gutenberg' },
];

const GENRES = [
  { id: 'all', name: 'All Genres' },
  { id: 'fiction', name: 'Fiction' },
  { id: 'self_help', name: 'Self-Help' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'business', name: 'Business' },
  { id: 'programming', name: 'Programming' },
  { id: 'security', name: 'Security' },
  { id: 'data', name: 'Data Science' },
];

const SearchView = ({ onBookSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setError(null);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const books = await searchBooks(searchQuery);
      setResults(books);
      if (books.length === 0) {
        setError('No books found for this search. Try a broader keyword.');
      }
    } catch (_err) {
      setError('An error occurred during search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    let list = [...results];

    // Filter source
    if (selectedSource !== 'all') {
      list = list.filter(b => {
        const s = (b.source || '').toLowerCase();
        if (selectedSource === 'drive') return s.includes('drive');
        if (selectedSource === 'archive') return s.includes('archive');
        if (selectedSource === 'openlibrary') return s.includes('open library');
        if (selectedSource === 'gutenberg') return s.includes('gutenberg');
        return true;
      });
    }

    // Filter genre
    if (selectedGenre !== 'all') {
      list = list.filter(b => 
        (b.categories || []).some(c => c.toLowerCase().includes(selectedGenre.toLowerCase())) ||
        (b.title || '').toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'author') {
      list.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
    }

    return list;
  }, [results, selectedSource, selectedGenre, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: '0 0 6px' }}>Universal Book Search</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Search millions of titles across Google Drive, Internet Archive, Open Library, and Project Gutenberg.
        </p>
      </div>
      
      <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <input 
          type="text" 
          className="search-input-large" 
          placeholder="Search by title, author, series, or subject..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{
            paddingLeft: '3rem',
            paddingRight: query ? '3rem' : '1.5rem'
          }}
        />
        <Search 
          size={20} 
          color="var(--accent-gold)" 
          style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} 
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Suggested Quick Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} /> Popular:
        </span>
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setQuery(tag)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      {results.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: 'var(--bg-panel)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Filter size={15} color="var(--accent-gold)" /> Filter:
            </div>

            {/* Source Dropdown */}
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {SOURCES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {/* Genre Dropdown */}
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Content / States */}
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 1rem' }}>
          {error}
        </div>
      ) : (
        <>
          {filteredResults.length > 0 && (
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing {filteredResults.length} {filteredResults.length === 1 ? 'book' : 'books'} for "{query}"
            </div>
          )}
          <div className="book-grid">
            {filteredResults.map(book => (
              <BookCard key={book.id} book={book} onClick={onBookSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchView;
