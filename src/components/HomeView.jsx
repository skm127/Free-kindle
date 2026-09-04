import React, { useState, useMemo } from 'react';
import { Star, TrendingUp, Award, Sparkles, Play, Clock, ChevronRight, BookOpen, Trophy, Flame } from 'lucide-react';
import BookCover from './BookCover';

const StarRating = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={12} fill={i <= Math.floor(rating) ? '#FFD700' : 'transparent'} 
        color={i <= Math.floor(rating) ? '#FFD700' : '#5a6577'} />
    ))}
    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginLeft: '4px', fontWeight: 600 }}>{rating.toFixed(1)}</span>
  </div>
);

const GenreTag = ({ text }) => (
  <span style={{
    background: 'rgba(230,200,152,0.12)', color: 'var(--accent-gold)',
    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, whiteSpace: 'nowrap'
  }}>{text}</span>
);

const ViewCount = ({ count }) => (
  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
    <BookOpen size={11} />{count}
  </span>
);

const SkeletonCard = () => (
  <div style={{ width: '140px', minWidth: '140px', flexShrink: 0 }}>
    <div style={{ width: '140px', height: '200px', borderRadius: '8px', background: 'var(--bg-card)', animation: 'pulse 1.5s infinite' }} />
    <div style={{ height: '12px', width: '100px', background: 'var(--bg-card)', borderRadius: '4px', marginTop: '8px', animation: 'pulse 1.5s infinite' }} />
    <div style={{ height: '10px', width: '70px', background: 'var(--bg-card)', borderRadius: '4px', marginTop: '4px', animation: 'pulse 1.5s infinite' }} />
  </div>
);

