import React from 'react';
import { LogOut, BookHeart } from 'lucide-react';
import BookCard from './BookCard';

const ProfileView = ({ user, readlist, onLogout, onBookSelect }) => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-gold)', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Hello, {user?.name || 'Reader'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            <BookHeart size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            You have {readlist.length} book{readlist.length !== 1 ? 's' : ''} in your Readlist
          </p>
        </div>
        
        <button 
          onClick={onLogout}
          className="btn-secondary" 
          style={{ padding: '0.75rem 1.5rem', border: '1px solid #444' }}
        >
          <LogOut size={18} />
          <span>SIGN OUT</span>
        </button>
      </div>

      <div>
        <h3 className="section-title">Your Readlist</h3>
        
        {readlist.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px dashed #444' }}>
            <BookHeart size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Your list is empty</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Discover new books and click "Add to Wish List" to save them here.</p>
          </div>
        ) : (
          <div className="book-grid">
            {readlist.map(book => (
              <BookCard key={book.id} book={book} onClick={onBookSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
