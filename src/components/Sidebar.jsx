import React from 'react';
import { Search, Home, LayoutGrid, User, Library, Globe } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }} title="Free Kindle">
        <Library size={32} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <button 
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
          aria-label="Search"
          title="Search Library"
        >
          <Search size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-label="Home"
          title="Home & Bestsellers"
        >
          <Home size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
          aria-label="Catalog"
          title="Browse Categories"
        >
          <LayoutGrid size={24} />
        </button>

        <button 
          className={`nav-item ${activeTab === 'web' ? 'active' : ''}`}
          onClick={() => setActiveTab('web')}
          aria-label="Import & Web Access"
          title="Read Any Link from Internet"
        >
          <Globe size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-label="My Bookshelf"
          title="My Bookshelf & Profile"
        >
          <User size={24} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
