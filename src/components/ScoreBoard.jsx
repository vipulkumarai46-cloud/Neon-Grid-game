import React from 'react';
import { User, Cpu, Award } from 'lucide-react';
import { playHover } from '../utils/audio';

export default function ScoreBoard({ 
  scores, 
  gameMode, 
  p1Name = 'Player 1', 
  p2Name = 'Player 2', 
  activePlayer, 
  playerColors,
  isGameOver
}) {
  
  const getColorClass = (colorName, type) => {
    switch (colorName) {
      case 'cyan':
        return type === 'text' ? 'text-cyan-400 text-neon-cyan' : 'neon-glow-active-cyan border-cyan-400/50';
      case 'pink':
        return type === 'text' ? 'text-pink-500 text-neon-pink' : 'neon-glow-active-pink border-pink-500/50';
      case 'green':
        return type === 'text' ? 'text-emerald-400 text-neon-green' : 'neon-glow-active-green border-emerald-400/50';
      case 'purple':
        return type === 'text' ? 'text-purple-500 text-neon-purple' : 'neon-glow-active-purple border-purple-500/50';
      case 'orange':
        return type === 'text' ? 'text-amber-500 text-neon-orange' : 'neon-glow-active-orange border-amber-500/50';
      default:
        return type === 'text' ? 'text-cyan-400 text-neon-cyan' : 'neon-glow-active-cyan border-cyan-400/50';
    }
  };

  const isP1Turn = activePlayer === 'X' && !isGameOver;
  const isP2Turn = activePlayer === 'O' && !isGameOver;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-lg mx-auto mb-6 z-10 relative">
      
      {/* Player 1 Card */}
      <div 
        onMouseEnter={playHover}
        className={`glass-panel p-3 md:p-4 rounded-2xl flex flex-col items-center justify-between border transition-all duration-300 ${
          isP1Turn 
            ? getColorClass(playerColors.X, 'active') + ' scale-105 bg-slate-900/40' 
            : 'border-white/5 opacity-80'
        }`}
      >
        <div className="flex items-center gap-1.5 md:gap-2 mb-1">
          <User className={`w-4 h-4 md:w-5 h-5 ${getColorClass(playerColors.X, 'text')}`} />
          <span className="text-xs md:text-sm font-semibold tracking-wider text-slate-300 truncate max-w-[80px]">
            {p1Name}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className={`text-2xl md:text-3xl font-black ${getColorClass(playerColors.X, 'text')}`}>X</span>
          <span className="text-xl md:text-2xl font-bold mt-1 text-slate-100">{scores.p1}</span>
        </div>
      </div>

      {/* Draws Card */}
      <div 
        onMouseEnter={playHover}
        className="glass-panel p-3 md:p-4 rounded-2xl flex flex-col items-center justify-between border border-white/5 opacity-85"
      >
        <div className="flex items-center gap-1.5 md:gap-2 mb-1">
          <Award className="w-4 h-4 md:w-5 h-5 text-amber-400" />
          <span className="text-xs md:text-sm font-semibold tracking-wider text-slate-400">
            DRAWS
          </span>
        </div>
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-2xl md:text-3xl font-extrabold text-slate-400">-</span>
          <span className="text-xl md:text-2xl font-bold mt-1 text-slate-200">{scores.draws}</span>
        </div>
      </div>

      {/* Player 2/AI Card */}
      <div 
        onMouseEnter={playHover}
        className={`glass-panel p-3 md:p-4 rounded-2xl flex flex-col items-center justify-between border transition-all duration-300 ${
          isP2Turn 
            ? getColorClass(playerColors.O, 'active') + ' scale-105 bg-slate-900/40' 
            : 'border-white/5 opacity-80'
        }`}
      >
        <div className="flex items-center gap-1.5 md:gap-2 mb-1">
          {gameMode === 'ai' ? (
            <Cpu className={`w-4 h-4 md:w-5 h-5 ${getColorClass(playerColors.O, 'text')}`} />
          ) : (
            <User className={`w-4 h-4 md:w-5 h-5 ${getColorClass(playerColors.O, 'text')}`} />
          )}
          <span className="text-xs md:text-sm font-semibold tracking-wider text-slate-300 truncate max-w-[80px]">
            {p2Name}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className={`text-2xl md:text-3xl font-black ${getColorClass(playerColors.O, 'text')}`}>O</span>
          <span className="text-xl md:text-2xl font-bold mt-1 text-slate-100">{scores.p2}</span>
        </div>
      </div>

    </div>
  );
}
