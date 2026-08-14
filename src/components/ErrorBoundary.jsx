import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#121418', color: '#e2e8f0', fontFamily: 'sans-serif', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8' }}>The app encountered an unexpected error.</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ padding: '0.75rem 2rem', background: '#e6c898', color: '#1a1e24', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Clear Data & Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
