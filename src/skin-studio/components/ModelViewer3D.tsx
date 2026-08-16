import React, { useEffect, useRef, useState } from 'react';
import { MinecraftModel3D } from '../three/MinecraftModel3D';
import { SkinTextureBuffer } from '../engine/SkinTextureBuffer';
import { ModelType, BodyPart } from '../types';

interface ModelViewer3DProps {
  buffer: SkinTextureBuffer;
  modelType: ModelType;
  onModelTypeChange?: (type: ModelType) => void;
  textureVersion: number;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  buffer,
  modelType,
  textureVersion,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const model3DRef = useRef<MinecraftModel3D | null>(null);

  const [animType, setAnimType] = useState<'idle' | 'walk' | 'tpose'>('idle');
  const [showOverlay, setShowOverlay] = useState(true);
  const [visibleParts, setVisibleParts] = useState<Record<BodyPart, boolean>>({
    all: true,
    head: true,
    torso: true,
    rightArm: true,
    leftArm: true,
    rightLeg: true,
    leftLeg: true,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const model = new MinecraftModel3D(container, modelType);
    model.updateTextureFromBuffer(buffer);
    model3DRef.current = model;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;
      model.update(dt);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    const handleResize = () => model.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      model.destroy();
      model3DRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (model3DRef.current) {
      model3DRef.current.updateTextureFromBuffer(buffer);
    }
  }, [buffer, textureVersion]);

  useEffect(() => {
    if (model3DRef.current) {
      model3DRef.current.setModelType(modelType);
    }
  }, [modelType]);

  const handleAnimChange = (type: 'idle' | 'walk' | 'tpose') => {
    setAnimType(type);
    if (model3DRef.current) {
      model3DRef.current.animationType = type;
    }
  };

  const handleTogglePart = (part: BodyPart) => {
    const next = !visibleParts[part];
    const updated = { ...visibleParts, [part]: next };
    setVisibleParts(updated);
    if (model3DRef.current) {
      model3DRef.current.setPartVisibility(part, next);
    }
  };

  const handleToggleOverlay = () => {
    const next = !showOverlay;
    setShowOverlay(next);
    if (model3DRef.current) {
      model3DRef.current.setOverlayVisibility(next);
    }
  };

  const handleResetCamera = () => {
    if (model3DRef.current) {
      model3DRef.current.rotX = 0.2;
      model3DRef.current.rotY = -0.5;
      model3DRef.current.distance = 42;
    }
  };

  return (
    <div className="model3d-container">
      <div className="model3d-toolbar">
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`mc-btn-secondary ${animType === 'idle' ? 'active' : ''}`}
            onClick={() => handleAnimChange('idle')}
            title="Idle Breathing"
          >
            🧘 Idle
          </button>
          <button
            className={`mc-btn-secondary ${animType === 'walk' ? 'active' : ''}`}
            onClick={() => handleAnimChange('walk')}
            title="Walking"
          >
            🚶 Walk
          </button>
          <button
            className={`mc-btn-secondary ${animType === 'tpose' ? 'active' : ''}`}
            onClick={() => handleAnimChange('tpose')}
            title="T-Pose"
          >
            🧍 Pose
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`mc-btn-secondary ${showOverlay ? 'active' : ''}`}
            onClick={handleToggleOverlay}
            title="Layer 2 Overlay"
          >
            🧥 L2: {showOverlay ? 'ON' : 'OFF'}
          </button>
          <button className="tool-btn-sm" onClick={handleResetCamera} title="Reset 3D Camera">
            🔄
          </button>
        </div>
      </div>

      <div ref={containerRef} className="model3d-viewport" />

      <div className="model3d-parts-bar">
        <span style={{ fontSize: '10px', color: '#8d95ab' }}>Parts:</span>
        <button
          className={`part-pill-btn ${visibleParts.head ? 'active' : ''}`}
          onClick={() => handleTogglePart('head')}
        >
          Head
        </button>
        <button
          className={`part-pill-btn ${visibleParts.torso ? 'active' : ''}`}
          onClick={() => handleTogglePart('torso')}
        >
          Torso
        </button>
        <button
          className={`part-pill-btn ${visibleParts.rightArm ? 'active' : ''}`}
          onClick={() => handleTogglePart('rightArm')}
        >
          R. Arm
        </button>
        <button
          className={`part-pill-btn ${visibleParts.leftArm ? 'active' : ''}`}
          onClick={() => handleTogglePart('leftArm')}
        >
          L. Arm
        </button>
        <button
          className={`part-pill-btn ${visibleParts.rightLeg ? 'active' : ''}`}
          onClick={() => handleTogglePart('rightLeg')}
        >
          R. Leg
        </button>
        <button
          className={`part-pill-btn ${visibleParts.leftLeg ? 'active' : ''}`}
          onClick={() => handleTogglePart('leftLeg')}
        >
          L. Leg
        </button>
      </div>
    </div>
  );
};
