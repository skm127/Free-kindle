import React, { useState, useEffect } from 'react';

const coverCache = {};

const BookCover = ({ title, author, className, style, onClick, alt }) => {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);
  const cacheKey = `cover_${(title || '').toLowerCase().trim()}`;

  useEffect(() => {
    if (!title) { setFailed(true); return; }

    // Check in-memory cache first
    if (coverCache[cacheKey]) {
      setSrc(coverCache[cacheKey]);
      return;
    }

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && cached !== 'none') {
        coverCache[cacheKey] = cached;
        setSrc(cached);
        return;
      }
      if (cached === 'none') {
        setFailed(true);
        return;
      }
    } catch (_e) { /* ignore */ }

    // Fetch from Google Books API
    const q = `intitle:${encodeURIComponent(title)}${author && author !== 'Unknown Author' ? `+inauthor:${encodeURIComponent(author)}` : ''}`;
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`)
      .then(res => res.json())
      .then(data => {
        const img = data.items?.[0]?.volumeInfo?.imageLinks;
        const url = img?.thumbnail || img?.smallThumbnail;
        if (url) {
          // Get higher res version
          const highRes = url.replace('zoom=1', 'zoom=2').replace('http://', 'https://');
          coverCache[cacheKey] = highRes;
          try { localStorage.setItem(cacheKey, highRes); } catch (_e) { /* quota */ }
          setSrc(highRes);
        } else {
          coverCache[cacheKey] = null;
          try { localStorage.setItem(cacheKey, 'none'); } catch (_e) { /* quota */ }
          setFailed(true);
        }
      })
      .catch(() => {
        setFailed(true);
      });
  }, [title, author, cacheKey]);

  if (failed || !src) {
    // Styled fallback cover with title and author
    const colors = [
      ['#1a365d', '#e2e8f0'], ['#742a2a', '#fed7d7'], ['#22543d', '#c6f6d5'],
      ['#44337a', '#e9d8fd'], ['#7b341e', '#feebc8'], ['#234e52', '#b2f5ea'],
      ['#3c366b', '#e9d8fd'], ['#702459', '#fed7e2'], ['#2a4365', '#bee3f8'],
    ];
    const hash = (title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const [bg, fg] = colors[hash % colors.length];

    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          ...style,
          background: `linear-gradient(145deg, ${bg}, ${bg}dd)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem 0.75rem',
          textAlign: 'center',
          cursor: onClick ? 'pointer' : 'default',
          aspectRatio: '2/3',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
          fontWeight: 700,
          color: fg,
          lineHeight: 1.3,
          marginBottom: '0.5rem',
          maxHeight: '60%',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}>
          {title || 'Untitled'}
        </div>
        {author && author !== 'Unknown Author' && (
          <div style={{
            fontSize: 'clamp(0.5rem, 0.9vw, 0.7rem)',
            color: `${fg}bb`,
            fontStyle: 'italic',
          }}>
            {author}
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || title}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
      onError={() => {
        setFailed(true);
      }}
    />
  );
};

export default BookCover;
