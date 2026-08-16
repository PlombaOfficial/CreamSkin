import React, { useState, useEffect } from 'react';
import { skinService } from '../firebase/SkinService';
import { DirectMessage } from '../types';

interface DirectMessagesModalProps {
  initialRecipientUid?: string;
  initialRecipientName?: string;
  onClose: () => void;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  initialRecipientUid = 'official',
  initialRecipientName = 'CreamSkin Team',
  onClose,
}) => {
  const user = skinService.currentUser;
  const [recipientUid] = useState(initialRecipientUid);
  const [recipientName] = useState(initialRecipientName);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const convId = user ? [user.uid, recipientUid].sort().join('_') : 'guest_conv';

  useEffect(() => {
    if (!user) return;
    const unsub = skinService.subscribeToConversation(convId, (list) => {
      setMessages(list);
    });
    return () => unsub();
  }, [user, convId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!user) {
      alert('Please sign in or enter guest mode to send direct messages.');
      return;
    }

    await skinService.sendDirectMessage(recipientUid, recipientName, inputText);
    setInputText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '500px', height: '520px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>💬 Direct Message</h3>
            <span style={{ fontSize: '11px', color: '#38bdf8' }}>Chatting with {recipientName}</span>
          </div>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px 4px',
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '60px' }}>
              No messages yet. Send a greeting to start a conversation!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderUid === user?.uid;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                    background: isMe ? '#2563eb' : '#1e293b',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
                    {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>{m.text}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px' }}>
          <input
            type="text"
            className="color-hex-input"
            style={{ flex: 1 }}
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="tool-btn-sm" style={{ background: '#3b82f6', color: '#fff', padding: '8px 14px' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
