import React from 'react';
import { playHover, playClick } from '../utils/audio';

export default function GameBoard({ 
  board, 
  onCellClick, 
  winningLine, 
  playerColors,
  isAiTurn
}) {
  
  const getHexColor = (colorName) => {
    switch (colorName) {
      case 'cyan': return '#00f0ff';
      case 'pink': return '#ff007f';
      case 'green': return '#39ff14';
      case 'purple': return '#bc13fe';
      case 'orange': return '#ff8c00';
      default: return '#00f0ff';
    }
  };

  const getGlowShadowClass = (symbol, colorName) => {
    if (!symbol) return '';
    switch (colorName) {
      case 'cyan': return 'shadow-[0_0_15px_rgba(0,240,255,0.4)] border-cyan-500/20';
      case 'pink': return 'shadow-[0_0_15px_rgba(255,0,127,0.4)] border-pink-500/20';
      case 'green': return 'shadow-[0_0_15px_rgba(57,255,20,0.4)] border-emerald-500/20';
      case 'purple': return 'shadow-[0_0_15px_rgba(188,19,254,0.4)] border-purple-500/20';
      case 'orange': return 'shadow-[0_0_15px_rgba(255,140,0,0.4)] border-amber-500/20';
      default: return '';
    }
  };

  const getWinningLineCoords = () => {
    if (!winningLine) return null;
    const lineStr = winningLine.join(',');
    
    // Row combinations
    if (lineStr === '0,1,2') return { x1: "6%", y1: "16.6%", x2: "94%", y2: "16.6%" };
    if (lineStr === '3,4,5') return { x1: "6%", y1: "50%", x2: "94%", y2: "50%" };
    if (lineStr === '6,7,8') return { x1: "6%", y1: "83.3%", x2: "94%", y2: "83.3%" };
    
    // Column combinations
    if (lineStr === '0,3,6') return { x1: "16.6%", y1: "6%", x2: "16.6%", y2: "94%" };
    if (lineStr === '1,4,7') return { x1: "50%", y1: "6%", x2: "50%", y2: "94%" };
    if (lineStr === '2,5,8') return { x1: "83.3%", y1: "6%", x2: "83.3%", y2: "94%" };
    
    // Diagonal combinations
    if (lineStr === '0,4,8') return { x1: "8%", y1: "8%", x2: "92%", y2: "92%" };
    if (lineStr === '2,4,6') return { x1: "92%", y1: "8%", x2: "8%", y2: "92%" };
    
    return null;
  };

  const coords = getWinningLineCoords();
  const winnerSymbol = winningLine ? board[winningLine[0]] : null;
  const winnerColorName = winnerSymbol ? playerColors[winnerSymbol] : null;
  const winnerHex = winnerColorName ? getHexColor(winnerColorName) : '#00f0ff';

  const handleCellClick = (idx) => {
    if (board[idx] || winningLine || isAiTurn) return;
    playClick();
    onCellClick(idx);
  };

  return (
    <div className="relative w-full max-w-[340px] xs:max-w-[360px] md:max-w-[400px] aspect-square mx-auto glass-panel p-4 md:p-6 rounded-3xl border border-white/5 box-shadow-neon select-none">
      
      {/* Grid cells */}
      <div className="grid grid-cols-3 grid-rows-3 h-full gap-2 relative z-10">
        {board.map((cell, idx) => {
          const colorName = cell ? playerColors[cell] : null;
          const hex = colorName ? getHexColor(colorName) : '';

          return (
            <button
              key={idx}
              disabled={cell !== null || winningLine !== null || isAiTurn}
              onClick={() => handleCellClick(idx)}
              onMouseEnter={() => !cell && !winningLine && !isAiTurn && playHover()}
              className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 border border-white/5 bg-slate-900/20 hover:bg-slate-900/60 ${
                !cell && !winningLine && !isAiTurn 
                  ? 'hover:border-slate-500/20 active:scale-95 cursor-pointer' 
                  : 'cursor-default'
              } ${getGlowShadowClass(cell, colorName)}`}
            >
              {cell === 'X' && (
                <svg className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_6px_rgba(255,255,255,0.1)]" viewBox="0 0 100 100">
                  <path
                    d="M 24 24 L 76 76"
                    stroke={hex}
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="animate-draw-path"
                  />
                  <path
                    d="M 76 24 L 24 76"
                    stroke={hex}
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="animate-draw-path"
                    style={{ animationDelay: '0.12s' }}
                  />
                </svg>
              )}

              {cell === 'O' && (
                <svg className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_6px_rgba(255,255,255,0.1)]" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="26"
                    stroke={hex}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-draw-path"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Layer for animated Winning Line */}
      {winningLine && coords && (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-20 p-4 md:p-6" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <line
            x1={coords.x1}
            y1={coords.y1}
            x2={coords.x2}
            y2={coords.y2}
            stroke={winnerHex}
            strokeWidth="5"
            strokeLinecap="round"
            className="winning-line-path"
            style={{ color: winnerHex }}
          />
        </svg>
      )}

    </div>
  );
}
