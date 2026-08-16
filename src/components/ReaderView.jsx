import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink, AlertCircle, Loader2, BookOpen } from 'lucide-react';

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [epubData, setEpubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLocationChanged = (loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  };

  const isGutenbergEpub = book.source === 'Project Gutenberg' && book.webReaderLink && book.webReaderLink.includes('.epub');
  const isGoogleDrive = book.source === 'Google Drive';
  const isInternetArchive = book.source === 'Internet Archive';
  const isDirectEpub = book.webReaderLink && book.webReaderLink.endsWith('.epub');

  // Load EPUB into ArrayBuffer for Google Drive or EPUB links
  useEffect(() => {
    let isMounted = true;
    if (isGoogleDrive && book.download_url) {
      setLoading(true);
      setErrorMsg(null);
      fetch(book.download_url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(buffer => {
          if (isMounted) {
            setEpubData(buffer);
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to load drive EPUB into memory:', err);
          if (isMounted) {
            // Fallback: will try iframe viewer
            setLoading(false);
          }
        });
    }

    return () => { isMounted = false; };
  }, [book, isGoogleDrive]);

  const downloadUrl = book.download_url || book.webReaderLink || book.previewLink;

  const triggerDownload = (e) => {
    e.preventDefault();
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${book.title || 'book'}.epub`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  let iframeUrl = null;
  if (isInternetArchive && book.webReaderLink) {
    iframeUrl = book.webReaderLink;
  } else if (book.source === 'Open Library' && book.webReaderLink) {
    iframeUrl = book.webReaderLink;
  } else if (book.source === 'Project Gutenberg' && !isGutenbergEpub && book.webReaderLink) {
    iframeUrl = book.webReaderLink;
  } else if (isGoogleDrive && !epubData && book.download_url) {
    const idMatch = book.download_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      iframeUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

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
            <button
              onClick={triggerDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '6px',
                background: 'var(--accent-gold)', color: 'var(--accent-button-text)',
                border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
              }}
            >
              <Download size={16} />
              Download
            </button>
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
        {loading ? (
          <div className="reader-error" style={{ gap: '1rem' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
            <h3>Opening "{book.title}"...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Preparing in-browser reading engine</p>
          </div>
        ) : (epubData || isGutenbergEpub || isDirectEpub) ? (
          <div style={{ position: 'relative', height: '100%', width: '100%', background: '#fff' }}>
            <ReactReader
              url={epubData || book.webReaderLink}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
              showToc={true}
              epubOptions={{
                flow: 'paginated',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        ) : iframeUrl ? (
          <iframe
            src={iframeUrl}
            title={book.title}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            style={{ border: 'none', background: '#fff', width: '100%', height: '100%' }}
          />
        ) : (
          <div className="reader-error">
            <BookOpen size={48} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>Ready to Read</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '450px', textAlign: 'center', lineHeight: 1.7 }}>
              You can download this book to read offline in your favorite reader, or open it in a new window.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {downloadUrl && (
                <button onClick={triggerDownload} className="btn-primary" style={{ cursor: 'pointer' }}>
                  <Download size={18} />
                  Download Book
                </button>
              )}
              {book.previewLink && (
                <a href={book.previewLink} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  <ExternalLink size={18} />
                  Open in New Tab
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
