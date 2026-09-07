import React, { useState, useEffect, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { ArrowLeft, Download, ExternalLink, Loader2, Settings, X, Sun, Moon, BookOpen, Maximize, Minimize, FileText, Volume2, VolumeX, Highlighter, MessageSquare, Bookmark, BookmarkCheck } from 'lucide-react';
import BookCover from './BookCover';
import { ttsService } from '../services/textToSpeech';
import { annotationsService, type Highlight, type Note } from '../services/annotations';
import type { Book, ReaderViewProps } from '../types';

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

const ReaderView = ({ book, location, onLocationChanged, onClose }: ReaderViewProps) => {
  const [localLocation, setLocalLocation] = useState(location || 0);
  const [readerState, setReaderState] = useState({ status: 'loading', data: null, errorMsg: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(loadSettings);
  const [progress, setProgress] = useState(0);
  const [rendition, setRendition] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [textMenuPosition, setTextMenuPosition] = useState({ x: 0, y: 0 });
  
  // Annotations State
  const [showHighlights, setShowHighlights] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const updateSettings = (patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('free-kindle-reader-settings', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (rendition && rendition.themes) {
      try {
        if (rendition.themes.fontSize) rendition.themes.fontSize(`${settings.fontSize}%`);
        if (rendition.themes.override) {
          rendition.themes.override('line-height', `${settings.lineHeight}`);
          rendition.themes.override('color', THEMES[settings.theme].text);
          rendition.themes.override('background', THEMES[settings.theme].bg);
        }
      } catch (_e) {}
    }
  }, [rendition, settings]);

  const handleLocationChanged = useCallback((loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  }, [book.id, onLocationChanged]);

  const getRendition = useCallback((rend) => {
    setRendition(rend);
    try {
      if (rend.themes && rend.themes.fontSize) rend.themes.fontSize(`${settings.fontSize}%`);
      if (rend.themes && rend.themes.override) {
        rend.themes.override('line-height', `${settings.lineHeight}`);
        rend.themes.override('color', THEMES[settings.theme].text);
        rend.themes.override('background', THEMES[settings.theme].bg);
      }
    } catch (_e) {}

    // Add text selection handler
    rend.on('selected', (cfiRange, contents) => {
      const text = contents.window.getSelection().toString();
      if (text && text.length > 0) {
        setSelectedText(text);
        const selection = contents.window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setTextMenuPosition({ x: rect.left + rect.width / 2, y: rect.top - 50 });
          setShowTextMenu(true);
        }
      }
    });

    rend.on('relocated', (loc) => {
      if (loc && loc.start) {
        const pct = loc.start.percentage;
        if (typeof pct === 'number') setProgress(Math.round(pct * 100));
      }
    });
  }, [settings]);

  // TTS Functions
  const handleSpeak = async () => {
    if (!selectedText) return;
    
    try {
      if (isPlaying && !isPaused) {
        ttsService.pause();
        setIsPaused(true);
      } else if (isPaused) {
        ttsService.resume();
        setIsPaused(false);
      } else {
        await ttsService.speak(selectedText, { rate: 1.0, pitch: 1.0, volume: 1.0 });
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const handleStopSpeaking = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Annotation Functions
  const handleAddHighlight = (color: string) => {
    if (selectedText && rendition) {
      annotationsService.addHighlight(book.id, selectedText, selectedText, color);
      setShowTextMenu(false);
      setSelectedText('');
    }
  };

  const handleAddNote = () => {
    if (selectedText && currentNote.trim()) {
      if (editingNote) {
        annotationsService.updateNote(editingNote.id, { text: currentNote });
        setEditingNote(null);
      } else {
        annotationsService.addNote(book.id, currentNote, selectedText);
      }
      setCurrentNote('');
      setShowTextMenu(false);
      setSelectedText('');
    }
  };

  const handleToggleBookmark = () => {
    const bookmark = annotationsService.toggleBookmark(book.id, localLocation.toString(), book.title);
    setIsBookmarked(bookmark !== null);
  };

  // Check if current location is bookmarked
  useEffect(() => {
    setIsBookmarked(annotationsService.isBookmarked(book.id, localLocation.toString()));
  }, [book.id, localLocation]);

  const rawUrl = book.webReaderLink || book.download_url || book.previewLink || '';
  const isInternetArchive = book.source === 'Internet Archive' || rawUrl.includes('archive.org');

  // Universal Content Loader with Magic Bytes Inspection
  useEffect(() => {
    let isMounted = true;
    let blobUrlToRevoke = null;

    const prepareContent = async () => {
      if (!rawUrl && !book.id) {
        if (isMounted) setReaderState({ status: 'error', data: null, errorMsg: 'No reading source available for this book.' });
        return;
      }

      // 1. Internet Archive BookReader (embeds cleanly in iframe)
      if (isInternetArchive) {
        const idMatch = rawUrl.match(/archive\.org\/(?:details|embed)\/([a-zA-Z0-9_\-\.]+)/i);
        const iaId = idMatch ? idMatch[1] : (book.id ? book.id.replace('ia_', '') : '');
        if (isMounted) {
          setReaderState({
            status: 'iframe',
            data: `https://archive.org/embed/${iaId}`,
            errorMsg: ''
          });
        }
        return;
      }

      // 2. Determine target stream URL (bypass Google Drive virus scan screen using confirm=t)
      let fetchUrl = rawUrl;
      const driveMatch = rawUrl.match(/id=([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        const fileId = driveMatch[1];
        fetchUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
      }

      try {
        let buffer = null;

        // Try direct fetch first
        try {
          const res = await fetch(fetchUrl);
          if (res.ok) {
            const buf = await res.arrayBuffer();
            const textHead = new TextDecoder().decode(buf.slice(0, 100)).toLowerCase();
            if (!textHead.includes('<!doctype html') && !textHead.includes('<html')) {
              buffer = buf;
            }
          }
        } catch (_directErr) {
          // Direct fetch failed (CORS), fall back to proxy
        }

        // Try proxy if direct failed
        if (!buffer) {
          try {
            const proxyRes = await fetch(`/api/proxy?url=${encodeURIComponent(fetchUrl)}`);
            if (proxyRes.ok) {
              const buf = await proxyRes.arrayBuffer();
              const textHead = new TextDecoder().decode(buf.slice(0, 100)).toLowerCase();
              if (!textHead.includes('<!doctype html') && !textHead.includes('<html')) {
                buffer = buf;
              }
            }
          } catch (_proxyErr) {}
        }

        // Fallback to allorigins
        if (!buffer) {
          try {
            const allOriginsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`);
            if (allOriginsRes.ok) {
              const buf = await allOriginsRes.arrayBuffer();
              const textHead = new TextDecoder().decode(buf.slice(0, 100)).toLowerCase();
              if (!textHead.includes('<!doctype html') && !textHead.includes('<html')) {
                buffer = buf;
              }
            }
          } catch (_aoErr) {}
        }

        // If buffer received, inspect magic bytes:
        if (buffer && buffer.byteLength > 1000) {
          const b = new Uint8Array(buffer.slice(0, 4));
          const isZipOrEpub = b[0] === 0x50 && b[1] === 0x4B && b[2] === 0x03 && b[3] === 0x04; // PK..
          const isPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46; // %PDF

          if (isPdf) {
            const blob = new Blob([buffer], { type: 'application/pdf' });
            blobUrlToRevoke = URL.createObjectURL(blob);
            if (isMounted) {
              setReaderState({ status: 'pdf', data: blobUrlToRevoke, errorMsg: '' });
            }
            return;
          }

          if (isZipOrEpub) {
            if (isMounted) {
              setReaderState({ status: 'epub', data: buffer, errorMsg: '' });
            }
            return;
          }
        }

        // If not a direct binary or fetch was blocked, fallback to iframe viewers:
        if (driveMatch) {
          const fileId = driveMatch[1];
          if (isMounted) {
            setReaderState({
              status: 'iframe',
              data: `https://drive.google.com/file/d/${fileId}/preview`,
              errorMsg: ''
            });
          }
          return;
        }

        if (rawUrl.toLowerCase().includes('.pdf')) {
          if (isMounted) {
            setReaderState({
              status: 'iframe',
              data: `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`,
              errorMsg: ''
            });
          }
          return;
        }

        if (rawUrl) {
          if (isMounted) {
            setReaderState({ status: 'iframe', data: rawUrl, errorMsg: '' });
          }
          return;
        }

        if (isMounted) {
          setReaderState({ status: 'error', data: null, errorMsg: 'Unable to stream this book format.' });
        }
      } catch (err) {
        if (isMounted) {
          setReaderState({ status: 'error', data: null, errorMsg: err.message || 'Error opening reader.' });
        }
      }
    };

    prepareContent();

    return () => {
      isMounted = false;
      if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
    };
  }, [rawUrl, isInternetArchive, book.id]);

  const downloadUrl = book.download_url || rawUrl;
  const triggerDownload = (e) => {
    e.preventDefault();
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = `${book.title || 'book'}.${readerState.status === 'pdf' ? 'pdf' : 'epub'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
      {/* Real-time Progress Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 100 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gold)', transition: 'width 0.3s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Header */}
      <div className="reader-header" style={{ background: 'rgba(18,20,24,0.96)', backdropFilter: 'blur(10px)' }}>
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
          <button onClick={handleToggleBookmark} title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            style={{ display: 'flex', padding: '8px', borderRadius: '6px', background: isBookmarked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)', color: isBookmarked ? '#121418' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button onClick={() => setShowHighlights(!showHighlights)} title="Highlights"
            style={{ display: 'flex', padding: '8px', borderRadius: '6px', background: showHighlights ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)', color: showHighlights ? '#121418' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            <Highlighter size={16} />
          </button>
          <button onClick={() => setShowNotes(!showNotes)} title="Notes"
            style={{ display: 'flex', padding: '8px', borderRadius: '6px', background: showNotes ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)', color: showNotes ? '#121418' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={16} />
          </button>
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

      {/* Text Selection Menu */}
      {showTextMenu && selectedText && (
        <div style={{
          position: 'fixed', top: textMenuPosition.y, left: textMenuPosition.x,
          background: 'rgba(26, 30, 36, 0.98)', backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px', display: 'flex', gap: '4px', zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <button onClick={handleSpeak} title="Read Aloud"
            style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            {isPlaying && !isPaused ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={() => handleAddHighlight('#ffff00')} title="Yellow Highlight"
            style={{ padding: '8px', borderRadius: '6px', background: '#ffff00', color: '#000', border: 'none', cursor: 'pointer' }} />
          <button onClick={() => handleAddHighlight('#00ff00')} title="Green Highlight"
            style={{ padding: '8px', borderRadius: '6px', background: '#00ff00', color: '#000', border: 'none', cursor: 'pointer' }} />
          <button onClick={() => handleAddHighlight('#ff0000')} title="Red Highlight"
            style={{ padding: '8px', borderRadius: '6px', background: '#ff0000', color: '#fff', border: 'none', cursor: 'pointer' }} />
          <button onClick={() => { setShowTextMenu(false); setShowNotes(true); }} title="Add Note"
            style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            <MessageSquare size={16} />
          </button>
          <button onClick={() => { setShowTextMenu(false); setSelectedText(''); }} title="Close"
            style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Settings Drawer */}
      <div style={{
        position: 'fixed', right: showSettings ? 0 : '-320px', top: 0, height: '100vh', width: '300px',
        background: 'rgba(26, 30, 36, 0.98)', backdropFilter: 'blur(10px)',
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

      {/* Reader Content Body */}
      <div className="reader-content" style={{ height: 'calc(100vh - 60px)', position: 'relative' }}>
        {readerState.status === 'loading' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '130px', height: '185px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
              <BookCover title={book.title} author={book.authors?.[0] || book.author} coverUrl={book.coverUrl || book.cover} />
            </div>
            <div>
              <Loader2 size={30} className="animate-spin" style={{ color: 'var(--accent-gold)', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>Loading "{book.title?.substring(0, 32)}..."</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Connecting in-browser reading engine</p>
            </div>
          </div>
        ) : readerState.status === 'epub' && readerState.data ? (
          <div style={{ position: 'relative', height: '100%', width: '100%', background: themeColors.bg }}>
            <ReactReader
              url={readerState.data}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
              showToc={true}
              getRendition={getRendition}
              epubOptions={{ flow: 'paginated', width: '100%', height: '100%' }}
            />
          </div>
        ) : readerState.status === 'pdf' && readerState.data ? (
          <div style={{ width: '100%', height: '100%', background: '#323639' }}>
            <iframe
              src={readerState.data}
              title={book.title}
              width="100%"
              height="100%"
              style={{ border: 'none', width: '100%', height: '100%' }}
            />
          </div>
        ) : readerState.status === 'iframe' && readerState.data ? (
          <iframe
            src={readerState.data}
            title={book.title}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{ border: 'none', background: '#fff', width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.2rem', textAlign: 'center', padding: '2rem' }}>
            <BookOpen size={52} color="var(--text-muted)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.2rem' }}>Unable to preview in-browser</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
              {readerState.errorMsg || 'This title format requires external reading software.'} You can download the file directly to read in Kindle, Apple Books, or your favorite e-reader.
            </p>
            {downloadUrl && (
              <button
                onClick={triggerDownload}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 26px', borderRadius: '8px',
                  background: 'var(--accent-gold)', color: '#121418',
                  border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700
                }}
              >
                <Download size={16} /> Download File
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;