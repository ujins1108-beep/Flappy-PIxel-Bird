import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sliders, Monitor, HelpCircle, Trophy } from 'lucide-react';
import { GameEngine } from '../game/GameEngine.ts';
import { GameState, ScoreData, GameConfig } from '../game/types.ts';
import { BASE_CONFIG } from '../game/constants.ts';
import { sound } from '../game/audio.ts';
import { ReadyOverlay } from './ReadyOverlay.tsx';
import { GameOverOverlay } from './GameOverOverlay.tsx';
import { SettingsModal } from './SettingsModal.tsx';

export const ArcadeCabinet: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Reactive UI State
  const [gameState, setGameState] = useState<GameState>('READY');
  const [scoreData, setScoreData] = useState<ScoreData>({
    current: 0,
    best: 0,
    isNewRecord: false,
  });
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [crtEffect, setCrtEffect] = useState<boolean>(true);
  const [config, setConfig] = useState<GameConfig>(BASE_CONFIG);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      {
        onStateChange: (newState) => setGameState(newState),
        onScoreUpdate: (newScores) => setScoreData(newScores),
      },
      config
    );

    engineRef.current = engine;
    engine.start();

    // Initial score sync
    setScoreData(engine.getScoreData());

    return () => {
      engine.stop();
    };
  }, []);

  // Sync config updates with engine
  const handleConfigUpdate = useCallback((newConfig: GameConfig) => {
    setConfig(newConfig);
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  }, []);

  // Jump Action trigger
  const triggerAction = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.handleAction();
    }
  }, []);

  // Global Keyboard Handler (Space / ArrowUp / W)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if settings modal or input is open
      if (showSettings || showHelp) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault(); // Prevent page scrolling
        triggerAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerAction, showSettings, showHelp]);

  // Audio Mute Toggle
  const toggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Restart Handler
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      engineRef.current.handleAction(); // Instantly start playing
    }
  };

  // Return to Title Handler
  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col items-center justify-between py-2 sm:py-4 px-2 select-none overflow-x-hidden">
      {/* 1. Header Toolbar (Retro Arcade Top Bar) */}
      <header className="w-full max-w-xl sm:max-w-2xl flex items-center justify-between px-3 py-2 bg-slate-900 border-2 border-slate-800 shadow-md rounded-none mb-2 z-20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500 border border-slate-950 animate-ping" />
          <span className="font-pixel text-xs text-amber-300 tracking-wider">
            FLAPPY PIXEL
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Best Score Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-700">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-pixel text-[10px] text-amber-300">
              {scoreData.best}
            </span>
          </div>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setCrtEffect(!crtEffect)}
            title="Toggle CRT Retro Filter"
            className={`p-1.5 border transition-colors cursor-pointer ${
              crtEffect
                ? 'bg-amber-400 text-slate-950 border-amber-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-1.5 border transition-colors cursor-pointer ${
              !isMuted
                ? 'bg-emerald-500 text-slate-950 border-emerald-700'
                : 'bg-slate-800 text-rose-400 border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings / Physics Tuning */}
          <button
            onClick={() => setShowSettings(true)}
            title="Difficulty & Physics Settings"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Help Instructions */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            title="How to Play"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Game Viewport (Arcade Monitor Frame) */}
      <main className="relative flex-1 flex items-center justify-center w-full my-auto">
        <div className="relative border-4 sm:border-8 border-[#302214] bg-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.8),_inset_0_0_20px_rgba(0,0,0,0.7)] p-1 rounded-sm">
          {/* Inner Canvas Container with expanded 3:4 aspect ratio */}
          <div 
            className="relative overflow-hidden cursor-pointer"
            style={{
              width: 'min(520px, 94vw)',
              height: 'min(693px, calc(94vw * (640 / 480)), 82vh)',
            }}
            onClick={triggerAction}
            onTouchStart={(e) => {
              e.preventDefault(); // Prevent double trigger & scrolling
              triggerAction();
            }}
          >
            {/* HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full pixelated block object-contain"
            />

            {/* Retro CRT Scanlines Overlay */}
            {crtEffect && (
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)',
                }}
              />
            )}

            {/* State Overlays */}
            {gameState === 'READY' && (
              <ReadyOverlay
                onStart={triggerAction}
                bestScore={scoreData.best}
              />
            )}

            {gameState === 'GAME_OVER' && (
              <GameOverOverlay
                scoreData={scoreData}
                onRestart={handleRestart}
                onHome={handleHome}
              />
            )}
          </div>
        </div>
      </main>

      {/* 3. Bottom Control Hints Bar */}
      <footer className="w-full max-w-xl sm:max-w-2xl mt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] font-pixel text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-2 gap-2 z-20">
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-amber-300">
            SPACE
          </span>
          <span>OR</span>
          <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-amber-300">
            CLICK / TOUCH
          </span>
          <span>TO FLAP</span>
        </div>

        <div className="text-slate-500 text-[9px]">
          16-BIT RETRO ENGINE
        </div>
      </footer>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-amber-400 w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#000]">
            <h3 className="font-pixel text-sm text-amber-300 mb-4 pb-2 border-b-2 border-slate-700">
              HOW TO PLAY
            </h3>
            <div className="space-y-3 font-pixel text-[10px] text-slate-300 leading-relaxed mb-6">
              <p>
                1. <span className="text-amber-300">FLAP TO FLY</span>: Press <span className="text-white">SPACE</span>, Click, or Touch the screen to give the bird upward lift.
              </p>
              <p>
                2. <span className="text-emerald-300">DODGE PIPES</span>: Guide your pixel bird safely through the gaps between upper and lower green pipes.
              </p>
              <p>
                3. <span className="text-cyan-300">EARN POINTS</span>: Each successfully cleared pipe pair earns you +1 Point.
              </p>
              <p>
                4. <span className="text-rose-400">AVOID CRASHES</span>: Hitting pipes, crashing into the grass floor, or flying above the sky ceiling ends the game!
              </p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full font-pixel text-xs py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-2 border-emerald-700 cursor-pointer"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentConfig={config}
          onUpdateConfig={handleConfigUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
