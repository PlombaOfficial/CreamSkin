import React, { useEffect, useRef, useState } from 'react';
import { Radio, Zap, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './SectionLiveSignal.css';

export const SectionLiveSignal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signalTime, setSignalTime] = useState('04:17:32 UTC');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState<'WEAK' | 'FLUCTUATING' | 'DETECTED'>('WEAK');

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setSignalTime(`${h}:${m}:${s} UTC`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 160);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 160;
    };

    window.addEventListener('resize', handleResize);

    let offset = 0;
    let glitchTimer = 0;

    const render = () => {
      offset += 0.04;
      glitchTimer++;

      ctx.fillStyle = 'rgba(4, 8, 14, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Center baseline
      const centerY = height / 2;

      // Draw faint grid
      ctx.strokeStyle = 'rgba(60, 159, 180, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw Primary 14.2 Hz Acoustic Waveform
      const isGlitching = glitchTimer % 180 > 165;
      ctx.strokeStyle = isGlitching ? '#e57373' : '#c7baa1';
      ctx.lineWidth = isGlitching ? 2 : 1.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const freq1 = Math.sin(x * 0.035 + offset * 2.5);
        const freq2 = Math.sin(x * 0.08 - offset * 1.8) * 0.4;
        const subHarmonic = Math.sin(x * 0.008 + offset) * 0.8;
        const noise = (Math.random() - 0.5) * (isGlitching ? 22 : 4);

        const y = centerY + (freq1 + freq2 + subHarmonic) * 28 + noise;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Secondary Ghost Wave
      ctx.strokeStyle = 'rgba(60, 159, 180, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const freqGhost = Math.cos(x * 0.02 + offset * 1.2) * 14;
        const y = centerY + freqGhost;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleInterceptAudio = () => {
    soundEngine.playSonarPing(440);
    setIsDecoding(true);
    setSignalStrength('DETECTED');

    setTimeout(() => {
      setDecodedMessage('HYDROPHONE 12 INTERCEPT: NON-RANDOM HARMONIC REPETITION AT 4,913M // ORIGIN: UNKNOWN SECTOR');
      setIsDecoding(false);
    }, 1200);
  };

  return (
    <section id="signal" className="abyss-signal-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="signal-header-wrap">
          <div className="section-number">06 — LIVE SIGNAL</div>
          <h2 className="signal-headline">SIGNAL // {signalTime}</h2>
          <p className="signal-lead">
            Continuous acoustic hydrophone telemetry streamed from the benthic monitoring node at 4,913m depth.
          </p>
        </div>

        {/* Live Signal Control Console */}
        <div className="signal-console-frame">
          {/* Top Status Header */}
          <div className="console-top-bar">
            <div className="console-live-badge">
              <span className="live-dot-pulse" />
              <span>LIVE HYDROPHONE STREAM // NODE B-07</span>
            </div>

            <div className="console-status-pill">
              <Radio size={12} className="signal-flicker" />
              <span>SIGNAL: {signalStrength} (INTERMITTENT)</span>
            </div>
          </div>

          {/* Telemetry Metric Columns */}
          <div className="signal-metrics-grid">
            <div className="sig-metric-card">
              <span className="sig-label">DEPTH</span>
              <span className="sig-value">4,913 M</span>
              <span className="sig-sub">BENTHIC TRENCH NODE</span>
            </div>

            <div className="sig-metric-card">
              <span className="sig-label">WATER TEMP</span>
              <span className="sig-value">2.1°C</span>
              <span className="sig-sub">ISOTHERMAL BENTHIC</span>
            </div>

            <div className="sig-metric-card">
              <span className="sig-label">VISIBILITY</span>
              <span className="sig-value">17 M</span>
              <span className="sig-sub">OPTICAL LIGHT LIMIT</span>
            </div>

            <div className="sig-metric-card">
              <span className="sig-label">PRESSURE</span>
              <span className="sig-value">487 ATM</span>
              <span className="sig-sub">7,157 PSI HYDROSTATIC</span>
            </div>
          </div>

          {/* Oscilloscope Canvas Viewport */}
          <div className="oscilloscope-container">
            <canvas ref={canvasRef} className="oscilloscope-canvas" />
            <div className="osci-corner-stamp">
              <span>BAND: 14.2 HZ // CH-01</span>
            </div>
          </div>

          {/* Interactive Decryption Tool */}
          <div className="signal-action-footer">
            <button
              className="btn-editorial intercept-btn"
              onClick={handleInterceptAudio}
              disabled={isDecoding}
            >
              <Zap size={14} />
              <span>{isDecoding ? 'SYNCHRONIZING TRANSDUCERS...' : 'INTERCEPT & DECODE HYDROPHONE PACKET'}</span>
            </button>

            {decodedMessage && (
              <div className="decoded-message-box">
                <ShieldAlert size={14} className="decode-alert-icon" />
                <span className="decode-text">{decodedMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
