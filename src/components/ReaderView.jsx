import React, { useState, useEffect, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink, Loader2, Settings, X, Sun, Moon, BookOpen, Maximize, Minimize } from 'lucide-react';
import BookCover from './BookCover';

const DEFAULT_SETTINGS = { fontSize: 100, theme: 'dark', lineHeight: 1.6 };

const THEMES = {
  dark: { bg: '#121418', text: '#d4d4d4', name: 'Dark', icon: Moon },
  light: { bg: '#f5f5dc', text: '#333333', name: 'Light', icon: Sun },
  sepia: { bg: '#f4ecd8', text: '#5b4636', name: 'Sepia', icon: BookOpen },
};

const loadSettings = () => {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem('free-kindle-reader-settings')) }; }
  catch { return DEFAULT_SETTINGS; }
};

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [epubData, setEpubData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [progress, setProgress] = useState(0);
  const [rendition, setRendition] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateSettings = (patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('free-kindle-reader-settings', JSON.stringify(next));
      return next;
    });
  };

  // Apply EPUB styles when settings or rendition change
  useEffect(() => {
    if (rendition) {
      rendition.themes.override('font-size', `${settings.fontSize}%`);
      rendition.themes.override('line-height', `${settings.lineHeight}`);
      rendition.themes.override('color', THEMES[settings.theme].text);
      rendition.themes.override('background', THEMES[settings.theme].bg);
    }
  }, [rendition, settings]);

  const handleLocationChanged = useCallback((loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  }, [book.id, onLocationChanged]);

  const getRendition = useCallback((rend) => {
    setRendition(rend);
    rend.themes.override('font-size', `${settings.fontSize}%`);
    rend.themes.override('line-height', `${settings.lineHeight}`);
    rend.themes.override('color', THEMES[settings.theme].text);
    rend.themes.override('background', THEMES[settings.theme].bg);

    rend.on('relocated', (loc) => {
      if (loc && loc.start) {
        const pct = loc.start.percentage;
        if (typeof pct === 'number') setProgress(Math.round(pct * 100));
      }
    });
  }, [settings]);

  const rawUrl = book.webReaderLink || book.download_url || book.previewLink || '';
  const urlLower = rawUrl.toLowerCase();
  const isEpub = urlLower.includes('.epub') || (book.source === 'Google Drive' && !urlLower.includes('.pdf'));
  const isPdf = urlLower.includes('.pdf');
  const isInternetArchive = book.source === 'Internet Archive' || rawUrl.includes('archive.org');

  // Fetch EPUB
  useEffect(() => {
    let isMounted = true;
    if (isEpub && rawUrl && !isInternetArchive) {
      setLoading(true);
      setLoadError(false);

      const fetchEpub = async () => {
        try {
          let res = await fetch(rawUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          let buffer = await res.arrayBuffer();
          if (isMounted) { setEpubData(buffer); setLoading(false); }
        } catch (err) {
          console.warn('Direct fetch failed, trying proxy...', err);
          try {
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
            let res = await fetch(proxyUrl);
            if (!res.ok) {
              // Fallback to allorigins
              res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`);
              if (!res.ok) throw new Error(`All proxies failed`);
            }
            let buffer = await res.arrayBuffer();
            if (isMounted) { setEpubData(buffer); setLoading(false); }
          } catch (proxyErr) {
            console.error('All EPUB fetches failed:', proxyErr);
            if (isMounted) { setLoading(false); setLoadError(true); }
          }
        }
      };
      fetchEpub();
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [rawUrl, isEpub, isInternetArchive]);

  let iframeViewerUrl = null;
  if (isInternetArchive) {
    const idMatch = rawUrl.match(/archive\.org\/(?:details|embed)\/([a-zA-Z0-9_\-\.]+)/i);
    const iaId = idMatch ? idMatch[1] : (book.id ? book.id.replace('ia_', '') : '');
    iframeViewerUrl = `https://archive.org/embed/${iaId}`;
  } else if (book.source === 'Google Drive') {
    const idMatch = rawUrl.match(/id=([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch) iframeViewerUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
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
    a.href = downloadUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.download = `${book.title || 'book'}${isPdf ? '.pdf' : '.epub'}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const themeColors = THEMES[settings.theme];

  return (
    <div className="reader-view" style={{ background: themeColors.bg }}>
      {/* Progress Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 100 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gold)', transition: 'width 0.3s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Header */}
      <div className="reader-header" style={{ background: 'rgba(18,20,24,0.95)', backdropFilter: 'blur(10px)' }}>
        <button onClick={onClose} className="reader-back-btn">
          <ArrowLeft size={18} />
          <span>Library</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '50%' }}>
          <h2 className="reader-title" style={{ maxWidth: '100%', fontSize: '0.9rem' }}>
            {book.title?.length > 40 ? book.title.substring(0, 40) + '...' : book.title}
          </h2>
          {progress > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>{progress}% complete</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button onClick={toggleFullscreen} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{ display: 'flex', padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} title="Reader Settings"
            style={{ display: 'flex', padding: '8px', borderRadius: '6px', background: showSettings ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)', color: showSettings ? '#121418' : 'var(--text-primary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Settings size={16} />
          </button>
          {downloadUrl && (
            <button onClick={triggerDownload} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '6px', background: 'var(--accent-gold)', color: '#121418', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              <Download size={14} /> Download
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <div style={{
        position: 'fixed', right: showSettings ? 0 : '-320px', top: 0, height: '100vh', width: '300px',
        background: 'rgba(26, 30, 36, 0.97)', backdropFilter: 'blur(10px)',
        borderLeft: '1px solid var(--border)', zIndex: 1000,
        transition: 'right 0.3s ease', padding: '24px', overflowY: 'auto',
        boxShadow: showSettings ? '-4px 0 20px rgba(0,0,0,0.5)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>Reader Settings</h3>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
        </div>

        {/* Font Size */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '10px' }}>
            Font Size: {settings.fontSize}%
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>A</span>
            <input type="range" min="75" max="175" value={settings.fontSize} onChange={e => updateSettings({ fontSize: parseInt(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-gold)' }} />
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 700 }}>A</span>
          </div>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '10px' }}>Theme</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(THEMES).map(([key, t]) => {
              const Icon = t.icon;
              return (
                <button key={key} onClick={() => updateSettings({ theme: key })}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                    background: t.bg, color: t.text, border: settings.theme === key ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    transition: 'border-color 0.2s', fontSize: '0.75rem', fontWeight: 600
                  }}>
                  <Icon size={16} style={{ marginBottom: '4px' }} /><br />{t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Line Height */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '10px' }}>
            Line Height: {settings.lineHeight.toFixed(1)}
          </label>
          <input type="range" min="1.2" max="2.0" step="0.1" value={settings.lineHeight} onChange={e => updateSettings({ lineHeight: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-gold)' }} />
        </div>

        {/* Book Info */}
        <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '10px', marginTop: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{book.title}</p>
          <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{book.authors?.[0] || book.author || 'Unknown'}</p>
          {book.source && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accent-gold)' }}>Source: {book.source}</p>}
        </div>
      </div>

      {/* Reader Body */}
      <div className="reader-content">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '170px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <BookCover title={book.title} author={book.authors?.[0] || book.author} coverUrl={book.coverUrl || book.cover} />
            </div>
            <div>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>Loading "{book.title?.substring(0, 30)}..."</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Preparing your reading experience</p>
            </div>
          </div>
        ) : (epubData && !loadError) ? (
          <div style={{ position: 'relative', height: '100%', width: '100%', background: themeColors.bg }}>
            <ReactReader
              url={epubData}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
              showToc={true}
              getRendition={getRendition}
              epubOptions={{ flow: 'paginated', width: '100%', height: '100%' }}
            />
          </div>
        ) : iframeViewerUrl ? (
          <iframe
            src={iframeViewerUrl} title={book.title} width="100%" height="100%" frameBorder="0"
            allow="autoplay; fullscreen" allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            style={{ border: 'none', background: '#fff', width: '100%', height: '100%' }}
          />
        ) : loadError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', textAlign: 'center' }}>
            <BookOpen size={48} color="var(--text-muted)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Unable to load this book</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.85rem' }}>The book file could not be fetched. Try downloading it instead.</p>
            {downloadUrl && (
              <button onClick={triggerDownload} style={{ padding: '10px 24px', background: 'var(--accent-gold)', color: '#121418', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Download Book
              </button>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            {rawUrl && (
              <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`}
                title={book.title} width="100%" height="100%" frameBorder="0" allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                style={{ border: 'none', background: '#fff' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;
