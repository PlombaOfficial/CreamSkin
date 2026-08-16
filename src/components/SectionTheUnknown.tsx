import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import './SectionTheUnknown.css';

export const SectionTheUnknown: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flashlightPos, setFlashlightPos] = useState({ x: 0.5, y: 0.5 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the section we are
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Flashlight interaction on mouse move or touch
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFlashlightPos({ x, y });
    setIsInteracting(true);
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
  };

  // Canvas Spotlight Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Current interpolated light position
    let curX = width * 0.5;
    let curY = height * 0.5;

    let frame = 0;
    const render = () => {
      frame++;

      // Target light position
      const targetX = isInteracting ? flashlightPos.x * width : (0.5 + Math.sin(frame * 0.01) * 0.25) * width;
      const targetY = isInteracting ? flashlightPos.y * height : (0.5 + Math.cos(frame * 0.008) * 0.18) * height;

      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Base darkness opacity decreases as user scrolls down (from pitch black 0.98 down to 0.72)
      const baseDarkness = Math.max(0.96 - scrollProgress * 0.35, 0.5);

      // Fill darkness
      ctx.fillStyle = `rgba(2, 4, 7, ${baseDarkness})`;
      ctx.fillRect(0, 0, width, height);

      // Cut out Spotlight beam
      ctx.globalCompositeOperation = 'destination-out';

      const lightRadius = Math.min(width, height) * (0.35 + scrollProgress * 0.2);
      const gradient = ctx.createRadialGradient(curX, curY, 10, curX, curY, lightRadius);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.85)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(curX, curY, lightRadius, 0, Math.PI * 2);
      ctx.fill();

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      // Draw subtle beam dust particles in light cone
      ctx.fillStyle = 'rgba(199, 186, 161, 0.4)';
      for (let i = 0; i < 20; i++) {
        const px = curX + (Math.sin(frame * 0.02 + i) * lightRadius * 0.45);
        const py = curY + (Math.cos(frame * 0.015 + i * 2) * lightRadius * 0.45);
        ctx.beginPath();
        ctx.arc(px, py, (i % 3) + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [flashlightPos, scrollProgress, isInteracting]);

  return (
    <section
      id="the-unknown"
      className="abyss-unknown-section"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Background Image of the colossal abyssal megastructure */}
      <div className="unknown-bg-container">
        <img
          src="/images/unknown-megastructure.jpg"
          alt="Gargantuan unknown ancient megastructure submerged in abyssal darkness at 5000m"
          className="unknown-megastructure-img"
          style={{
            transform: `scale(${1.02 + scrollProgress * 0.06})`
          }}
        />
      </div>

      {/* Submersible Spotlight Canvas */}
      <canvas ref={canvasRef} className="unknown-spotlight-canvas" />

      {/* Minimalist Atmospheric Content Overlay */}
      <div className="unknown-content-layer">
        <div className="unknown-header-kicker">
          <span className="unknown-number">07 — THE UNKNOWN</span>
          <div className="unknown-status-tag">
            <span className="un-pulse" />
            <span>DEPTH — 4,913 M TO 6,500 M+</span>
          </div>
        </div>

        <div className="unknown-center-statement">
          <h2 className="unknown-giant-stat">
            WE HAVE EXPLORED ONLY <span className="stat-highlight">12%</span>.
          </h2>

          <p className="unknown-sub-stat">
            The remaining 88% remains inaccessible.
          </p>

          <p className="unknown-narrative">
            Beyond the mapped avenues of Sector 01 lies a subterranean fault plunging into hadal depths.
            Multi-beam sonar arrays indicate non-natural architectural geometries extending deeper than any
            vessel has ever ventured.
          </p>

          <div className="unknown-flashlight-hint">
            <Lightbulb size={13} className="hint-icon" />
            <span>MOVE CURSOR TO DIRECT SUBMERSIBLE SEARCHLIGHT CONE</span>
          </div>
        </div>

        <div className="unknown-bottom-telemetry">
          <div className="ub-col">
            <span className="ub-k">ACOUSTIC ABSORPTION:</span>
            <span className="ub-v">99.8% IN TRENCH CORE</span>
          </div>
          <div className="ub-col">
            <span className="ub-k">HADAL ANOMALY 7:</span>
            <span className="ub-v">ACTIVE VIBRATION</span>
          </div>
        </div>
      </div>
    </section>
  );
};
