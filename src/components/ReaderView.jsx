import React, { useState } from 'react';
import { ReactReader } from 'react-reader';

const ReaderView = ({ book, location, onLocationChanged, onClose }) => {
  const [localLocation, setLocalLocation] = useState(location || 0);

  const handleLocationChanged = (loc) => {
    setLocalLocation(loc);
    onLocationChanged(book.id, loc);
  };

  const isEpub = book.webReaderLink && book.webReaderLink.endsWith('.epub');
  const isGutenbergEpub = book.source === 'Project Gutenberg' && book.webReaderLink && book.webReaderLink.includes('.epub');

  // Attempt to build a preview URL for Google Drive
  let iframeUrl = null;
  if (book.source === 'Google Drive' && book.download_url) {
    const idMatch = book.download_url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      iframeUrl = `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  } else if (book.source === 'Open Library' && book.webReaderLink) {
    iframeUrl = book.webReaderLink;
  } else if (book.source === 'Project Gutenberg' && !isGutenbergEpub && book.webReaderLink) {
    iframeUrl = book.webReaderLink;
  }

  return (
    <div className="reader-view">
      <div className="reader-header">
        <button onClick={onClose} className="reader-back-btn">
          ← Back to Library
        </button>
        <h2 className="reader-title">{book.title}</h2>
        <div style={{ width: '100px' }}></div>
      </div>
      
      <div className="reader-content">
        {(isEpub || isGutenbergEpub) ? (
          <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <ReactReader
              url={book.webReaderLink}
              title={book.title}
              location={localLocation}
              locationChanged={handleLocationChanged}
            />
          </div>
        ) : iframeUrl ? (
          <iframe 
            src={iframeUrl}
            title={book.title}
            width="100%" 
            height="100%" 
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="reader-error">
            <h3>Sorry, this book cannot be read in the browser.</h3>
            <a href={book.download_url || book.webReaderLink} target="_blank" rel="noreferrer" className="gr-button">
              Download or Read Externally
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;
