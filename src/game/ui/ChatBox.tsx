import React, { useState, useEffect, useRef } from 'react';
import { firebaseService } from '../multiplayer/FirebaseService';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  onClose: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      senderUid: 'sys',
      senderName: 'System',
      text: 'Welcome to Minecraft 2D Sandbox! Chat with other players here.',
      timestamp: Date.now(),
      isSystem: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    firebaseService.subscribeToChat((newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');

    const success = await firebaseService.sendChatMessage(text);
    if (!success) {
      // Local echo fallback if offline
      setMessages((prev) => [
        ...prev,
        {
          id: `local_${Date.now()}`,
          senderUid: 'local',
          senderName: firebaseService.username,
          text,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return (
    <div className="chat-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#1c202b', borderBottom: '2px solid var(--ui-border-light)' }}>
        <span style={{ fontSize: '10px', color: '#ffcc00' }}>💬 Global World Chat</span>
        <button className="close-btn" style={{ padding: '2px 5px', fontSize: '8px' }} onClick={onClose}>✖</button>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={m.id} className="chat-msg">
              <span style={{ color: '#6d758f', fontSize: '13px' }}>[{time}] </span>
              <span className={`chat-sender ${m.isSystem ? 'system' : ''}`}>
                &lt;{m.senderName}&gt;{' '}
              </span>
              <span>{m.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder="Press Enter to send..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={200}
          autoFocus
        />
        <button type="submit" className="chat-send-btn">Send</button>
      </form>
    </div>
  );
};
