import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [iframeError, setIframeError] = useState(false);

  const handleLocationChanged = (loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  };

  // Detect epub formats
  const isEpub = book.webReaderLink && book.webReaderLink.includes('.epub');
  const isGutenbergEpub = book.source === 'Project Gutenberg' && isEpub;

  // Build viewer URL based on source
  let viewerUrl = null;
  if (book.source === 'Google Drive' && book.download_url) {
    // Use Google Docs Viewer for Drive files (handles PDF/DOCX)
    const encodedUrl = encodeURIComponent(book.download_url);
    viewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
  } else if (book.source === 'Open Library' && book.webReaderLink) {
    viewerUrl = book.webReaderLink;
  } else if (book.source === 'Project Gutenberg' && !isGutenbergEpub && book.webReaderLink) {
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
        <h2 className="reader-title">{book.title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
        </div>
      </div>
      
      <div className="reader-content">
        {(isEpub || isGutenbergEpub) && !iframeError ? (
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <ReactReader
              url={book.webReaderLink}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
            />
          </div>
        ) : viewerUrl && !iframeError ? (
          <iframe 
            src={viewerUrl}
            title={book.title}
            width="100%" 
            height="100%" 
            frameBorder="0"
            allowFullScreen
            style={{ border: 'none', background: '#fff' }}
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="reader-error">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📖</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Open this book externally</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>
              This book format requires an external viewer. Click below to download or read it in a new tab.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
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
