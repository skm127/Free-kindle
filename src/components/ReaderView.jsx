import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink, Loader2, RotateCcw, BookOpen } from 'lucide-react';

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [epubData, setEpubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleLocationChanged = (loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  };

  const rawUrl = book.webReaderLink || book.download_url || book.previewLink || '';
  const urlLower = rawUrl.toLowerCase();

  // Detect format
  const isEpub = urlLower.includes('.epub') || (book.source === 'Google Drive' && !urlLower.includes('.pdf'));
  const isPdf = urlLower.includes('.pdf');
  const isInternetArchive = book.source === 'Internet Archive' || rawUrl.includes('archive.org');

  // For EPUBs, fetch ArrayBuffer into memory for instant in-browser reading
  useEffect(() => {
    let isMounted = true;
    if (isEpub && rawUrl && !isInternetArchive) {
      setLoading(true);
      setLoadError(false);

      const fetchEpub = async () => {
        try {
          // 1. Try direct fetch
          let res = await fetch(rawUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          let buffer = await res.arrayBuffer();
          if (isMounted) {
            setEpubData(buffer);
            setLoading(false);
          }
        } catch (err) {
          console.warn('Direct EPUB fetch failed, trying CORS gateway...', err);
          try {
            // 2. Fallback to high-speed CORS proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;
            let res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
            let buffer = await res.arrayBuffer();
            if (isMounted) {
              setEpubData(buffer);
              setLoading(false);
            }
          } catch (proxyErr) {
            console.error('All EPUB fetches failed:', proxyErr);
            if (isMounted) {
              setLoading(false);
              setLoadError(true);
            }
          }
        }
      };

      fetchEpub();
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [rawUrl, isEpub, isInternetArchive]);

  // Determine iframe reader URL for PDFs and Web viewers
  let iframeViewerUrl = null;
  if (isInternetArchive) {
    const idMatch = rawUrl.match(/archive\.org\/(?:details|embed)\/([a-zA-Z0-9_\-\.]+)/i);
    const iaId = idMatch ? idMatch[1] : (book.id ? book.id.replace('ia_', '') : '');
    iframeViewerUrl = `https://archive.org/embed/${iaId}`;
  } else if (book.source === 'Google Drive') {
    const idMatch = rawUrl.match(/id=([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      iframeViewerUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  } else if (isPdf) {
    iframeViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
  } else if (rawUrl && !isEpub) {
    iframeViewerUrl = rawUrl;
  }

  const downloadUrl = book.download_url || rawUrl;

  const triggerDownload = (e) => {
    e.preventDefault();
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${book.title || 'book'}${isPdf ? '.pdf' : '.epub'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="reader-view">
      {/* Header */}
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
          {rawUrl && (
            <a
              href={rawUrl}
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

      {/* Reader Body */}
      <div className="reader-content">
        {loading ? (
          <div className="reader-error" style={{ gap: '1rem' }}>
            <Loader2 size={44} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Loading "{book.title}"...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Rendering in-browser reading engine</p>
          </div>
        ) : (epubData && !loadError) ? (
          <div style={{ position: 'relative', height: '100%', width: '100%', background: '#fff' }}>
            <ReactReader
              url={epubData}
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
        ) : iframeViewerUrl ? (
          <iframe
            src={iframeViewerUrl}
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
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {rawUrl && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`}
                title={book.title}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                style={{ border: 'none', background: '#fff' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;
