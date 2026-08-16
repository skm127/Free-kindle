import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink, AlertCircle, Maximize2 } from 'lucide-react';

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [loadError, setLoadError] = useState(false);

  const handleLocationChanged = (loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  };

  const isEpub = (book.webReaderLink && book.webReaderLink.includes('.epub')) ||
    (book.source === 'Project Gutenberg' && book.webReaderLink && book.webReaderLink.includes('.epub'));

  // Build the best viewer URL
  let viewerUrl = null;
  let viewerType = 'iframe'; // 'epub' | 'iframe' | 'none'

  if (isEpub) {
    viewerType = 'epub';
  } else if (book.source === 'Google Drive' && book.download_url) {
    const idMatch = book.download_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      viewerUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  } else if (book.webReaderLink) {
    viewerUrl = book.webReaderLink;
  }

  const downloadUrl = book.download_url || book.webReaderLink || book.previewLink;

  return (
    <div className="reader-view">
      <div className="reader-header">
        <button onClick={onClose} className="reader-back-btn">
          <ArrowLeft size={18} />
          <span>Back to Library</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '60%' }}>
          <h2 className="reader-title" style={{ maxWidth: '100%' }}>{book.title}</h2>
          {book.source && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
              Source: {book.source}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '6px',
                background: 'var(--accent-gold)', color: 'var(--accent-button-text)',
                textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              <Download size={16} />
              Download
            </a>
          )}
          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noreferrer"
              title="Open full page"
              style={{
                display: 'flex', alignItems: 'center',
                padding: '0.5rem', borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      <div className="reader-content">
        {viewerType === 'epub' && !loadError ? (
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <ReactReader
              url={book.webReaderLink}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
            />
          </div>
        ) : viewerUrl && !loadError ? (
          <iframe
            src={viewerUrl}
            title={book.title}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            style={{ border: 'none', background: '#fff', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="reader-error">
            <AlertCircle size={48} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>Open this book externally</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '450px', textAlign: 'center', lineHeight: 1.7 }}>
              This book can be downloaded and read in your favorite e-reader app (Kindle, Apple Books, etc.)
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {downloadUrl && (
                <a href={downloadUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                  <Download size={18} />
                  Download Book
                </a>
              )}
              {book.previewLink && (
                <a href={book.previewLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={18} />
                  Open Externally
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;
