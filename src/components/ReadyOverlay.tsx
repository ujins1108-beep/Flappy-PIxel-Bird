import React from 'react';
import { Play } from 'lucide-react';

interface ReadyOverlayProps {
  onStart: () => void;
  bestScore: number;
}

export const ReadyOverlay: React.FC<ReadyOverlayProps> = ({ onStart, bestScore }) => {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-between p-6 pointer-events-auto select-none"
      onClick={onStart}
    >
      {/* Top Section: Title & Subtitle */}
      <div className="flex flex-col items-center mt-10 text-center animate-pulse">
        <h1 className="font-pixel text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_4px_0_#201004] tracking-wider leading-relaxed">
          FLAPPY
          <br />
          <span className="text-white drop-shadow-[0_4px_0_#201004]">PIXEL BIRD</span>
        </h1>
        <p className="font-arcade text-xs text-emerald-300 mt-2 tracking-widest drop-shadow-[0_2px_0_#000]">
          RETRO ARCADE EDITION
        </p>
      </div>

      {/* Center Section: Animated Visual Prompt */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="bg-slate-900/80 border-4 border-amber-400 p-4 rounded-none shadow-[4px_4px_0px_0px_#000000] text-center max-w-[240px]">
          <div className="font-pixel text-xs text-amber-200 mb-2 leading-relaxed">
            TAP OR SPACE
          </div>
          <div className="font-pixel text-[10px] text-slate-300 leading-normal">
            TO FLAP WINGS &amp; FLY THROUGH PIPES
          </div>
        </div>
      </div>

      {/* Bottom Section: Start CTA & High Score */}
      <div className="flex flex-col items-center gap-3 mb-16 w-full max-w-[260px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          className="w-full font-pixel text-sm py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:translate-y-1 text-slate-950 border-4 border-emerald-800 shadow-[4px_4px_0px_0px_#10350d] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          START GAME
        </button>

        {bestScore > 0 && (
          <div className="font-pixel text-[10px] text-slate-200 bg-slate-900/70 px-3 py-1.5 border border-slate-700 shadow-sm">
            BEST RECORD: <span className="text-amber-400 font-bold">{bestScore}</span>
          </div>
        )}
      </div>
    </div>
  );
};
