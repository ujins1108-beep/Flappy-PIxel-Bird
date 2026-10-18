import React, { useState } from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { GameConfig, DifficultyMode } from '../game/types.ts';
import { BASE_CONFIG, DIFFICULTY_PRESETS } from '../game/constants.ts';

interface SettingsModalProps {
  currentConfig: GameConfig;
  onUpdateConfig: (config: GameConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentConfig,
  onUpdateConfig,
  onClose,
}) => {
  const [config, setConfig] = useState<GameConfig>({ ...currentConfig });
  const [mode, setMode] = useState<DifficultyMode>('NORMAL');

  const handlePreset = (preset: Exclude<DifficultyMode, 'CUSTOM'>) => {
    setMode(preset);
    const newConf = { ...BASE_CONFIG, ...DIFFICULTY_PRESETS[preset] };
    setConfig(newConf);
    onUpdateConfig(newConf);
  };

  const handleParamChange = (key: keyof GameConfig, val: number) => {
    setMode('CUSTOM');
    const newConf = { ...config, [key]: val };
    setConfig(newConf);
    onUpdateConfig(newConf);
  };

  const handleReset = () => {
    handlePreset('NORMAL');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-amber-400 w-full max-w-md p-6 shadow-[8px_8px_0px_0px_#000] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-700 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-pixel text-sm text-amber-300">GAME SETTINGS</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Presets */}
        <div className="mb-6">
          <label className="block font-pixel text-[10px] text-slate-300 mb-2">
            DIFFICULTY PRESET:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['EASY', 'NORMAL', 'HARD'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handlePreset(lvl)}
                className={`font-pixel text-[10px] py-2 px-2 border-2 transition-all cursor-pointer ${
                  mode === lvl
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Physics Tuning Sliders */}
        <div className="space-y-4 mb-6">
          <div className="font-pixel text-[10px] text-emerald-400 pb-1 border-b border-slate-800">
            PHYSICS &amp; GAMEPLAY TUNING
          </div>

          {/* Pipe Gap */}
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-slate-300 mb-1">
              <span>PIPE GAP (PASSAGE)</span>
              <span className="text-amber-300">{config.PIPE_GAP} px</span>
            </div>
            <input
              type="range"
              min="95"
              max="175"
              step="5"
              value={config.PIPE_GAP}
              onChange={(e) => handleParamChange('PIPE_GAP', Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[8px] font-pixel text-slate-500 mt-0.5">
              <span>Tight (95px)</span>
              <span>Wide (175px)</span>
            </div>
          </div>

          {/* Gravity */}
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-slate-300 mb-1">
              <span>GRAVITY</span>
              <span className="text-amber-300">{config.GRAVITY}</span>
            </div>
            <input
              type="range"
              min="650"
              max="1250"
              step="25"
              value={config.GRAVITY}
              onChange={(e) => handleParamChange('GRAVITY', Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Jump Force */}
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-slate-300 mb-1">
              <span>JUMP IMPULSE</span>
              <span className="text-amber-300">{Math.abs(config.JUMP_FORCE)}</span>
            </div>
            <input
              type="range"
              min="200"
              max="380"
              step="10"
              value={Math.abs(config.JUMP_FORCE)}
              onChange={(e) => handleParamChange('JUMP_FORCE', -Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Pipe Scroll Speed */}
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-slate-300 mb-1">
              <span>PIPE SPEED</span>
              <span className="text-amber-300">{config.PIPE_SPEED} px/s</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              step="10"
              value={config.PIPE_SPEED}
              onChange={(e) => handleParamChange('PIPE_SPEED', Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-700 gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 font-pixel text-[9px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET DEFAULT
          </button>

          <button
            onClick={onClose}
            className="font-pixel text-[10px] py-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-2 border-emerald-700 shadow-[2px_2px_0px_0px_#0e380a] cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
