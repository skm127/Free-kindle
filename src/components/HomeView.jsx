import React from 'react';
import { Play, Heart, Star, Clock } from 'lucide-react';

const HomeView = ({ books, recommendations, isLoading, errorMsg, onBookSelect, onReadBook }) => {
  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (errorMsg || !books || books.length === 0) {
    return (
      <div className="loader-container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{errorMsg || 'No books found. Check your internet connection.'}</p>
      </div>
    );
  }

  // Use the first book as the featured hero
  const featuredBook = books[0];
  const popularBooks = books.slice(1);

  return (
    <div className="animate-fade-in">
      <div className="hero-section">
        <div className="hero-info">
          <h1 className="hero-title">{featuredBook.title}</h1>
          
          <div className="hero-meta">
            <span>By <strong className="text-gold">{featuredBook.authors ? featuredBook.authors.join(', ') : featuredBook.author || 'Unknown'}</strong></span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={16} className="text-gold" />
              <span>4.5</span>
            </div>
            
            {featuredBook.pageCount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={16} />
                <span>{Math.round(featuredBook.pageCount / 30)} hrs read</span>
              </div>
            )}
          </div>
          
          <p className="hero-desc" dangerouslySetInnerHTML={{ 
            __html: featuredBook.description?.substring(0, 250) + (featuredBook.description?.length > 250 ? '...' : '') || 'No description available.'
          }} />
          
          <div className="hero-actions">
            <button 
              className="btn-primary"
              onClick={() => {
                onBookSelect(featuredBook);
                onReadBook && onReadBook(featuredBook);
              }}
            >
              <Play size={18} fill="currentColor" />
              <span>READ NOW</span>
            </button>
            
            <button className="btn-secondary" onClick={() => onBookSelect(featuredBook)}>
              <Heart size={18} />
              <span>MORE INFO</span>
            </button>
          </div>
        </div>
        
        <div className="hero-cover-container" onClick={() => onBookSelect(featuredBook)}>
          <img src={featuredBook.coverUrl} alt={featuredBook.title} className="hero-cover" />
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 className="section-title">✨ Recommended for You</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Based on your reading habits</p>
          <div className="book-scroll-container">
            {recommendations.map(book => (
              <div key={book.id} className="mini-book-card" onClick={() => onBookSelect(book)}>
                <img src={book.coverUrl || book.cover} alt={book.title} className="mini-cover" loading="lazy" />
                <h4 className="mini-title" title={book.title}>{book.title}</h4>
                <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author}>{book.authors ? book.authors[0] : book.author}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <h3 className="section-title">More Similar Books</h3>
        <div className="book-scroll-container">
          {popularBooks.map(book => (
            <div key={book.id} className="mini-book-card" onClick={() => onBookSelect(book)}>
              <img src={book.coverUrl || book.cover} alt={book.title} className="mini-cover" loading="lazy" />
              <h4 className="mini-title" title={book.title}>{book.title}</h4>
              <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author}>{book.authors ? book.authors[0] : book.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
