import React, { useState } from 'react';
import { firebaseService } from '../multiplayer/FirebaseService';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [nickname, setNickname] = useState(firebaseService.username);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    try {
      await firebaseService.loginAnonymous(nickname.trim() || 'Explorer');
      onSuccess();
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        await firebaseService.registerWithEmail(email, password, nickname);
      } else {
        await firebaseService.loginWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pixel-window" style={{ width: '380px' }} onClick={(e) => e.stopPropagation()}>
        <div className="window-header">
          <span>👤 Multiplayer Account</span>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        {error && (
          <div style={{ color: '#ff5555', fontSize: '9px', background: 'rgba(255,0,0,0.1)', padding: '6px' }}>
            {error}
          </div>
        )}

        {/* Guest Fast Sign In */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: '#ffcc00', marginBottom: '6px' }}>Play as Guest</div>
          <input
            type="text"
            className="chat-input"
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px' }}
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={16}
          />
          <button className="top-bar-btn" style={{ width: '100%', padding: '8px' }} onClick={handleGuestLogin}>
            🚀 Play as {nickname || 'Guest'}
          </button>
        </div>

        {/* Email & Password */}
        <form onSubmit={handleEmailAuth} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>
          <div style={{ fontSize: '10px', color: '#55ff55', marginBottom: '6px' }}>
            {isRegister ? 'Create Account' : 'Account Login'}
          </div>
          <input
            type="email"
            className="chat-input"
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: '6px' }}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="chat-input"
            style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px' }}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="top-bar-btn" style={{ width: '100%', padding: '8px', background: '#27ae60' }}>
            {isRegister ? 'Register' : 'Login'}
          </button>
          <div style={{ marginTop: '8px', textAlign: 'center' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#6d758f', fontSize: '9px', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
