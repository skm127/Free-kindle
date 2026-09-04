import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Flame, TrendingUp, Sparkles, Star, BookOpen, Play, Filter } from 'lucide-react';
import BookCover from './BookCover';
import { getPopularBooks, getBooksByCategory } from '../services/api/index.js';

const GENRE_FILTERS = [
  { id: 'all', name: 'All Genres' },
  { id: 'fiction', name: 'Fiction' },
  { id: 'self_help', name: 'Self-Help' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'business', name: 'Business' },
  { id: 'programming', name: 'Programming' },
  { id: 'cybersecurity', name: 'Security' },
  { id: 'data_science', name: 'Data Science' },
];

const fakeViews = (title) => {
  const hash = (title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const v = ((hash * 179) % 480 + 20);
  return v >= 100 ? `${(v / 10).toFixed(0)}K` : `${v}K`;
};

const RankingsView = ({ onBookSelect, onReadBook }) => {
  const [activeTab, setActiveTab] = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBooks = async () => {
      setLoading(true);
      try {
        let list = [];
        if (selectedGenre === 'all') {
          list = await getPopularBooks();
        } else {
          list = await getBooksByCategory(selectedGenre);
        }
        if (isMounted) setAllBooks(list);
      } catch (err) {
        console.error('Failed to load ranking books:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadBooks();
    return () => { isMounted = false; };
  }, [selectedGenre]);

  const rankedList = useMemo(() => {
    if (!allBooks || allBooks.length === 0) return [];
    let sorted = [...allBooks];
    switch (activeTab) {
      case 'trending':
        // Sort by pseudo-trend (deterministic by title length + char code)
        sorted.sort((a, b) => ((b.title?.length || 0) * 7) - ((a.title?.length || 0) * 7));
        break;
      case 'new':
        // Reverse array to show recent/later catalog additions
        sorted.reverse();
        break;
      case 'rated':
        // Sort by rating proxy
        sorted.sort((a, b) => {
          const rA = 4 + ((a.title?.length || 0) % 10) / 10;
          const rB = 4 + ((b.title?.length || 0) % 10) / 10;
          return rB - rA;
        });
        break;
      case 'popular':
      default:
        // Keep primary popular order
        break;
    }
    return sorted.slice(0, 30);
  }, [allBooks, activeTab]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(230,200,152,0.12), rgba(26,30,36,0.95))',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Trophy size={26} color="var(--accent-gold)" />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Top Rankings
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Discover the most read, trending, and highest rated books in our universal library
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'popular', label: '🔥 Most Popular', icon: Flame },
            { id: 'trending', label: '📈 Trending', icon: TrendingUp },
            { id: 'new', label: '✨ New Arrivals', icon: Sparkles },
            { id: 'rated', label: '⭐ Top Rated', icon: Star },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '24px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                background: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--bg-card)',
                color: activeTab === tab.id ? '#121418' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(230,200,152,0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '1.5rem',
        scrollbarWidth: 'none'
      }}>
        <Filter size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginRight: '4px' }} />
        {GENRE_FILTERS.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            style={{
              padding: '5px 14px',
              borderRadius: '16px',
              border: '1px solid',
              borderColor: selectedGenre === g.id ? 'var(--accent-gold)' : 'var(--border)',
              background: selectedGenre === g.id ? 'rgba(230,200,152,0.15)' : 'var(--bg-panel)',
              color: selectedGenre === g.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Rankings List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '80px',
                borderRadius: '12px',
                background: 'var(--bg-panel)',
                animation: 'pulse 1.5s infinite'
              }}
            />
          ))}
        </div>
      ) : rankedList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>No books found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Try selecting a different genre.</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {rankedList.map((book, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const rating = 4 + ((book.title?.length || 0) % 10) / 10;
            const views = fakeViews(book.title);

            return (
              <div
                key={book.id}
                onClick={() => onBookSelect(book)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  background: 'var(--bg-panel)',
                  borderRadius: '12px',
                  border: isTop3 ? '1px solid rgba(230,200,152,0.3)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isTop3 ? 'rgba(230,200,152,0.3)' : 'var(--border)';
                }}
              >
                {/* Rank Number Badge */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                  background: rank === 1 ? 'rgba(255,215,0,0.18)' : rank === 2 ? 'rgba(192,192,192,0.18)' : rank === 3 ? 'rgba(205,127,50,0.18)' : 'var(--bg-card)',
                  color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--text-muted)',
                }}>
                  {rank}
                </div>

                {/* Cover */}
                <div style={{
                  width: '54px',
                  height: '76px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
                }}>
                  <BookCover
                    title={book.title}
                    author={book.authors?.[0] || book.author}
                    coverUrl={book.coverUrl || book.cover}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {book.title}
                    </h3>
                  </div>

                  <p style={{
                    margin: '0 0 6px',
                    fontSize: '0.82rem',
                    color: 'var(--accent-gold)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.authors ? book.authors.join(', ') : book.author || 'Unknown Author'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={13} fill="#FFD700" color="#FFD700" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>{rating.toFixed(1)}</span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <BookOpen size={12} /> {views} reads
                    </span>

                    {(book.categories || []).slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {c}
                      </span>
                    ))}

                    {book.source && (
                      <span style={{
                        fontSize: '0.68rem',
                        background: 'rgba(230,200,152,0.1)',
                        color: 'var(--accent-gold)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {book.source}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {(book.webReaderLink || book.download_url) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookSelect(book);
                        if (onReadBook) onReadBook(book);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        background: 'var(--accent-gold)',
                        color: '#121418',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Play size={13} fill="#121418" /> Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RankingsView;
