import React, { useState } from 'react';
import { skinService } from '../firebase/SkinService';
import { ReportItem } from '../types';

interface ReportModalProps {
  targetType: ReportItem['targetType'];
  targetId: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ targetType, targetId, onClose }) => {
  const [reason, setReason] = useState<ReportItem['reason']>('inappropriate');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await skinService.submitReport(targetType, targetId, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>🚩 Report Content</h3>
          <button className="tool-btn-sm" onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#10b981', fontSize: '14px' }}>
            ✓ Thank you. Your report has been submitted to moderators for review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Help keep CreamSkin safe and welcoming. Please select a reason for reporting this {targetType}.
            </p>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>Reason</label>
              <select
                style={{ marginTop: '4px', width: '100%' }}
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
              >
                <option value="inappropriate">Inappropriate / NSFW Content</option>
                <option value="stolen">Stolen / Copyright Violation</option>
                <option value="spam">Spam / Duplicate Posting</option>
                <option value="harassment">Harassment / Hate Speech</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>Additional Details (Optional)</label>
              <textarea
                rows={3}
                style={{ marginTop: '4px', width: '100%', resize: 'none' }}
                placeholder="Explain the issue..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
              <button type="button" className="tool-btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="mc-btn-danger"
                style={{ padding: '6px 14px' }}
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
