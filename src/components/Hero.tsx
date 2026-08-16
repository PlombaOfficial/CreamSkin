import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Radio, Compass, Anchor } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import './Hero.css';

interface HeroProps {
  onEnter: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  // Mouse Parallax Effect
  useEffect(() => {
    setLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 24;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating Underwater Marine Snow / Abyssal Particulate Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate marine snow flakes
    const particleCount = 85;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.55 + 0.15,
      driftAngle: Math.random() * Math.PI * 2
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.driftAngle += 0.01;
        p.x += p.speedX + Math.sin(p.driftAngle) * 0.2;

        if (p.y > height) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        ctx.fillStyle = `rgba(199, 186, 161, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleEnterClick = () => {
    soundEngine.playDepthDescent();
    onEnter();
  };

  return (
    <section id="hero" className={`abyss-hero-section ${loaded ? 'ready' : ''}`} ref={containerRef}>
      {/* Background Image with subtle zoom & parallax */}
      <div
        className="hero-bg-layer"
        style={{
          transform: `scale(1.05) translate3d(${-mouseOffset.x * 0.6}px, ${-mouseOffset.y * 0.6}px, 0)`
        }}
      >
        <img
          src="/images/hero-sunken-city.jpg"
          alt="Ancient submerged city in deep ocean abyss at 4820m depth"
          className="hero-bg-img"
        />
        <div className="hero-gradient-overlay" />
        <div className="hero-vignette-overlay" />
      </div>

      {/* Marine Snow Particle Canvas */}
      <canvas ref={canvasRef} className="hero-particle-canvas" />

      {/* Hero Content Grid */}
      <div className="hero-content-container">
        {/* Top Telemetry Stamp */}
        <div
          className="hero-telemetry-bar"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.2}px, ${mouseOffset.y * 0.2}px, 0)`
          }}
        >
          <div className="hero-meta-item">
            <Compass size={13} className="hero-meta-icon" />
            <span>37° 11′ 42″ N</span>
          </div>
          <div className="hero-meta-divider" />
          <div className="hero-meta-item">
            <Anchor size={13} className="hero-meta-icon" />
            <span>DEPTH — 4,820 M</span>
          </div>
          <div className="hero-meta-divider" />
          <div className="hero-meta-item status-active">
            <Radio size={13} className="hero-meta-icon pulse" />
            <span>STATUS — ACTIVE</span>
          </div>
        </div>

        {/* Center-Asymmetric Headline Block */}
        <div
          className="hero-main-typography"
          style={{
            transform: `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`
          }}
        >
          <div className="hero-kicker-tag">
            <span className="kicker-line" />
            <span>INTERNATIONAL EXPEDITION 07</span>
          </div>

          <h1 className="hero-giant-title">ABYSS</h1>

          <h2 className="hero-sub-title">THE CITY BENEATH THE WORLD</h2>

          <p className="hero-lead-text">
            An international scientific expedition exploring what humanity was never supposed to find
            beneath four thousand eight hundred meters of oceanic darkness.
          </p>

          <div className="hero-action-row">
            <button className="btn-editorial hero-cta-btn" onClick={handleEnterClick}>
              <span>ENTER THE EXPEDITION</span>
              <span className="btn-arrow">→</span>
            </button>

            <div className="hero-classified-note">
              <span className="classified-label">CLEARANCE:</span>
              <span className="classified-val">LEVEL 4 BENTHIC ARCHIVE</span>
            </div>
          </div>
        </div>

        {/* Hero Bottom Telemetry & Scroll Hint */}
        <div className="hero-bottom-bar">
          <div className="hero-coordinates-box">
            <span className="coords-title">HYDROPHONE ARRAY FEED</span>
            <span className="coords-sub">FREQUENCY: 14.2 HZ HARMONIC PULSE</span>
          </div>

          <button className="hero-scroll-descend-btn" onClick={handleEnterClick} aria-label="Scroll to descend">
            <span className="scroll-hint-text">SCROLL TO DESCEND</span>
            <div className="scroll-arrow-circle">
              <ArrowDown size={14} className="bouncing-arrow" />
            </div>
          </button>

          <div className="hero-water-temp">
            <span className="temp-label">WATER TEMPERATURE:</span>
            <span className="temp-val">2.1°C // 483.4 ATM</span>
          </div>
        </div>
      </div>
    </section>
  );
};
