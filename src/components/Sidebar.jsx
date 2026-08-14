import React from 'react';
import { Search, Home, LayoutGrid, User, Settings, Library } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Library size={32} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <button 
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
          aria-label="Search"
        >
          <Search size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          aria-label="Home"
        >
          <Home size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
          aria-label="Catalog"
        >
          <LayoutGrid size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
          aria-label="My Bookshelf"
          title="My Bookshelf"
        >
          <User size={24} />
        </button>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button className="nav-item" aria-label="Settings">
          <Settings size={24} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
