import React from 'react';
import { X, BookOpen, ExternalLink, Calendar, Book, Heart } from 'lucide-react';

const BookModal = ({ book, onClose, onToggleReadlist, isInReadlist, onReadBook }) => {
  if (!book) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        <div>
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="modal-cover"
          />
        </div>
        
        <div className="modal-details">
          <h2 className="modal-title">{book.title}</h2>
          <p className="modal-author">by {book.authors.join(', ')}</p>
          
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
          
          <div className="modal-desc" dangerouslySetInnerHTML={{ __html: book.description }} />
          
          <div className="modal-actions">
            {book.webReaderLink || book.download_url ? (
              <button onClick={onReadBook} className="btn-primary">
                <BookOpen size={20} fill="currentColor" />
                READ NOW
              </button>
            ) : (
              <a href={book.previewLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ExternalLink size={20} />
                PREVIEW BOOK
              </a>
            )}
            <button 
              className={isInReadlist ? "btn-primary" : "btn-secondary"} 
              onClick={onToggleReadlist}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              <Heart size={20} fill={isInReadlist ? "currentColor" : "none"} />
              {isInReadlist ? "IN READLIST" : "ADD TO READLIST"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
