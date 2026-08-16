import React, { useState, useEffect } from 'react';

const coverCache = {};
const GOOGLE_API_KEY = 'AIzaSyBIkyBzdVY-wgYlXbFQS03uhHUYxT-SCNQ';

const cleanBookTitle = (title) => {
  if (!title) return '';
  return title
    .replace(/\.(epub|pdf|azw3|mobi|cbz|cbr|txt)$/i, '')
    .replace(/_/g, ' ')
    .replace(/^(?:.*?\s+)?(?:Book|Vol(?:ume)?|Series|#)\s*[\d\.]+\s*(?:[:\-_–]\s*|\s+)/i, '')
    .replace(/^\d+\s*[\.\-_–]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const BookCover = ({ title, author, coverUrl, className, style, onClick, alt }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const cleanTitle = cleanBookTitle(title);
  const cacheKey = `cover_${cleanTitle.toLowerCase()}_${(author || '').toLowerCase().trim()}`;

  useEffect(() => {
    setHasError(false);

    // 1. If explicit coverUrl is valid and not a placeholder, use it directly
    if (coverUrl && !coverUrl.includes('placeholder.com') && !coverUrl.includes('No+Cover')) {
      setImgSrc(coverUrl);
      return;
    }

    if (!cleanTitle) {
      setHasError(true);
      return;
    }

    // 2. Check memory cache
    if (coverCache[cacheKey]) {
      setImgSrc(coverCache[cacheKey]);
      return;
    }

    // 3. Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && cached !== 'none') {
        coverCache[cacheKey] = cached;
        setImgSrc(cached);
        return;
      }
      if (cached === 'none') {
        setHasError(true);
        return;
      }
    } catch (_e) { /* ignore quota */ }

    // 4. Try Google Books API with API Key (highest quality match)
    let isMounted = true;
    const authorClean = author && author !== 'Unknown Author' ? author : '';
    const q = `intitle:${encodeURIComponent(cleanTitle)}${authorClean ? `+inauthor:${encodeURIComponent(authorClean)}` : ''}`;
    
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&key=${GOOGLE_API_KEY}&fields=items(volumeInfo/imageLinks)`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const img = data.items?.[0]?.volumeInfo?.imageLinks;
        const url = img?.thumbnail || img?.smallThumbnail;
        if (url) {
          const highRes = url.replace('&edge=curl', '').replace('zoom=1', 'zoom=2').replace('http://', 'https://');
          coverCache[cacheKey] = highRes;
          try { localStorage.setItem(cacheKey, highRes); } catch (_e) {}
          setImgSrc(highRes);
        } else {
          // 5. Fallback to Open Library Title cover
          const olUrl = `https://covers.openlibrary.org/b/title/${encodeURIComponent(cleanTitle)}-M.jpg`;
          setImgSrc(olUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          const olUrl = `https://covers.openlibrary.org/b/title/${encodeURIComponent(cleanTitle)}-M.jpg`;
          setImgSrc(olUrl);
        }
      });

    return () => { isMounted = false; };
  }, [title, author, coverUrl, cacheKey, cleanTitle]);

  const handleImageError = () => {
    // If current source failed and wasn't already Google Books, try Google Books
    if (imgSrc && !imgSrc.includes('google.com') && cleanTitle) {
      const authorClean = author && author !== 'Unknown Author' ? author : '';
      const q = `intitle:${encodeURIComponent(cleanTitle)}${authorClean ? `+inauthor:${encodeURIComponent(authorClean)}` : ''}`;
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&key=${GOOGLE_API_KEY}&fields=items(volumeInfo/imageLinks)`)
        .then(res => res.json())
        .then(data => {
          const img = data.items?.[0]?.volumeInfo?.imageLinks;
          const url = img?.thumbnail || img?.smallThumbnail;
          if (url) {
            const highRes = url.replace('zoom=1', 'zoom=2').replace('http://', 'https://');
            setImgSrc(highRes);
          } else {
            setHasError(true);
          }
        })
        .catch(() => setHasError(true));
    } else {
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    const palettes = [
      ['#1e293b', '#e2e8f0', '#d4af37'],
      ['#1e1b4b', '#e0e7ff', '#a5b4fc'],
      ['#14251f', '#d1fae5', '#6ee7b7'],
      ['#27171e', '#fce7f3', '#f472b6'],
      ['#241f17', '#fef3c7', '#fcd34d'],
      ['#182329', '#e0f2fe', '#7dd3fc'],
    ];
    const hash = (cleanTitle || 'Book').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const [bg, fg, accent] = palettes[hash % palettes.length];

    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          ...style,
          background: `linear-gradient(135deg, ${bg}, #090d16)`,
          border: `1px solid ${accent}33`,
          borderLeft: `4px solid ${accent}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1rem 0.75rem',
          textAlign: 'left',
          cursor: onClick ? 'pointer' : 'default',
          aspectRatio: '2/3',
          borderRadius: '6px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 6,
          right: 8,
          fontSize: '0.65rem',
          fontWeight: 700,
          color: accent,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          opacity: 0.8
        }}>
          Book
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <h4 style={{
            fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
            fontWeight: 700,
            color: fg,
            lineHeight: 1.3,
            margin: '0 0 0.4rem 0',
            maxHeight: '4.5em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}>
            {cleanTitle || 'Untitled Book'}
          </h4>
          {author && author !== 'Unknown Author' && (
            <p style={{
              fontSize: 'clamp(0.65rem, 0.9vw, 0.8rem)',
              color: accent,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {author}
            </p>
          )}
        </div>

        <div style={{
          fontSize: '0.65rem',
          color: '#64748b',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '0.4rem',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Free Edition</span>
          <span>📖</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || cleanTitle || 'Book cover'}
      className={className}
      style={style}
      onClick={onClick}
      loading="lazy"
      onError={handleImageError}
    />
  );
};

export default BookCover;
