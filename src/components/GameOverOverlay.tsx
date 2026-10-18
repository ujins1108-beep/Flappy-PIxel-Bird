import React from 'react';
import { RotateCcw, Home, Award } from 'lucide-react';
import { ScoreData } from '../game/types.ts';

interface GameOverOverlayProps {
  scoreData: ScoreData;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  scoreData,
  onRestart,
  onHome,
}) => {
  const { current, best, isNewRecord } = scoreData;

  // Medal determination
  let medalName: string | null = null;
  let medalColor = 'text-amber-500';
  if (current >= 50) {
    medalName = 'PLATINUM';
    medalColor = 'text-cyan-200';
  } else if (current >= 25) {
    medalName = 'GOLD';
    medalColor = 'text-amber-300';
  } else if (current >= 10) {
    medalName = 'SILVER';
    medalColor = 'text-slate-300';
  } else if (current >= 5) {
    medalName = 'BRONZE';
    medalColor = 'text-amber-600';
  }

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 pointer-events-auto select-none animate-fadeIn">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-pixel text-2xl sm:text-3xl text-rose-500 drop-shadow-[0_4px_0_#2b0c0c] tracking-wider animate-bounce">
          GAME OVER
        </h2>
      </div>

      {/* Retro Arcade Score Box */}
      <div className="w-full max-w-[280px] bg-[#ded895] border-4 border-[#54381e] p-5 shadow-[6px_6px_0px_0px_#2b1807] mb-6">
        {/* Score & Best rows */}
        <div className="flex flex-col gap-4">
          {/* Medal slot + Score */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#b5ac6b]">
            <div className="flex flex-col items-center">
              <span className="font-pixel text-[9px] text-[#54381e] mb-1">MEDAL</span>
              {medalName ? (
                <div className="flex flex-col items-center">
                  <Award className={`w-8 h-8 ${medalColor} drop-shadow-[1px_1px_0_#000]`} />
                  <span className={`font-pixel text-[8px] mt-1 ${medalColor} drop-shadow-sm`}>
                    {medalName}
                  </span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-none border border-dashed border-[#8c7d4e] flex items-center justify-center text-[10px] text-[#8c7d4e] font-pixel">
                  -
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="font-pixel text-[9px] text-[#54381e] mb-1">SCORE</span>
              <span className="font-pixel text-2xl text-[#2b1807]">
                {current}
              </span>
            </div>
          </div>

          {/* Best Record */}
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-[#54381e]">BEST</span>
            <div className="flex items-center gap-2">
              {isNewRecord && (
                <span className="font-pixel text-[8px] bg-rose-600 text-white px-1.5 py-0.5 border border-rose-900 animate-pulse">
                  NEW!
                </span>
              )}
              <span className="font-pixel text-xl text-[#2b1807]">
                {best}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <button
          onClick={onRestart}
          className="w-full font-pixel text-xs py-3 px-4 bg-amber-400 hover:bg-amber-300 active:translate-y-1 text-slate-950 border-4 border-amber-700 shadow-[4px_4px_0px_0px_#422006] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          PLAY AGAIN
        </button>

        <button
          onClick={onHome}
          className="w-full font-pixel text-xs py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:translate-y-1 text-slate-200 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#090d16] transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          MAIN MENU
        </button>
      </div>

      <div className="mt-4 font-pixel text-[9px] text-slate-400">
        OR PRESS <span className="text-amber-300">SPACE</span> TO RESTART
      </div>
    </div>
  );
};
