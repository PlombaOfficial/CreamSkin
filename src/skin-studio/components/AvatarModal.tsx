import React, { useState } from 'react';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { skinService } from '../firebase/SkinService';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/FirebaseConfig';

interface AvatarModalProps {
  currentBuffer: SkinTextureBuffer;
  onClose: () => void;
  onAvatarSaved: (newAvatarBase64: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  currentBuffer,
  onClose,
  onAvatarSaved,
}) => {
  const user = skinService.currentUser;

  // Extract head avatar from 64x64 skin
  const generateHeadAvatarFromBuffer = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = false;

    // Draw full skin to temporary canvas
    const temp = document.createElement('canvas');
    temp.width = 64;
    temp.height = 64;
    const tempCtx = temp.getContext('2d');
    if (!tempCtx) return '';
    const imgData = tempCtx.createImageData(64, 64);
    imgData.data.set(currentBuffer.data);
    tempCtx.putImageData(imgData, 0, 0);

    // Draw Head Base (8x8 at x:8, y:8) scaled to 64x64
    ctx.drawImage(temp, 8, 8, 8, 8, 0, 0, 64, 64);

    // Draw Head Outer Layer (8x8 at x:40, y:8) over Base
    ctx.drawImage(temp, 40, 8, 8, 8, 0, 0, 64, 64);

    return canvas.toDataURL('image/png');
  };

  const [previewAvatar, setPreviewAvatar] = useState<string>(generateHeadAvatarFromBuffer());

  const handleUseCurrentSkin = () => {
    const head = generateHeadAvatarFromBuffer();
    setPreviewAvatar(head);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save custom profile avatars.');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        avatarUrl: previewAvatar,
      });

      if (skinService.userProfile) {
        skinService.userProfile.avatarUrl = previewAvatar;
      }
      onAvatarSaved(previewAvatar);
      onClose();
    } catch {
      // Local fallback
      try {
        localStorage.setItem(`avatar_${user.uid}`, previewAvatar);
      } catch {}
      onAvatarSaved(previewAvatar);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800 }}>👤 Profile Avatar</h2>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Avatar Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '14px 0', gap: '10px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '12px',
            border: '2px solid #38bdf8',
            overflow: 'hidden',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={previewAvatar}
              alt="Avatar Preview"
              style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
            />
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Avatar 64×64 Pixel Preview</span>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="mc-btn-secondary"
            onClick={handleUseCurrentSkin}
          >
            ✂️ Generate Avatar from Current Skin Head
          </button>

          <label className="mc-btn-secondary" style={{ textAlign: 'center', cursor: 'pointer' }}>
            📁 Upload Custom Avatar Image
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <button className="tool-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="mc-btn-primary" onClick={handleSave}>
            Save as Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
