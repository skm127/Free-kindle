import React, { useState } from 'react';
import { getBooksByCategory } from '../services/api';
import { 
  Brain,
  Flame,
  Briefcase,
  Database, 
  ShieldAlert, 
  Code,
  BookOpen, 
  Rocket, 
  Sparkles,
  Heart, 
  Skull, 
  BookMarked, 
  Globe 
} from 'lucide-react';
import BookCard from './BookCard';

const CATEGORIES = [
  { id: 'self_help', name: 'Self-Help & Mind', icon: Brain, desc: 'Atomic Habits, Thinking Fast & Slow, Deep Work' },
  { id: 'philosophy', name: 'Philosophy & Wisdom', icon: Flame, desc: 'Meditations, 48 Laws of Power, Art of War' },
  { id: 'business', name: 'Business & Success', icon: Briefcase, desc: 'Entrepreneurship, Startups, Wealth' },
  { id: 'data_science', name: 'Data Science & AI', icon: Database, desc: 'Machine Learning, Deep Learning, Big Data' },
  { id: 'cybersecurity', name: 'Cybersecurity & Hacking', icon: ShieldAlert, desc: 'Pentesting, Cryptography, Reverse Engineering' },
  { id: 'programming', name: 'Programming & Software', icon: Code, desc: 'Python, JavaScript, Rust, Systems, Web' },
  { id: 'fiction', name: 'Fiction & Classics', icon: BookOpen, desc: 'Timeless Literature, Great Novels' },
  { id: 'science_fiction', name: 'Science Fiction', icon: Rocket, desc: 'Space, Cyberpunk, Dystopian' },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, desc: 'Magic, High Fantasy, Mythological' },
  { id: 'romance', name: 'Romance', icon: Heart, desc: 'Contemporary, Drama, Love Stories' },
  { id: 'thriller', name: 'Thriller & Mystery', icon: Skull, desc: 'Crime, Suspense, Psychological' },
  { id: 'history', name: 'History & Science', icon: Globe, desc: 'Ancient Civilizations, Physics, Biology' },
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>
              <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedCategory(null)}>
                Catalog
              </span> 
              <span style={{ margin: '0 0.5rem' }}>/</span> 
              <span className="text-gold">{selectedCategory.name}</span>
            </h2>
            {selectedCategory.desc && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {selectedCategory.desc}
              </p>
            )}
          </div>
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
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Explore Curated Collections</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore thousands of free books across bestsellers, self-improvement, tech, philosophy, and fiction.
        </p>
      </div>

      <div className="category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id} 
              className="category-card" 
              onClick={() => handleCategoryClick(cat)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left',
                padding: '1.75rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                background: 'rgba(230, 200, 152, 0.1)',
                padding: '0.75rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                color: 'var(--accent-gold)'
              }}>
                <Icon size={28} />
              </div>
              <h3 className="category-name" style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {cat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CatalogView;
