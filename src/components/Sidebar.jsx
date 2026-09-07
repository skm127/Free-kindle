import React from 'react';
import { Search, Home, LayoutGrid, User, Library, Globe, Trophy } from 'lucide-react';
import { analyticsService } from '../services/analytics';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    analyticsService.trackInteraction('sidebar_navigation', tab, { fromTab: activeTab, toTab: tab });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => handleNavigation('home')} style={{ cursor: 'pointer' }} title="Free Kindle">
        <Library size={32} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <button 
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleNavigation('search')}
          aria-label="Search"
          title="Search Library"
        >
          <Search size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation('home')}
          aria-label="Home"
          title="Home & Bestsellers"
        >
          <Home size={24} />
        </button>

        <button 
          className={`nav-item ${activeTab === 'rankings' ? 'active' : ''}`}
          onClick={() => handleNavigation('rankings')}
          aria-label="Rankings"
          title="Book Rankings"
        >
          <Trophy size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => handleNavigation('catalog')}
          aria-label="Catalog"
          title="Browse Categories"
        >
          <LayoutGrid size={24} />
        </button>

        <button 
          className={`nav-item ${activeTab === 'web' ? 'active' : ''}`}
          onClick={() => handleNavigation('web')}
          aria-label="Import & Web Access"
          title="Read Any Link from Internet"
        >
          <Globe size={24} />
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('profile')}
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
