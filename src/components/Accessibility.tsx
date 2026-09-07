import { useEffect } from 'react';

/**
 * Accessibility Component
 * Adds global accessibility features to the application
 */
const Accessibility = () => {
  useEffect(() => {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--accent-gold);
      color: var(--bg-dark);
      padding: 8px;
      z-index: 10000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content id
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.id = 'main-content';
      mainContent.setAttribute('tabindex', '-1');
    }

    // Keyboard navigation enhancements
    const handleKeyboardNavigation = (e: KeyboardEvent) => {
      // Escape key closes modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLElement;
          if (closeButton) closeButton.click();
        });
      }
      
      // Arrow key navigation for book grids
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
          e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('mini-book-card')) {
          const grid = focusedElement.parentElement;
          if (grid) {
            const cards = Array.from(grid.querySelectorAll('.mini-book-card'));
            const currentIndex = cards.indexOf(focusedElement);
            let nextIndex = currentIndex;
            
            if (e.key === 'ArrowRight') nextIndex = currentIndex + 1;
            if (e.key === 'ArrowLeft') nextIndex = currentIndex - 1;
            if (e.key === 'ArrowDown') nextIndex = currentIndex + 4; // Assuming 4 columns
            if (e.key === 'ArrowUp') nextIndex = currentIndex - 4;
            
            if (nextIndex >= 0 && nextIndex < cards.length) {
              e.preventDefault();
              (cards[nextIndex] as HTMLElement).focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardNavigation);

    // Live region announcements for screen readers
    const announceToScreenReader = (message: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Make announce function available globally
    (window as any).announceToScreenReader = announceToScreenReader;

    // Add ARIA labels to dynamic elements
    const addAriaLabels = () => {
      // Book cards
      document.querySelectorAll('.mini-book-card').forEach(card => {
        if (!card.getAttribute('aria-label')) {
          const title = card.querySelector('.mini-title')?.textContent || 'Book';
          const author = card.querySelector('.mini-author')?.textContent || 'Unknown Author';
          card.setAttribute('aria-label', `${title} by ${author}. Click to view details.`);
        }
      });
      
      // Navigation items
      document.querySelectorAll('.nav-item').forEach(item => {
        if (!item.getAttribute('aria-label')) {
          const text = item.textContent?.trim() || 'Navigation';
          item.setAttribute('aria-label', text);
          item.setAttribute('role', 'button');
        }
      });
    };

    // Run initially and on DOM changes
    addAriaLabels();
    const observer = new MutationObserver(addAriaLabels);
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
      observer.disconnect();
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
    };
  }, []);

  return null;
};

export default Accessibility;