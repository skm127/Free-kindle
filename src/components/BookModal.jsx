import React from 'react';
import { X, BookOpen, ExternalLink, Calendar, Book, Heart, Download, Globe } from 'lucide-react';
import BookCover from './BookCover';

const BookModal = ({ book, onClose, onToggleReadlist, isInReadlist, onReadBook }) => {
  if (!book) return null;

  const downloadUrl = book.download_url || book.webReaderLink || book.previewLink;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        <div>
          <BookCover 
            title={book.title} 
            author={book.authors?.[0] || book.author} 
            coverUrl={book.coverUrl || book.cover}
            className="modal-cover"
          />
        </div>
        
        <div className="modal-details">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {book.source && (
              <span style={{ 
                background: 'rgba(230, 200, 152, 0.15)', 
                color: 'var(--accent-gold)', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Globe size={14} />
                {book.source}
              </span>
            )}
            {book.categories && book.categories.slice(0, 2).map((cat, i) => (
              <span key={i} style={{ 
                background: 'rgba(255, 255, 255, 0.06)', 
                color: 'var(--text-secondary)', 
                padding: '0.25rem 0.6rem', 
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                {cat}
              </span>
            ))}
          </div>

          <h2 className="modal-title">{book.title}</h2>
          <p className="modal-author">by {book.authors ? book.authors.join(', ') : book.author || 'Unknown'}</p>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            {book.publishedDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                <span>{book.publishedDate.substring(0, 4)}</span>
              </div>
            )}
            {book.pageCount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Book size={16} />
                <span>{book.pageCount} pages</span>
              </div>
            )}
          </div>
          
          <div className="modal-desc">{book.description}</div>
          
          <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            {book.webReaderLink || book.download_url ? (
              <button onClick={onReadBook} className="btn-primary">
                <BookOpen size={18} fill="currentColor" />
                READ NOW
              </button>
            ) : (
              <a href={book.previewLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                <ExternalLink size={18} />
                PREVIEW BOOK
              </a>
            )}

            {downloadUrl && (
              <a 
                href={downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={18} />
                DOWNLOAD
              </a>
            )}

            <button 
              className={isInReadlist ? "btn-primary" : "btn-secondary"} 
              onClick={onToggleReadlist}
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <Heart size={18} fill={isInReadlist ? "currentColor" : "none"} />
              {isInReadlist ? "IN READLIST" : "SAVE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
