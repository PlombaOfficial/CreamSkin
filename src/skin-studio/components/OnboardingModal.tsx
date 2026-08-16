import React, { useState } from 'react';
import { LanguageCode, getTranslation } from '../i18n/translations';

interface OnboardingModalProps {
  lang: LanguageCode;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ lang, onClose }) => {
  const [step, setStep] = useState(0);

  const t = (key: string) => getTranslation(lang, key);

  const steps = [
    {
      title: t('onboard.step1Title'),
      desc: t('onboard.step1Desc'),
      icon: '🎨',
      highlight: 'Standard 64×64 Minecraft UV format with Layer 1 Base & Layer 2 Outer Overlay.',
    },
    {
      title: t('onboard.step2Title'),
      desc: t('onboard.step2Desc'),
      icon: '🧍',
      highlight: 'Real-time WebGL Three.js viewport with Idle breathing, Walk cycles, and body part toggles.',
    },
    {
      title: t('onboard.step3Title'),
      desc: t('onboard.step3Desc'),
      icon: '🚀',
      highlight: 'Download official 64x64 PNG or equip skins directly on Spigot/Paper Minecraft servers with /skin set <id>.',
    },
  ];

  const handleFinish = () => {
    try {
      localStorage.setItem('creamskin_tutorial_seen', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleFinish}>
      <div className="modal-dialog" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '38px', marginBottom: '6px' }}>{steps[step].icon}</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{t('onboard.welcome')}</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{t('onboard.intro')}</p>
        </div>

        <div className="panel-box" style={{ background: '#111622', padding: '16px', borderRadius: '10px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>{steps[step].title}</h3>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', marginTop: '6px' }}>
            {steps[step].desc}
          </p>
          <div style={{ marginTop: '10px', background: '#0a0d14', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#f59e0b', fontFamily: 'monospace' }}>
            💡 {steps[step].highlight}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '6px 0' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === step ? '#3b82f6' : '#334155',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <button
            className="tool-btn-sm"
            style={{ opacity: step === 0 ? 0.3 : 1 }}
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ← Back
          </button>

          {step < steps.length - 1 ? (
            <button
              className="mc-btn-primary"
              style={{ padding: '8px 18px' }}
              onClick={() => setStep((s) => s + 1)}
            >
              Next Step →
            </button>
          ) : (
            <button
              className="mc-btn-primary"
              style={{ padding: '8px 20px' }}
              onClick={handleFinish}
            >
              {t('onboard.getStarted')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
