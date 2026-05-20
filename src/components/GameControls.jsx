import React from 'react';
import { RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { playClick, playHover } from '../utils/audio';

export default function GameControls({ 
  onRestart, 
  onBackToMenu, 
  soundEnabled, 
  onToggleSound 
}) {
  const handleAction = (callback) => {
    playClick();
    callback();
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-6 z-10 relative">
      
      {/* Sound Toggle Button */}
      <button
        onClick={() => handleAction(onToggleSound)}
        onMouseEnter={playHover}
        title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
        className="glass-panel-interactive p-3 rounded-full text-slate-300 hover:text-cyan-400 transition-all duration-300"
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5 text-red-400/80" />
        )}
      </button>

      {/* Restart Button */}
      <button
        onClick={() => handleAction(onRestart)}
        onMouseEnter={playHover}
        className="glass-panel-interactive px-5 py-3 rounded-xl flex items-center gap-2 text-slate-300 hover:text-emerald-400 hover:box-neon-green hover:border-emerald-400/30 transition-all duration-300 font-medium tracking-wider text-xs md:text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        RESTART
      </button>

      {/* Home / Menu Button */}
      <button
        onClick={() => handleAction(onBackToMenu)}
        onMouseEnter={playHover}
        className="glass-panel-interactive px-5 py-3 rounded-xl flex items-center gap-2 text-slate-300 hover:text-pink-500 hover:box-neon-pink hover:border-pink-500/30 transition-all duration-300 font-medium tracking-wider text-xs md:text-sm"
      >
        <Home className="w-4 h-4" />
        MENU
      </button>

    </div>
  );
}
