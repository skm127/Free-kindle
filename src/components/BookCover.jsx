import React, { useState } from 'react';

const BookCover = ({ title, author, coverUrl, className, style, onClick, alt }) => {
  const [imgError, setImgError] = useState(false);

  const cleanTitle = (title || 'Untitled')
    .replace(/\.(epub|pdf|azw3|mobi|cbz|cbr|txt)$/i, '')
    .replace(/_/g, ' ')
    .replace(/^(?:.*?\s+)?(?:Book|Vol(?:ume)?|Series|#)\s*[\d\.]+\s*(?:[:\-_–]\s*|\s+)/i, '')
    .replace(/^\d+\s*[\.\-_–]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Premium palette based on title hash
  const palettes = [
    { bg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', border: '#38bdf8', text: '#f8fafc', sub: '#94a3b8', accent: '#38bdf8' },
    { bg: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)', border: '#a855f7', text: '#faf5ff', sub: '#d8b4fe', accent: '#c084fc' },
    { bg: 'linear-gradient(145deg, #14251f 0%, #064e3b 100%)', border: '#34d399', text: '#f0fdf4', sub: '#a7f3d0', accent: '#6ee7b7' },
    { bg: 'linear-gradient(145deg, #2a1b18 0%, #7c2d12 100%)', border: '#fb923c', text: '#fff7ed', sub: '#fed7aa', accent: '#fdba74' },
    { bg: 'linear-gradient(145deg, #241f17 0%, #451a03 100%)', border: '#fbbf24', text: '#fefce8', sub: '#fef08a', accent: '#fde047' },
    { bg: 'linear-gradient(145deg, #1f1d2b 0%, #374151 100%)', border: '#e6c898', text: '#ffffff', sub: '#e6c898', accent: '#e6c898' }
  ];

  const hash = (cleanTitle || 'Book').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const theme = palettes[hash % palettes.length];

  // If coverUrl is missing or failed, render the digital hardcover
  if (imgError || !coverUrl || coverUrl.includes('placeholder.com') || coverUrl.includes('No+Cover')) {
    return (
      <div
        className={className}
        onClick={onClick}
        style={{
          ...style,
          background: theme.bg,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderLeft: `4px solid ${theme.accent}`,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.1rem 0.85rem',
          aspectRatio: '2/3',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        {/* Book Header Tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: theme.accent,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Free Edition
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>📖</span>
        </div>

        {/* Center: Title & Author */}
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <h4 style={{
            fontSize: 'clamp(0.8rem, 1.25vw, 1rem)',
            fontWeight: 700,
            color: theme.text,
            lineHeight: 1.35,
            margin: '0 0 0.5rem 0',
            maxHeight: '4.8em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {cleanTitle}
          </h4>
          {author && author !== 'Unknown Author' && (
            <p style={{
              fontSize: 'clamp(0.68rem, 0.9vw, 0.82rem)',
              color: theme.sub,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: 'italic'
            }}>
              {author}
            </p>
          )}
        </div>

        {/* Bottom Footer Border */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '0.4rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Free Kindle</span>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.accent }} />
        </div>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={alt || cleanTitle || 'Book cover'}
      className={className}
      style={{
        ...style,
        objectFit: 'cover',
        aspectRatio: '2/3',
        borderRadius: '6px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
      }}
      onClick={onClick}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
};

export default BookCover;
