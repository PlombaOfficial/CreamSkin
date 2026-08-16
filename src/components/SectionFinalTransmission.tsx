import React, { useEffect, useState, useRef } from 'react';
import { Radio, AlertOctagon, RefreshCw } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionFinalTransmission.css';

export const SectionFinalTransmission: React.FC = () => {
  const [step, setStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            startSequence();
          }
        });
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  const startSequence = () => {
    setStep(1); // Title appear
    soundEngine.playTelemetryClick();

    setTimeout(() => {
      setStep(2); // Quote appear
      soundEngine.playTelemetryClick();
    }, 1400);

    setTimeout(() => {
      setStep(3); // Signal Lost
      soundEngine.playSonarPing(220);
    }, 3600);

    setTimeout(() => {
      setStep(4); // Continuing
      soundEngine.playSonarPing(880);
    }, 5400);
  };

  const handleReplay = () => {
    setStep(0);
    setTimeout(() => {
      startSequence();
    }, 200);
  };

  return (
    <section id="final-transmission" className="abyss-transmission-section" ref={sectionRef}>
      <div className="transmission-ambient-grid" />

      <div className="section-container">
        <div className="transmission-dossier-card">
          <div className="transmission-top-bar">
            <div className="transmission-header-tag">
              <Radio size={14} className="transmission-icon" />
              <span>HYDROPHONE TRANSCRIPTION LOG // TAPE 07-B</span>
            </div>

            <button className="transmission-replay-btn" onClick={handleReplay} aria-label="Replay final transmission sequence">
              <RefreshCw size={13} />
              <span>REPLAY TRANSMISSION</span>
            </button>
          </div>

          <div className="transmission-main-stage">
            {/* Step 1: Kicker */}
            <div className={`trans-step trans-kicker ${step >= 1 ? 'visible' : ''}`}>
              <span className="trans-stamp">HYDROPHONE DISPATCH #882</span>
              <h2 className="trans-title">FINAL TRANSMISSION</h2>
            </div>

            {/* Step 2: The chilling quote */}
            <div className={`trans-step trans-quote-block ${step >= 2 ? 'visible' : ''}`}>
              <p className="trans-quote">
                “There is something moving inside the city.”
              </p>
              <span className="trans-speaker">— Submersible A-07 Triton // Audio Transcript 04:19:08 UTC</span>
            </div>

            {/* Step 3: Signal Lost */}
            <div className={`trans-step trans-lost-block ${step >= 3 ? 'visible' : ''}`}>
              <div className="signal-lost-badge">
                <AlertOctagon size={16} />
                <span>SIGNAL LOST // CARRIER FREQUENCY DECAY</span>
              </div>
            </div>

            {/* Step 4: Abyss Expedition Continuing */}
            <div className={`trans-step trans-continuing-block ${step >= 4 ? 'visible' : ''}`}>
              <div className="continuing-divider" />
              <div className="continuing-brand">ABYSS EXPEDITION</div>
              <div className="continuing-status">CONTINUING // AUTONOMOUS MONITORING ACTIVE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
