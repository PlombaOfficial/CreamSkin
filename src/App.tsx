import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameUIState } from './game/GameEngine';
import { HUD } from './game/ui/HUD';
import { InventoryModal } from './game/ui/InventoryModal';
import { ChestModal } from './game/ui/ChestModal';
import { FurnaceModal } from './game/ui/FurnaceModal';
import { ChatBox } from './game/ui/ChatBox';
import { TouchControls } from './game/ui/TouchControls';
import { PauseMenu } from './game/ui/PauseMenu';
import { DeathScreen } from './game/ui/DeathScreen';
import { MainMenu } from './game/ui/MainMenu';
import { AuthModal } from './game/ui/AuthModal';
import { audioSynthesizer } from './game/audio/AudioSynthesizer';
import './game/ui/UI.css';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hasStartedGame, setHasStartedGame] = useState(false);
  const [uiState, setUiState] = useState<GameUIState>({
    isInventoryOpen: false,
    isChestOpen: false,
    isFurnaceOpen: false,
    activeChestKey: null,
    activeFurnaceKey: null,
    isPaused: false,
    isDead: false,
    isChatOpen: false,
    isSettingsOpen: false,
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const forceUIRefresh = () => setRefreshKey((k) => k + 1);

  // Initialize Game Engine when game starts
  const startGame = (seed: number = 777123) => {
    audioSynthesizer.init();
    audioSynthesizer.resume();

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new GameEngine(canvas, seed);
    engine.renderer.camera.resize(window.innerWidth, window.innerHeight);

    engine.onUIStateChange = (newUI) => {
      setUiState({ ...newUI });
    };

    engine.onStatsChange = () => {
      // Periodic HUD stats refresh
      forceUIRefresh();
    };

    engineRef.current = engine;
    engine.start();
    setHasStartedGame(true);
  };

  // Keyboard, Mouse, and Window Resize Listeners
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (canvas && engine) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        engine.renderer.camera.resize(window.innerWidth, window.innerHeight);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine || !hasStartedGame) return;

      // Don't capture keys if typing in chat
      if (document.activeElement?.tagName === 'INPUT') return;

      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') engine.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') engine.keys.right = true;
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') engine.keys.jump = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') engine.keys.sprint = true;

      // Hotbar selection 1-9
      if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1;
        engine.player.inventory.selectedSlot = slot;
        forceUIRefresh();
      }

      // Inventory toggle [E]
      if (code === 'KeyE') {
        e.preventDefault();
        if (engine.uiState.isInventoryOpen || engine.uiState.isChestOpen || engine.uiState.isFurnaceOpen) {
          engine.setUIState({ isInventoryOpen: false, isChestOpen: false, isFurnaceOpen: false });
        } else {
          engine.setUIState({ isInventoryOpen: true });
        }
      }

      // Chat toggle [C]
      if (code === 'KeyC') {
        e.preventDefault();
        engine.setUIState({ isChatOpen: !engine.uiState.isChatOpen });
      }

      // Pause toggle [Escape]
      if (code === 'Escape') {
        e.preventDefault();
        if (engine.isAnyModalOpen()) {
          engine.setUIState({
            isInventoryOpen: false,
            isChestOpen: false,
            isFurnaceOpen: false,
            isChatOpen: false,
            isPaused: false,
          });
        } else {
          engine.setUIState({ isPaused: !engine.uiState.isPaused });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') engine.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') engine.keys.right = false;
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') engine.keys.jump = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') engine.keys.sprint = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.mouseScreenX = e.clientX;
      engine.mouseScreenY = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      audioSynthesizer.init();
      audioSynthesizer.resume();

      const engine = engineRef.current;
      if (!engine || !hasStartedGame) return;

      if (e.button === 0) {
        // Left click
        engine.isMouseDownLeft = true;
      } else if (e.button === 2) {
        // Right click
        e.preventDefault();
        engine.handleRightClick(e.clientX, e.clientY);
        forceUIRefresh();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (e.button === 0) {
        engine.isMouseDownLeft = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const engine = engineRef.current;
      if (!engine || !hasStartedGame || engine.isAnyModalOpen()) return;

      if (e.deltaY > 0) {
        engine.player.inventory.selectedSlot = (engine.player.inventory.selectedSlot + 1) % 9;
      } else if (e.deltaY < 0) {
        engine.player.inventory.selectedSlot = (engine.player.inventory.selectedSlot + 8) % 9;
      }
      forceUIRefresh();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [hasStartedGame]);

  const engine = engineRef.current;
  const activeChest = engine && uiState.activeChestKey ? engine.world.chests.get(uiState.activeChestKey) : null;
  const activeFurnace = engine && uiState.activeFurnaceKey ? engine.world.furnaces.get(uiState.activeFurnaceKey) : null;

  return (
    <div className="game-container">
      {/* 2D HTML5 Canvas */}
      <canvas id="game-canvas" ref={canvasRef} className="game-canvas" />

      {/* Main Title Menu */}
      {!hasStartedGame && (
        <MainMenu
          onStartSingleplayer={(seed) => startGame(seed)}
          onOpenAuth={() => setShowAuthModal(true)}
          onInstallPWA={handleInstallPWA}
          canInstallPWA={!!deferredPrompt}
        />
      )}

      {/* HUD Layer */}
      {hasStartedGame && engine && (
        <div key={`hud_refresh_${refreshKey}`}>
          <HUD
            player={engine.player}
            weather={engine.weather}
            onlineCount={engine.remotePlayers.length}
            onOpenInventory={() => engine.setUIState({ isInventoryOpen: true })}
            onOpenChat={() => engine.setUIState({ isChatOpen: true })}
            onOpenPause={() => engine.setUIState({ isPaused: true })}
            onSelectSlot={(s) => {
              engine.player.inventory.selectedSlot = s;
              forceUIRefresh();
            }}
          />

          {/* Mobile Touch Controls */}
          <TouchControls
            engine={engine}
            onOpenInventory={() => engine.setUIState({ isInventoryOpen: true })}
            onOpenChat={() => engine.setUIState({ isChatOpen: true })}
          />
        </div>
      )}

      {/* Modals & Dialogs */}
      {hasStartedGame && engine && uiState.isInventoryOpen && (
        <InventoryModal
          player={engine.player}
          onClose={() => engine.setUIState({ isInventoryOpen: false })}
          onRefresh={forceUIRefresh}
        />
      )}

      {hasStartedGame && engine && uiState.isChestOpen && activeChest && (
        <ChestModal
          player={engine.player}
          chest={activeChest}
          onClose={() => engine.setUIState({ isChestOpen: false, activeChestKey: null })}
          onRefresh={forceUIRefresh}
        />
      )}

      {hasStartedGame && engine && uiState.isFurnaceOpen && activeFurnace && (
        <FurnaceModal
          player={engine.player}
          furnace={activeFurnace}
          onClose={() => engine.setUIState({ isFurnaceOpen: false, activeFurnaceKey: null })}
          onRefresh={forceUIRefresh}
        />
      )}

      {hasStartedGame && engine && uiState.isChatOpen && (
        <ChatBox onClose={() => engine.setUIState({ isChatOpen: false })} />
      )}

      {hasStartedGame && engine && uiState.isPaused && (
        <PauseMenu
          engine={engine}
          onResume={() => engine.setUIState({ isPaused: false })}
        />
      )}

      {hasStartedGame && engine && uiState.isDead && (
        <DeathScreen
          player={engine.player}
          onRespawn={() => {
            engine.player.respawn();
            engine.setUIState({ isDead: false });
            forceUIRefresh();
          }}
        />
      )}

      {/* Account Login / Multiplayer Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            if (!hasStartedGame) startGame(777123);
          }}
        />
      )}
    </div>
  );
};
