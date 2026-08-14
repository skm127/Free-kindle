import React from 'react';

const BookshelfView = ({ user, readlist, readingProgress, onLogout, onBookSelect, onReadBook }) => {
  if (!user) return null;

  // Split readlist into 'Currently Reading' and 'Saved for Later'
  const currentlyReading = readlist.filter(book => Object.prototype.hasOwnProperty.call(readingProgress, book.id));
  const savedForLater = readlist.filter(book => !Object.prototype.hasOwnProperty.call(readingProgress, book.id));

  const userName = user.name || user.username || user.email?.split('@')[0] || 'Reader';

  return (
    <div className="bookshelf-view animate-fade-in">
      <div className="bookshelf-header">
        <div className="profile-info">
          <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="profile-details">
            <h2 className="bookshelf-user-title">{userName}'s Bookshelf</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={onLogout}>Sign Out</button>
      </div>

      <div className="bookshelf-section">
        <h3 className="section-title">Currently Reading</h3>
        {currentlyReading.length === 0 ? (
          <div className="empty-state-box">
            <p style={{ color: 'var(--text-secondary)' }}>You haven't started reading any books yet.</p>
          </div>
        ) : (
          <div className="book-grid">
            {currentlyReading.map(book => (
              <div key={book.id} className="bookshelf-card" onClick={() => onBookSelect(book)}>
                <img 
                  src={book.coverUrl || book.cover} 
                  alt={book.title} 
                  className="mini-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300/1e293b/d4af37?text=No+Cover'; }}
                />
                <h4 className="mini-title" title={book.title}>{book.title}</h4>
                <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author}>{book.authors ? book.authors[0] : book.author}</p>
                <button 
                  className="btn-primary" 
                  onClick={(e) => { e.stopPropagation(); onReadBook(book); }}
                  style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Continue Reading
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bookshelf-section" style={{ marginTop: '3rem' }}>
        <h3 className="section-title">Saved for Later</h3>
        {savedForLater.length === 0 ? (
          <div className="empty-state-box">
            <p style={{ color: 'var(--text-secondary)' }}>No saved books in your shelf.</p>
          </div>
        ) : (
          <div className="book-grid">
            {savedForLater.map(book => (
              <div key={book.id} className="bookshelf-card" onClick={() => onBookSelect(book)}>
                <img 
                  src={book.coverUrl || book.cover} 
                  alt={book.title} 
                  className="mini-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300/1e293b/d4af37?text=No+Cover'; }}
                />
                <h4 className="mini-title" title={book.title}>{book.title}</h4>
                <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author}>{book.authors ? book.authors[0] : book.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookshelfView;
