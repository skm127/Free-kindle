import React from 'react';
import BookCover from './BookCover';

const BookCard = ({ book, onClick }) => {
  return (
    <div className="mini-book-card" style={{ width: '100%' }} onClick={() => onClick(book)}>
      <BookCover 
        title={book.title} 
        author={book.authors ? book.authors[0] : book.author} 
        coverUrl={book.coverUrl || book.cover}
        className="mini-cover"
        style={{ width: '100%', height: 'auto', aspectRatio: '2/3', borderRadius: '4px', marginBottom: '0.75rem' }}
      />
      <h4 className="mini-title" title={book.title}>{book.title}</h4>
      <p className="mini-author" title={book.authors ? book.authors.join(', ') : book.author}>
        {book.authors ? book.authors[0] : book.author}
      </p>
    </div>
  );
};

export default BookCard;
