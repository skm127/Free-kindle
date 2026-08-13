import React from 'react';

const BookCard = ({ book, onClick }) => {
  return (
    <div className="mini-book-card" style={{ width: '100%' }} onClick={() => onClick(book)}>
      <img 
        src={book.coverUrl} 
        alt={book.title} 
        className="mini-cover"
        loading="lazy"
        style={{ width: '100%', height: 'auto', aspectRatio: '2/3' }}
      />
      <h4 className="mini-title" title={book.title}>{book.title}</h4>
      <p className="mini-author" title={book.authors.join(', ')}>{book.authors[0]}</p>
    </div>
  );
};

export default BookCard;
