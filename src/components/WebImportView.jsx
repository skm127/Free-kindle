import React, { useState } from 'react';
import { Globe, Link2, BookOpen, Download, Plus, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import BookCover from './BookCover';

const CURATED_SOURCES = [
  {
    name: 'Internet Archive',
    url: 'https://archive.org/details/books',
    desc: 'Over 20+ million free borrowable and public domain books',
    icon: '🏛️'
  },
  {
    name: 'Standard Ebooks',
    url: 'https://standardebooks.org/ebooks',
    desc: 'Free, beautifully formatted modern digital editions',
    icon: '✨'
  },
  {
    name: 'Project Gutenberg',
    url: 'https://www.gutenberg.org',
    desc: '70,000+ free public domain classic ebooks',
    icon: '📜'
  },
  {
    name: 'Open Library',
    url: 'https://openlibrary.org',
    desc: 'Open, editable digital library catalog with millions of titles',
    icon: '📚'
  }
];

const WebImportView = ({ onBookSelect, onReadBook, onAddToReadlist, isInReadlist }) => {
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [importedBook, setImportedBook] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const parseUrl = (rawUrl) => {
    const url = rawUrl.trim();
    if (!url) return null;

    let title = titleInput.trim();
    let author = authorInput.trim() || 'Web Author';
    let source = 'Web Import';
    let downloadUrl = url;
    let webReaderLink = url;
    let previewLink = url;

    // Check Internet Archive details URL: archive.org/details/IDENTIFIER
    const iaMatch = url.match(/archive\.org\/details\/([a-zA-Z0-9_\-\.]+)/i);
    if (iaMatch) {
      const id = iaMatch[1];
      source = 'Internet Archive';
      webReaderLink = `https://archive.org/embed/${id}`;
      downloadUrl = `https://archive.org/details/${id}`;
      if (!title) {
        title = id.replace(/[-_]/g, ' ').replace(/\d+$/, '').trim();
      }
    }

    // Check Google Drive URL
    const driveMatch = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      source = 'Google Drive';
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      webReaderLink = `https://drive.google.com/file/d/${fileId}/preview`;
      previewLink = `https://drive.google.com/file/d/${fileId}/view`;
      if (!title) title = 'Imported Google Drive Book';
    }

    // Check Gutenberg
    const gutMatch = url.match(/gutenberg\.org\/ebooks\/(\d+)/i);
    if (gutMatch) {
      const gId = gutMatch[1];
      source = 'Project Gutenberg';
      downloadUrl = `https://www.gutenberg.org/ebooks/${gId}.epub.images`;
      webReaderLink = downloadUrl;
      previewLink = `https://www.gutenberg.org/ebooks/${gId}`;
      if (!title) title = `Gutenberg Classic #${gId}`;
    }

    // Default title fallback from URL pathname
    if (!title) {
      try {
        const path = new URL(url).pathname;
        const lastPart = path.split('/').filter(Boolean).pop() || 'Web Book';
        title = decodeURIComponent(lastPart)
          .replace(/\.(epub|pdf|mobi|azw3|txt|html)$/i, '')
          .replace(/[-_]/g, ' ')
          .trim();
      } catch (_e) {
        title = 'Web Book';
      }
    }

    return {
      id: `web_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title || 'Web Book',
      author: author,
      authors: [author],
      source: source,
      download_url: downloadUrl,
      webReaderLink: webReaderLink,
      previewLink: previewLink,
      cover_url: `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-L.jpg`,
      categories: ['Web Import', 'Open Web'],
      description: `Book imported directly from ${new URL(url).hostname}. Read and download freely.`
    };
  };

  const handleImport = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setAnalyzing(true);
    setSuccessMessage('');
    try {
      const book = parseUrl(urlInput);
      setImportedBook(book);
      setSuccessMessage('Book link imported successfully!');
    } catch (_err) {
      alert('Please enter a valid URL.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(230, 200, 152, 0.15)',
          color: 'var(--accent-gold)',
          padding: '0.35rem 1rem',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          <Globe size={16} />
          <span>Full Open Internet Access</span>
        </div>
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Read Any Book from the Internet
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Paste any EPUB, PDF, Google Drive link, Internet Archive link, or Gutenberg URL from anywhere on the web to read directly in-browser or download.
        </p>
      </div>

      {/* URL Input Form */}
      <div style={{
        background: '#131c2e',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '3rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
      }}>
        <form onSubmit={handleImport}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
              Book URL (Direct EPUB, PDF, Internet Archive, Drive, Gutenberg link)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Link2 size={20} style={{ position: 'absolute', left: '1rem', color: 'var(--accent-gold)' }} />
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://archive.org/details/... or https://.../book.epub"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 3rem',
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                Optional: Book Title
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Clean Code (optional)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                Optional: Author
              </label>
              <input
                type="text"
                value={authorInput}
                onChange={(e) => setAuthorInput(e.target.value)}
                placeholder="e.g. Robert C. Martin (optional)"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={analyzing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', justifyContent: 'center' }}
          >
            <Sparkles size={18} />
            <span>Load & Prepare Book for Reading</span>
          </button>
        </form>

        {/* Imported Book Result Preview */}
        {importedBook && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '10px',
            border: '1px solid var(--accent-gold)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ width: '100px', flexShrink: 0 }}>
              <BookCover
                title={importedBook.title}
                author={importedBook.author}
                coverUrl={importedBook.cover_url}
                className="mini-cover"
                style={{ width: '100%', height: 'auto', aspectRatio: '2/3' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <CheckCircle size={16} />
                <span>Ready to Read</span>
              </div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#fff' }}>{importedBook.title}</h3>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>by {importedBook.author}</p>
              
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onReadBook(importedBook)}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <BookOpen size={16} fill="currentColor" />
                  READ NOW
                </button>

                <a
                  href={importedBook.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={16} />
                  DOWNLOAD
                </a>

                {onAddToReadlist && (
                  <button
                    onClick={() => onAddToReadlist(importedBook)}
                    className={isInReadlist(importedBook.id) ? "btn-primary" : "btn-secondary"}
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} />
                    {isInReadlist(importedBook.id) ? "IN READLIST" : "SAVE BOOK"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Free Digital Libraries on the Web */}
      <div>
        <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Explore Free Open-Access Libraries
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {CURATED_SOURCES.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#131c2e',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{source.icon}</div>
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{source.name}</span>
                  <ExternalLink size={14} style={{ color: 'var(--text-secondary)' }} />
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  {source.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WebImportView;