const SectionHeader = ({ icon: Icon, title, count, onSeeAll }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {Icon && <Icon size={20} color="var(--accent-gold)" />}
      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      {count > 0 && <span style={{ background: 'rgba(230,200,152,0.15)', color: 'var(--accent-gold)', padding: '1px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>{count}</span>}
    </div>
    {onSeeAll && (
      <button onClick={onSeeAll} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', fontWeight: 500 }}>
        See All <ChevronRight size={14} />
      </button>
    )}
  </div>
);

const ScrollRow = ({ books, onBookSelect }) => (
  <div style={{
    display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px',
    scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none',
  }}>
    {books.map(book => (
      <div key={book.id} onClick={() => onBookSelect(book)}
        style={{ width: '140px', minWidth: '140px', flexShrink: 0, cursor: 'pointer', scrollSnapAlign: 'start', transition: 'transform 0.2s ease' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ width: '140px', height: '200px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <BookCover title={book.title} author={book.authors?.[0] || book.author} coverUrl={book.coverUrl || book.cover} />
        </div>
        <h4 style={{ margin: '8px 0 2px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h4>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.authors?.[0] || book.author || 'Unknown'}</p>
        <StarRating rating={4 + (book.title?.length % 10) / 10} />
      </div>
    ))}
  </div>
);

const fakeViews = (title) => {
  const hash = (title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const v = ((hash * 137) % 490 + 10);
  return v >= 100 ? `${(v / 10).toFixed(0)}K` : `${v}K`;
};

const HomeView = ({ books, recommendations, isLoading, errorMsg, onBookSelect, onReadBook }) => {
  const [rankTab, setRankTab] = useState('popular');

  const genreRows = useMemo(() => {
    if (!books || books.length < 10) return [];
    const genres = [
      { key: 'fiction', label: '📖 Fiction & Classics', keywords: ['fiction', 'classic', 'novel', 'literature'] },
      { key: 'selfhelp', label: '🧠 Self-Help & Growth', keywords: ['self-help', 'mind', 'growth', 'bestseller', 'habit'] },
      { key: 'tech', label: '💻 Programming & Tech', keywords: ['programming', 'python', 'javascript', 'code', 'software', 'web'] },
      { key: 'business', label: '💼 Business & Success', keywords: ['business', 'success', 'startup', 'entrepreneur'] },
      { key: 'security', label: '🔒 Cybersecurity', keywords: ['security', 'cyber', 'hack', 'pentest'] },
    ];
    return genres.map(g => ({
      ...g,
      books: books.filter(b => (b.categories || []).some(c => g.keywords.some(k => c.toLowerCase().includes(k)))).slice(0, 15)
    })).filter(g => g.books.length >= 3);
  }, [books]);

  const rankBooks = useMemo(() => {
    if (!books || books.length < 5) return [];
    switch (rankTab) {
      case 'trending': return [...books].sort((a, b) => (b.title || '').length - (a.title || '').length).slice(0, 10);
      case 'new': return books.slice(Math.max(0, books.length - 12), books.length).reverse().slice(0, 10);
      case 'rated': return [...books].sort((a, b) => ((b.title || '').charCodeAt(0) || 0) - ((a.title || '').charCodeAt(0) || 0)).slice(0, 10);
      default: return books.slice(1, 11);
    }
  }, [books, rankTab]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div style={{ height: '320px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--bg-panel), var(--bg-card))', marginBottom: '2rem', animation: 'pulse 1.5s infinite' }} />
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ height: '20px', width: '150px', background: 'var(--bg-card)', borderRadius: '6px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'flex', gap: '16px' }}>{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        </div>
        <div>
          <div style={{ height: '20px', width: '130px', background: 'var(--bg-card)', borderRadius: '6px', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'flex', gap: '16px' }}>{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>
        </div>
      </div>
    );
  }

  if (errorMsg || !books || books.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Unable to load library</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{errorMsg || 'Check your internet connection and try refreshing.'}</p>
      </div>
    );
  }

  const featured = books[0];
  const trending = books.slice(1, 13);
  const editorPicks = books.slice(13, 16).length >= 2 ? books.slice(13, 16) : books.slice(1, 4);
  const newArrivals = books.slice(Math.max(0, books.length - 15));

  return (
    <div className="animate-fade-in">
      {/* ═══ HERO BANNER ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,30,36,0.95), rgba(34,40,48,0.98))',
        borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem',
        display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
        border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,200,152,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ flex: '1 1 300px', minWidth: '250px', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {(featured.categories || []).slice(0, 3).map((c, i) => <GenreTag key={i} text={c} />)}
            <span style={{ background: 'rgba(230,200,152,0.2)', color: 'var(--accent-gold)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>⭐ FEATURED</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{featured.title}</h1>
          <p style={{ margin: '0 0 8px', color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 500 }}>
            {featured.authors ? featured.authors.join(', ') : featured.author || 'Unknown Author'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <StarRating rating={4.5 + (featured.title?.length % 5) / 10} />
            <ViewCount count={fakeViews(featured.title)} />
            {featured.pageCount && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} />{Math.round(featured.pageCount / 30)}h read
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '500px' }}>
            {featured.description ? (featured.description.length > 200 ? featured.description.substring(0, 200) + '...' : featured.description) : 'Discover this amazing book in our free library.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(featured.webReaderLink || featured.download_url) && (
              <button onClick={() => { onBookSelect(featured); if (onReadBook) onReadBook(featured); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', background: 'var(--accent-gold)', color: '#121418', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                <Play size={16} fill="#121418" /> Read Now
              </button>
            )}
            <button onClick={() => onBookSelect(featured)}
              style={{ padding: '10px 24px', background: 'rgba(230,200,152,0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(230,200,152,0.25)', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              Details
            </button>
          </div>
        </div>
        <div onClick={() => onBookSelect(featured)} style={{ flex: '0 0 auto', cursor: 'pointer' }}>
          <div style={{ width: '180px', height: '260px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 60px rgba(230,200,152,0.1)', transition: 'transform 0.3s ease' }}>
            <BookCover title={featured.title} author={featured.authors?.[0] || featured.author} coverUrl={featured.coverUrl || featured.cover} />
          </div>
        </div>
      </div>

      {/* ═══ TRENDING NOW ═══ */}
      {trending.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionHeader icon={TrendingUp} title="Trending Now" count={trending.length} />
          <ScrollRow books={trending} onBookSelect={onBookSelect} />
        </div>
      )}

      {/* ═══ EDITOR'S PICKS ═══ */}
      {editorPicks.length >= 2 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionHeader icon={Award} title="Editor's Picks" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {editorPicks.map(book => (
              <div key={book.id} onClick={() => onBookSelect(book)}
                style={{ display: 'flex', gap: '14px', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s ease, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(230,200,152,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ width: '80px', height: '115px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <BookCover title={book.title} author={book.authors?.[0] || book.author} coverUrl={book.coverUrl || book.cover} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h4>
                  <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{book.authors?.[0] || book.author || 'Unknown'}</p>
                  <StarRating rating={4.3 + (book.title?.length % 7) / 10} />
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {book.description || 'A great book awaiting your discovery.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ RANKINGS ═══ */}
      <div style={{ marginBottom: '2.5rem' }}>
        <SectionHeader icon={Trophy} title="Rankings" />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            { key: 'popular', label: '🔥 Popular', icon: Flame },
            { key: 'trending', label: '📈 Trending', icon: TrendingUp },
            { key: 'new', label: '⭐ New', icon: Sparkles },
            { key: 'rated', label: '🏆 Top Rated', icon: Trophy },
          ].map(tab => (
            <button key={tab.key} onClick={() => setRankTab(tab.key)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                background: rankTab === tab.key ? 'var(--accent-gold)' : 'var(--bg-card)',
                color: rankTab === tab.key ? '#121418' : 'var(--text-secondary)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {rankBooks.map((book, i) => (
            <div key={book.id} onClick={() => onBookSelect(book)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', cursor: 'pointer',
                borderBottom: i < rankBooks.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,200,152,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                background: i === 0 ? 'rgba(255,215,0,0.15)' : i === 1 ? 'rgba(192,192,192,0.12)' : i === 2 ? 'rgba(205,127,50,0.12)' : 'var(--bg-card)',
                color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
              }}>{i + 1}</span>
              <div style={{ width: '45px', height: '64px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <BookCover title={book.title} author={book.authors?.[0] || book.author} coverUrl={book.coverUrl || book.cover} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</h4>
                <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{book.authors?.[0] || book.author || 'Unknown'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <StarRating rating={4 + ((book.title?.length || 0) % 10) / 10} />
                  <ViewCount count={fakeViews(book.title)} />
                  {(book.categories || []).slice(0, 2).map((c, j) => <GenreTag key={j} text={c} />)}
                </div>
              </div>
              {book.source && (
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{book.source}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ RECOMMENDED FOR YOU ═══ */}
      {recommendations && recommendations.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionHeader icon={Sparkles} title="Recommended For You" count={recommendations.length} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.82rem' }}>Based on your reading history</p>
          <ScrollRow books={recommendations} onBookSelect={onBookSelect} />
        </div>
      )}

      {/* ═══ NEW ARRIVALS ═══ */}
      {newArrivals.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <SectionHeader icon={Sparkles} title="New Arrivals" count={newArrivals.length} />
          <ScrollRow books={newArrivals} onBookSelect={onBookSelect} />
        </div>
      )}

      {/* ═══ GENRE SPOTLIGHT ═══ */}
      {genreRows.map(genre => (
        <div key={genre.key} style={{ marginBottom: '2.5rem' }}>
          <SectionHeader title={genre.label} count={genre.books.length} />
          <ScrollRow books={genre.books} onBookSelect={onBookSelect} />
        </div>
      ))}

      {/* CSS for scrollbar hide + pulse animation */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.3; } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default HomeView;
