import React, { useState } from 'react';
import { getBooksByCategory } from '../services/api';
import { BookOpen, Rocket, Heart, Skull, BookMarked, Globe, Sparkles } from 'lucide-react';
import BookCard from './BookCard';

const CATEGORIES = [
  { id: 'fiction', name: 'Fiction', icon: BookOpen },
  { id: 'science_fiction', name: 'Science Fiction', icon: Rocket },
  { id: 'romance', name: 'Romance', icon: Heart },
  { id: 'thriller', name: 'Thriller', icon: Skull },
  { id: 'history', name: 'History', icon: BookMarked },
  { id: 'science', name: 'Science', icon: Globe },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles },
];

const CatalogView = ({ onBookSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const books = await getBooksByCategory(category.id);
      setCategoryBooks(books);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCategory) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedCategory(null)}>
              Catalog
            </span> 
            <span style={{ margin: '0 0.5rem' }}>/</span> 
            <span className="text-gold">{selectedCategory.name}</span>
          </h2>
          <button className="btn-secondary" onClick={() => setSelectedCategory(null)} style={{ padding: '0.5rem 1rem' }}>
            Back to Categories
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : categoryBooks.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No books found in this category.</p>
          </div>
        ) : (
          <div className="book-grid">
            {categoryBooks.map(book => (
              <BookCard key={book.id} book={book} onClick={onBookSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="section-title">Browse by Category</h2>
      <div className="category-grid">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="category-card" onClick={() => handleCategoryClick(cat)}>
              <Icon size={48} className="category-icon" />
              <h3 className="category-name">{cat.name}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogView;
