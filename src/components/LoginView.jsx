import React, { useState } from 'react';
import { Mail, Lock, LogIn, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithMicrosoft, 
  registerWithEmail, 
  loginWithEmail, 
  resetUserPassword 
} from '../services/firebase';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Please complete the Google popup.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console yet. Please add your current domain in Firebase Auth Settings.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      const user = await signInWithMicrosoft();
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      console.error('Microsoft login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Please complete the Microsoft popup.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Microsoft.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    // Auto-complete email format if user entered plain username
    let normalizedEmail = email.trim();
    if (!normalizedEmail.includes('@')) {
      normalizedEmail = `${normalizedEmail.toLowerCase()}@freekindle.app`;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const user = await registerWithEmail(normalizedEmail, password, name.trim() || email.split('@')[0]);
        if (user) onLogin(user);
      } else {
        const user = await loginWithEmail(normalizedEmail, password);
        if (user) onLogin(user);
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email/username or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password is too weak. Must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address in the field above first.');
      return;
    }
    setErrorMsg('');
    try {
      await resetUserPassword(email.trim());
      setSuccessMsg('Password reset link sent to your email!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  return (
    <div className="login-page">
      {/* Illustration Panel */}
      <div className="login-illustration-panel">
        <div className="login-illustration-overlay" />
        <img
          src={isRegistering ? '/images/signup-illustration.jpg' : '/images/login-illustration.jpg'}
          alt="Illustration"
          className="login-illustration-img"
        />
        <div className="login-illustration-content">
          <h1 className="login-illustration-title">
            {isRegistering ? 'Join the Adventure' : 'Welcome Back, Reader'}
          </h1>
          <p className="login-illustration-subtitle">
            {isRegistering
              ? 'Create your free account and explore 80,000+ books from Google Drive, Internet Archive & Gutenberg.'
              : 'Your digital library of thousands of free books awaits.'}
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Logo / Brand */}
          <div className="login-brand">
            <span className="login-brand-icon">📚</span>
            <span className="login-brand-name">Free Kindle</span>
          </div>

          <h2 className="login-heading">
            {isRegistering ? 'Sign up' : 'Log in'}
          </h2>
          <p className="login-subheading">
            {isRegistering
              ? 'Create an account to save books and sync your reading progress.'
              : 'Sign in to access your readlist and bookshelf.'}
          </p>

          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <div className="login-field">
                <label htmlFor="login-name" className="login-label">Full Name</label>
                <div className="login-input-wrapper">
                  <User size={18} className="login-input-icon" />
                  <input
                    id="login-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="login-input"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="login-email" className="login-label">Email or username</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="login-email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com or username"
                  className="login-input"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>{isRegistering ? 'Sign up' : 'Log in'}</span>
                </>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="login-divider">
            <span>or sign in with</span>
          </div>

          <div className="login-social-row">
            <button 
              className="login-social-btn" 
              type="button" 
              aria-label="Sign in with Google" 
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              title="Sign in with Google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>

            <button 
              className="login-social-btn" 
              type="button" 
              aria-label="Sign in with Microsoft" 
              onClick={handleMicrosoftLogin}
              disabled={isSubmitting}
              title="Sign in with Microsoft"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
              </svg>
            </button>
          </div>

          {/* Forgot Password */}
          {!isRegistering && (
            <div className="login-forgot">
              <button type="button" className="login-forgot-btn" onClick={handleForgotPassword}>
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Mode */}
          <div className="login-toggle">
            <span>{isRegistering ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" className="login-toggle-btn" onClick={toggleMode}>
              {isRegistering ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
