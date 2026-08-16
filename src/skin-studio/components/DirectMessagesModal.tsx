import React, { useState, useEffect, useRef } from 'react';
import { skinService } from '../firebase/SkinService';
import { DirectMessage } from '../types';
import { LanguageCode } from '../i18n/translations';

interface DirectMessagesModalProps {
  initialRecipientUid?: string;
  initialRecipientName?: string;
  lang: LanguageCode;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  initialRecipientUid,
  initialRecipientName,
  lang: _lang,
  onClose,
  onOpenAuth: _onOpenAuth,
}) => {
  const user = skinService.currentUser;

  const [chatMode, setChatMode] = useState<'global' | 'dm'>(initialRecipientUid ? 'dm' : 'global');
  const [recipientUid] = useState(initialRecipientUid || 'official');
  const [recipientName] = useState(initialRecipientName || 'CreamSkin Team');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let unsub: () => void;
    if (chatMode === 'global') {
      unsub = skinService.subscribeToGlobalChat((list) => {
        setMessages(list);
      });
    } else {
      const convId = user ? [user.uid, recipientUid].sort().join('_') : 'guest_conv';
      unsub = skinService.subscribeToConversation(convId, (list) => {
        setMessages(list);
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [chatMode, recipientUid, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (chatMode === 'global') {
      await skinService.sendGlobalChatMessage(inputText);
    } else {
      await skinService.sendDirectMessage(recipientUid, recipientName, inputText);
    }
    setInputText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px', height: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--cs-border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`mc-btn-secondary ${chatMode === 'global' ? 'active' : ''}`}
              onClick={() => setChatMode('global')}
            >
              🌍 Global Chat
            </button>
            <button
              className={`mc-btn-secondary ${chatMode === 'dm' ? 'active' : ''}`}
              onClick={() => setChatMode('dm')}
            >
              💬 Direct Messages ({recipientName})
            </button>
          </div>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px 4px',
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '80px' }}>
              {chatMode === 'global'
                ? 'No messages yet in Global Chat. Say hello to everyone!'
                : 'No private messages yet. Send a greeting to start a conversation!'}
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderUid === user?.uid || m.senderName === skinService.userProfile?.username;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isMe ? '#2563eb' : '#1e293b',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '10px', color: isMe ? '#bfdbfe' : '#94a3b8', marginBottom: '2px' }}>
                    <strong>{m.senderName}</strong>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ wordBreak: 'break-word' }}>{m.text}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--cs-border-subtle)', paddingTop: '10px' }}>
          <input
            type="text"
            style={{ flex: 1 }}
            placeholder={chatMode === 'global' ? 'Message global chat...' : `Message ${recipientName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="mc-btn-primary" style={{ padding: '6px 14px' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
