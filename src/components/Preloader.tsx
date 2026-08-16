import React, { useEffect, useState } from 'react';
import './Preloader.css';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('CALIBRATING TRANSDUCERS...');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const stages = [
      { at: 15, text: 'SYNCHRONIZING HYDROPHONE ARRAY...' },
      { at: 40, text: 'ESTABLISHING OPTICAL LINK // R/V OCEANUS...' },
      { at: 70, text: 'CALCULATING BATHYMETRIC CONTOURS // 4,820M...' },
      { at: 90, text: 'SECURE ARCHIVE CLEARANCE LEVEL 4 VERIFIED' },
      { at: 100, text: 'EXPEDITION 07 // DECENTRALIZED FEED ONLINE' }
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(timer);
          setStageText('EXPEDITION 07 // ONLINE');
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              onComplete();
            }, 900);
          }, 400);
          return 100;
        }

        const currentStage = stages.find((s) => next >= s.at);
        if (currentStage) {
          setStageText(currentStage.text);
        }
        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`preloader-overlay ${isFading ? 'fade-out' : ''}`} aria-live="polite">
      <div className="preloader-content">
        {/* Subtle grid contour rings */}
        <div className="preloader-radar-circle">
          <div className="radar-sweep"></div>
          <div className="radar-cross-h"></div>
          <div className="radar-cross-v"></div>
        </div>

        <div className="preloader-brand">
          <div className="preloader-tagline">INTERNATIONAL DEEP SEA RESEARCH INITIATIVE</div>
          <h1 className="preloader-title">ABYSS</h1>
          <div className="preloader-sub">EXPEDITION 07 // BENTHIC ARCHIVE</div>
        </div>

        <div className="preloader-telemetry">
          <div className="telemetry-row">
            <span className="telemetry-key">COORDINATES:</span>
            <span className="telemetry-val">37° 11′ 42″ N, 24° 53′ 18″ W</span>
          </div>
          <div className="telemetry-row">
            <span className="telemetry-key">BATHYMETRY:</span>
            <span className="telemetry-val">-4,820 METERS BSL</span>
          </div>
          <div className="telemetry-row">
            <span className="telemetry-key">HYDROSTATIC:</span>
            <span className="telemetry-val">483.4 ATMOSPHERES</span>
          </div>
        </div>

        <div className="preloader-bar-wrap">
          <div className="preloader-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="preloader-footer-status">
          <span className="status-text">{stageText}</span>
          <span className="percent-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
