import React, { useState } from 'react';
import { skinService } from '../firebase/SkinService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'guest' | 'login' | 'register'>('guest');
  const [guestName, setGuestName] = useState('SteveCrafter');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await skinService.loginAnonymous(guestName.trim() || 'Crafter');
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Guest login failed.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await skinService.loginWithEmail(email, password);
      } else {
        await skinService.registerWithEmail(email, password, username.trim() || 'Crafter');
      }
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Account & Community</h2>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          <button
            className={`mc-btn-secondary ${mode === 'guest' ? 'active' : ''}`}
            onClick={() => setMode('guest')}
          >
            ⚡ Guest
          </button>
          <button
            className={`mc-btn-secondary ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            🔑 Log In
          </button>
          <button
            className={`mc-btn-secondary ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            📝 Register
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        {mode === 'guest' ? (
          <form onSubmit={handleGuestLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Jump straight into CreamSkin Studio without an email or password.
            </p>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Your Display Name</label>
              <input
                type="text"
                style={{ marginTop: '4px', width: '100%' }}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. DiamondMiner99"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mc-btn-primary"
              style={{ padding: '10px', marginTop: '6px' }}
            >
              {loading ? 'Entering...' : '⚡ Play as Guest'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Username</label>
                <input
                  type="text"
                  required
                  style={{ marginTop: '4px', width: '100%' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. EnderKnight"
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Email</label>
              <input
                type="email"
                required
                style={{ marginTop: '4px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Password</label>
              <input
                type="password"
                required
                style={{ marginTop: '4px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mc-btn-primary"
              style={{ padding: '10px', marginTop: '6px' }}
            >
              {loading ? 'Processing...' : mode === 'login' ? '🔑 Sign In' : '📝 Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
