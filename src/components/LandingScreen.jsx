import React, { useState } from 'react';
import { User, Users, Cpu, Play, Sparkles } from 'lucide-react';
import { playClick, playHover } from '../utils/audio';
import VisitorCounter from './VisitorCounter';

export default function LandingScreen({ onStartGame }) {
  const [mode, setMode] = useState('ai'); // 'pvp' or 'ai'
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Cyber AI');
  const [p1Color, setP1Color] = useState('cyan');
  const [p2Color, setP2Color] = useState('pink');
  const [difficulty, setDifficulty] = useState('unbeatable'); // 'easy', 'medium', 'unbeatable'

  const colorOptions = [
    { name: 'cyan', hex: '#00f0ff', label: 'Cyan' },
    { name: 'pink', hex: '#ff007f', label: 'Pink' },
    { name: 'green', hex: '#39ff14', label: 'Green' },
    { name: 'purple', hex: '#bc13fe', label: 'Purple' },
    { name: 'orange', hex: '#ff8c00', label: 'Orange' },
  ];

  const getColorTextClass = (colorName) => {
    switch (colorName) {
      case 'cyan': return 'text-cyan-400 text-neon-cyan';
      case 'pink': return 'text-pink-500 text-neon-pink';
      case 'green': return 'text-emerald-400 text-neon-green';
      case 'purple': return 'text-purple-500 text-neon-purple';
      case 'orange': return 'text-amber-500 text-neon-orange';
      default: return 'text-cyan-400 text-neon-cyan';
    }
  };

  const getBorderColorClass = (colorName) => {
    switch (colorName) {
      case 'cyan': return 'border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]';
      case 'pink': return 'border-pink-500/50 shadow-[0_0_10px_rgba(255,0,127,0.3)]';
      case 'green': return 'border-emerald-400/50 shadow-[0_0_10px_rgba(57,255,20,0.3)]';
      case 'purple': return 'border-purple-500/50 shadow-[0_0_10px_rgba(188,19,254,0.3)]';
      case 'orange': return 'border-amber-500/50 shadow-[0_0_10px_rgba(255,140,0,0.3)]';
      default: return 'border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]';
    }
  };

  const handleModeChange = (newMode) => {
    playClick();
    setMode(newMode);
    if (newMode === 'ai') {
      setP2Name('Cyber AI');
    } else {
      setP2Name('Player 2');
    }
  };

  const handleStart = () => {
    playClick();
    onStartGame({
      mode,
      p1Name: p1Name.trim() || 'Player 1',
      p2Name: p2Name.trim() || (mode === 'ai' ? 'Cyber AI' : 'Player 2'),
      playerColors: {
        X: p1Color,
        O: p2Color
      },
      difficulty
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative z-10 select-none animate-fade-in">
      
      {/* Title */}
      <div className="text-center mb-8 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
          <Sparkles className="w-20 h-20 text-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase">
          <span className="text-cyan-400 text-neon-cyan">NEON</span>{' '}
          <span className="text-pink-500 text-neon-pink">GRID</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm tracking-widest mt-2 uppercase font-medium">
          Futuristic Tic Tac Toe
        </p>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Select Game Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('ai')}
            onMouseEnter={playHover}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-bold transition-all duration-300 ${
              mode === 'ai'
                ? getBorderColorClass(p1Color) + ' bg-slate-950/60 ' + getColorTextClass(p1Color)
                : 'border-white/5 bg-slate-900/10 text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Cpu className="w-5 h-5" />
            VS AI
          </button>
          <button
            onClick={() => handleModeChange('pvp')}
            onMouseEnter={playHover}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl border font-bold transition-all duration-300 ${
              mode === 'pvp'
                ? getBorderColorClass(p1Color) + ' bg-slate-950/60 ' + getColorTextClass(p1Color)
                : 'border-white/5 bg-slate-900/10 text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
            }`}
          >
            <Users className="w-5 h-5" />
            VS PLAYER
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-5 mb-8">
        
        {/* Player 1 Options */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${getColorTextClass(p1Color)}`}>
              PLAYER X
            </span>
          </div>
          <div>
            <input
              type="text"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-400/50 text-sm font-semibold"
              placeholder="Player 1 Name"
            />
          </div>
          {/* Color selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Color:</span>
            <div className="flex gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col.name}
                  onClick={() => { playClick(); setP1Color(col.name); }}
                  className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${
                    p1Color === col.name 
                      ? 'border-white scale-125' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex, boxShadow: `0 0 8px ${col.hex}` }}
                  title={col.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Player 2 / AI Options */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${getColorTextClass(p2Color)}`}>
              {mode === 'ai' ? 'AI OPPONENT' : 'PLAYER O'}
            </span>
          </div>
          {mode === 'pvp' && (
            <div>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-pink-500/50 text-sm font-semibold"
                placeholder="Player 2 Name"
              />
            </div>
          )}
          {/* Color selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Color:</span>
            <div className="flex gap-2">
              {colorOptions.map((col) => (
                <button
                  key={col.name}
                  onClick={() => { playClick(); setP2Color(col.name); }}
                  className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${
                    p2Color === col.name 
                      ? 'border-white scale-125' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex, boxShadow: `0 0 8px ${col.hex}` }}
                  title={col.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Selection (only shown for vs AI) */}
        {mode === 'ai' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
              AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['easy', 'medium', 'unbeatable'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => { playClick(); setDifficulty(diff); }}
                  onMouseEnter={playHover}
                  className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all duration-200 ${
                    difficulty === diff
                      ? getBorderColorClass(p2Color) + ' bg-slate-950/60 ' + getColorTextClass(p2Color)
                      : 'border-white/5 bg-slate-900/10 text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Visitor Counter */}
      <div className="mb-6">
        <VisitorCounter />
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        onMouseEnter={playHover}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 border font-extrabold tracking-widest text-sm text-slate-950 uppercase transition-all duration-300 hover:scale-[1.02] cursor-pointer hover:shadow-2xl ${
          p1Color === 'cyan' 
            ? 'bg-cyan-400 border-cyan-400 hover:shadow-cyan-400/30' 
            : p1Color === 'pink' 
            ? 'bg-pink-500 border-pink-500 hover:shadow-pink-500/30' 
            : p1Color === 'green' 
            ? 'bg-emerald-400 border-emerald-400 hover:shadow-emerald-400/30' 
            : p1Color === 'purple' 
            ? 'bg-purple-500 border-purple-500 hover:shadow-purple-500/30' 
            : 'bg-amber-500 border-amber-500 hover:shadow-amber-500/30'
        }`}
      >
        <Play className="w-4 h-4 fill-current" />
        START MATCH
      </button>

    </div>
  );
}
