import React from 'react';
import { BookOpen, LogOut, Library, Clock, Bookmark, Play } from 'lucide-react';

const BookshelfView = ({ user, readlist, readingProgress, onLogout, onBookSelect, onReadBook }) => {
  if (!user) return null;

  const currentlyReading = readlist.filter(book => Object.prototype.hasOwnProperty.call(readingProgress, book.id));
  const savedForLater = readlist.filter(book => !Object.prototype.hasOwnProperty.call(readingProgress, book.id));
  const completedBooks = currentlyReading.filter(book => readingProgress[book.id] >= 100);

  const userName = user.name || user.username || user.email?.split('@')[0] || 'Reader';

  return (
    <div className="bookshelf-view animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Profile Header Section */}
      <div className="bookshelf-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#1e293b', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <div className="profile-info" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div className="profile-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#d4af37', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-details">
            <h2 className="bookshelf-user-title" style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#fff' }}>{userName}'s Dashboard</h2>
            <p className="profile-email" style={{ margin: '0 0 1rem 0', color: '#94a3b8' }}>{user.email}</p>
            
            <div style={{ display: 'flex', gap: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Library size={16} className="text-gold" />
                <span><strong>{readlist.length}</strong> Total in Readlist</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} className="text-gold" />
                <span><strong>{currentlyReading.length}</strong> Currently Reading</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={16} className="text-gold" />
                <span><strong>{completedBooks.length}</strong> Books Completed</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="btn-secondary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Currently Reading Section */}
          <div className="bookshelf-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Play size={24} className="text-gold" />
              <h3 className="section-title" style={{ margin: 0 }}>Currently Reading</h3>
            </div>
            
            {currentlyReading.length === 0 ? (
              <div className="empty-state-box" style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>You haven't started reading any books yet.</p>
              </div>
            ) : (
              <div className="book-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {currentlyReading.map(book => {
                  const progress = readingProgress[book.id] || 0;
                  return (
                    <div key={book.id} className="bookshelf-card" onClick={() => onBookSelect(book)} style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <img 
                        src={book.coverUrl || book.cover} 
                        alt={book.title} 
                        className="mini-cover"
                        style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300/1e293b/d4af37?text=No+Cover'; }}
                      />
                      <h4 className="mini-title" title={book.title} style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                      <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author} style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>{book.authors ? book.authors[0] : book.author}</p>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#cbd5e1' }}>
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: '#d4af37', transition: 'width 0.3s' }}></div>
                        </div>
                        
                        <button 
                          className="btn-primary" 
                          onClick={(e) => { e.stopPropagation(); onReadBook(book); }}
                          style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <BookOpen size={16} />
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Readlist Section */}
          <div className="bookshelf-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Bookmark size={24} className="text-gold" />
              <h3 className="section-title" style={{ margin: 0 }}>My Readlist</h3>
            </div>
            
            {savedForLater.length === 0 ? (
              <div className="empty-state-box" style={{ background: '#1e293b', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No saved books in your shelf.</p>
              </div>
            ) : (
              <div className="book-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
                {savedForLater.map(book => (
                  <div key={book.id} className="bookshelf-card" onClick={() => onBookSelect(book)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                    <img 
                      src={book.coverUrl || book.cover} 
                      alt={book.title} 
                      className="mini-cover"
                      style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x300/1e293b/d4af37?text=No+Cover'; }}
                    />
                    <h4 className="mini-title" title={book.title} style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                    <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author} style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.authors ? book.authors[0] : book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reading Stats Sidebar */}
        <div className="stats-sidebar">
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', position: 'sticky', top: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#fff', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>Reading Stats</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Member Since</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>2023</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Total Books</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{readlist.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8' }}>Completion Rate</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>
                  {currentlyReading.length > 0 ? Math.round((completedBooks.length / currentlyReading.length) * 100) : 0}%
                </span>
              </div>
              
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#d4af37', fontSize: '0.9rem' }}>Reader Level</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: '8px', background: '#334155', borderRadius: '4px' }}>
                    <div style={{ width: '45%', height: '100%', background: '#d4af37', borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Lvl 4</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookshelfView;

