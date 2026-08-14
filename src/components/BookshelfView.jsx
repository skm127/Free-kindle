import React from 'react';

const BookshelfView = ({ user, readlist, readingProgress, onLogout, onBookSelect, onReadBook }) => {
  if (!user) return null;

  // Split readlist into 'Currently Reading' and 'Saved for Later'
  const currentlyReading = readlist.filter(book => readingProgress[book.id]);
  const savedForLater = readlist.filter(book => !readingProgress[book.id]);

  return (
    <div className="bookshelf-view">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-details">
            <h2>{user.username}'s Bookshelf</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
        <button className="gr-button gr-button--light" onClick={onLogout}>Sign Out</button>
      </div>

      <div className="bookshelf-section">
        <h3>Currently Reading</h3>
        {currentlyReading.length === 0 ? (
          <p className="empty-state">You haven't started reading any books yet.</p>
        ) : (
          <div className="books-grid">
            {currentlyReading.map(book => (
              <div key={book.id} className="book-card" onClick={() => onBookSelect(book)}>
                <div className="book-cover-container">
                  <img src={book.coverUrl || book.cover} alt={book.title} className="book-cover" />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.authors ? book.authors.join(', ') : book.author}</p>
                  <button 
                    className="gr-button" 
                    onClick={(e) => { e.stopPropagation(); onReadBook(book); }}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Continue Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bookshelf-section" style={{ marginTop: '40px' }}>
        <h3>Saved for Later</h3>
        {savedForLater.length === 0 ? (
          <p className="empty-state">No unread books in your shelf.</p>
        ) : (
          <div className="books-grid">
            {savedForLater.map(book => (
              <div key={book.id} className="book-card" onClick={() => onBookSelect(book)}>
                <div className="book-cover-container">
                  <img src={book.coverUrl || book.cover} alt={book.title} className="book-cover" />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.authors ? book.authors.join(', ') : book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookshelfView;
