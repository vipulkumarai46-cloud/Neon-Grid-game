import React, { useState, useEffect, useCallback } from 'react';
import LandingScreen from './components/LandingScreen';
import ScoreBoard from './components/ScoreBoard';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import ConfettiEffect from './components/ConfettiEffect';
import { 
  playMove, 
  playWin, 
  playDraw, 
  toggleSound, 
  isSoundEnabled 
} from './utils/audio';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function App() {
  // Screen and configurations
  const [screen, setScreen] = useState('landing'); // 'landing' | 'game'
  const [gameMode, setGameMode] = useState('ai'); // 'pvp' | 'ai'
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Cyber AI');
  const [playerColors, setPlayerColors] = useState({ X: 'cyan', O: 'pink' });
  const [difficulty, setDifficulty] = useState('unbeatable');

  // Game Board State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [activePlayer, setActivePlayer] = useState('X'); // X always goes first
  const [winningLine, setWinningLine] = useState(null);
  const [winner, setWinner] = useState(null); // 'X' | 'O' | 'draw' | null
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [statusMessage, setStatusMessage] = useState('MATCH START');

  // Scoreboard tracking
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [soundEnabledState, setSoundEnabledState] = useState(true);

  // Initialize sound settings
  useEffect(() => {
    const savedSound = localStorage.getItem('neon-ttt-sound-enabled');
    const enabled = savedSound !== null ? savedSound === 'true' : true;
    toggleSound(enabled);
    setSoundEnabledState(enabled);
  }, []);

  // Fetch or reset scores from localStorage
  const getScoreKey = useCallback((p1, p2, mode) => {
    return `neon-ttt-scores-${mode}-${p1.replace(/\s+/g, '')}-${p2.replace(/\s+/g, '')}`;
  }, []);

  useEffect(() => {
    if (screen === 'game') {
      const scoreKey = getScoreKey(p1Name, p2Name, gameMode);
      const savedScores = localStorage.getItem(scoreKey);
      if (savedScores) {
        try {
          setScores(JSON.parse(savedScores));
        } catch (e) {
          setScores({ p1: 0, p2: 0, draws: 0 });
        }
      } else {
        setScores({ p1: 0, p2: 0, draws: 0 });
      }
    }
  }, [screen, p1Name, p2Name, gameMode, getScoreKey]);

  // Save scores helper
  const saveScores = (updatedScores) => {
    setScores(updatedScores);
    const scoreKey = getScoreKey(p1Name, p2Name, gameMode);
    localStorage.setItem(scoreKey, JSON.stringify(updatedScores));
  };

  const handleStartGame = (settings) => {
    setGameMode(settings.mode);
    setP1Name(settings.p1Name);
    setP2Name(settings.p2Name);
    setPlayerColors(settings.playerColors);
    setDifficulty(settings.difficulty);
    
    // Clear board and setup turn
    setBoard(Array(9).fill(null));
    setActivePlayer('X');
    setWinningLine(null);
    setWinner(null);
    setShowConfetti(false);
    setIsAiTurn(false);
    setStatusMessage(`${settings.p1Name.toUpperCase()}'S TURN (X)`);
    setScreen('game');
  };

  // Evaluation / win checker
  const checkWinState = useCallback((currentBoard) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo, isDraw: false };
      }
    }
    const isDraw = currentBoard.every(cell => cell !== null);
    return { winner: null, line: null, isDraw };
  }, []);

  // Audio helper toggles
  const handleToggleSound = () => {
    const updated = toggleSound();
    setSoundEnabledState(updated);
    localStorage.setItem('neon-ttt-sound-enabled', String(updated));
  };

  const resetMatch = () => {
    setBoard(Array(9).fill(null));
    setActivePlayer('X');
    setWinningLine(null);
    setWinner(null);
    setShowConfetti(false);
    setIsAiTurn(false);
    setStatusMessage(`${p1Name.toUpperCase()}'S TURN (X)`);
  };

  // AI Minimax logic
  const minimax = useCallback((tempBoard, depth, isMaximizing) => {
    const result = checkWinState(tempBoard);
    // AI is O (maximizing), Player 1 is X (minimizing)
    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.isDraw) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'O';
          const score = minimax(tempBoard, depth + 1, false);
          tempBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = 'X';
          const score = minimax(tempBoard, depth + 1, true);
          tempBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWinState]);

  // AI Decision Engine
  const makeAiMove = useCallback(() => {
    const emptyCells = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null);
    if (emptyCells.length === 0 || winner || winningLine) return;

    let targetIndex = null;

    if (difficulty === 'easy') {
      // 100% random
      const randomIdx = Math.floor(Math.random() * emptyCells.length);
      targetIndex = emptyCells[randomIdx];
    } else if (difficulty === 'medium') {
      // 50% smart, 50% random
      if (Math.random() < 0.5) {
        // Run minimax
        let bestScore = -Infinity;
        let bestMoves = [];
        for (let idx of emptyCells) {
          const tempBoard = [...board];
          tempBoard[idx] = 'O';
          const score = minimax(tempBoard, 0, false);
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [idx];
          } else if (score === bestScore) {
            bestMoves.push(idx);
          }
        }
        targetIndex = bestMoves[Math.floor(Math.random() * bestMoves.length)];
      } else {
        const randomIdx = Math.floor(Math.random() * emptyCells.length);
        targetIndex = emptyCells[randomIdx];
      }
    } else {
      // Unbeatable minimax
      let bestScore = -Infinity;
      let bestMoves = [];
      for (let idx of emptyCells) {
        const tempBoard = [...board];
        tempBoard[idx] = 'O';
        const score = minimax(tempBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [idx];
        } else if (score === bestScore) {
          bestMoves.push(idx);
        }
      }
      targetIndex = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    if (targetIndex !== null) {
      const nextBoard = [...board];
      nextBoard[targetIndex] = 'O';
      
      playMove(false);
      setBoard(nextBoard);

      const state = checkWinState(nextBoard);
      if (state.winner) {
        setWinner(state.winner);
        setWinningLine(state.line);
        setStatusMessage(`${p2Name.toUpperCase()} WINS (O)`);
        saveScores({ ...scores, p2: scores.p2 + 1 });
        playWin();
        setShowConfetti(true);
      } else if (state.isDraw) {
        setWinner('draw');
        setStatusMessage("MATCH DRAW");
        saveScores({ ...scores, draws: scores.draws + 1 });
        playDraw();
        setShowConfetti(true);
      } else {
        setActivePlayer('X');
        setStatusMessage(`${p1Name.toUpperCase()}'S TURN (X)`);
      }
    }
    setIsAiTurn(false);
  }, [board, difficulty, winner, winningLine, p1Name, p2Name, scores, minimax, checkWinState]);

  // Monitor turn changes and trigger AI
  useEffect(() => {
    if (screen === 'game' && gameMode === 'ai' && activePlayer === 'O' && !winner && !winningLine) {
      setIsAiTurn(true);
      setStatusMessage(`${p2Name.toUpperCase()} THINKING...`);
      // Add thinking latency for realism
      const timer = setTimeout(() => {
        makeAiMove();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [screen, gameMode, activePlayer, winner, winningLine, makeAiMove, p2Name]);

  // Handle human player clicks
  const handleCellClick = (index) => {
    if (board[index] || winner || winningLine || isAiTurn) return;

    const nextBoard = [...board];
    nextBoard[index] = activePlayer;
    
    // Play move audio
    playMove(activePlayer === 'X');
    setBoard(nextBoard);

    // Check game outcome
    const state = checkWinState(nextBoard);
    if (state.winner) {
      setWinner(state.winner);
      setWinningLine(state.line);
      const isP1 = state.winner === 'X';
      setStatusMessage(`${isP1 ? p1Name.toUpperCase() : p2Name.toUpperCase()} WINS (${state.winner})`);
      
      if (isP1) {
        saveScores({ ...scores, p1: scores.p1 + 1 });
      } else {
        saveScores({ ...scores, p2: scores.p2 + 1 });
      }
      playWin();
      setShowConfetti(true);
    } else if (state.isDraw) {
      setWinner('draw');
      setStatusMessage("MATCH DRAW");
      saveScores({ ...scores, draws: scores.draws + 1 });
      playDraw();
      setShowConfetti(true);
    } else {
      // Toggle turn
      const nextPlayer = activePlayer === 'X' ? 'O' : 'X';
      setActivePlayer(nextPlayer);
      const nextPlayerName = nextPlayer === 'X' ? p1Name : p2Name;
      setStatusMessage(`${nextPlayerName.toUpperCase()}'S TURN (${nextPlayer})`);
    }
  };

  const getStatusTextClass = () => {
    if (winner === 'draw') return 'text-slate-400 font-extrabold tracking-widest';
    if (winner === 'X') {
      const col = playerColors.X;
      return col === 'cyan' ? 'text-cyan-400 text-neon-cyan' : col === 'pink' ? 'text-pink-500 text-neon-pink' : col === 'green' ? 'text-emerald-400 text-neon-green' : col === 'purple' ? 'text-purple-500 text-neon-purple' : 'text-amber-500 text-neon-orange';
    }
    if (winner === 'O') {
      const col = playerColors.O;
      return col === 'cyan' ? 'text-cyan-400 text-neon-cyan' : col === 'pink' ? 'text-pink-500 text-neon-pink' : col === 'green' ? 'text-emerald-400 text-neon-green' : col === 'purple' ? 'text-purple-500 text-neon-purple' : 'text-amber-500 text-neon-orange';
    }
    if (isAiTurn) return 'text-slate-400 animate-pulse font-semibold';
    
    // Default turn tracking styles
    const activeColor = playerColors[activePlayer];
    if (activeColor === 'cyan') return 'text-cyan-400 text-neon-cyan';
    if (activeColor === 'pink') return 'text-pink-500 text-neon-pink';
    if (activeColor === 'green') return 'text-emerald-400 text-neon-green';
    if (activeColor === 'purple') return 'text-purple-500 text-neon-purple';
    return 'text-amber-500 text-neon-orange';
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 overflow-hidden z-10">
      
      {/* Confetti Render Overlays */}
      <ConfettiEffect 
        active={showConfetti} 
        colors={
          winner === 'X' 
            ? [playerColors.X === 'cyan' ? '#00f0ff' : playerColors.X === 'pink' ? '#ff007f' : playerColors.X === 'green' ? '#39ff14' : playerColors.X === 'purple' ? '#bc13fe' : '#ff8c00']
            : winner === 'O'
            ? [playerColors.O === 'cyan' ? '#00f0ff' : playerColors.O === 'pink' ? '#ff007f' : playerColors.O === 'green' ? '#39ff14' : playerColors.O === 'purple' ? '#bc13fe' : '#ff8c00']
            : ['#00f0ff', '#ff007f', '#39ff14', '#bc13fe', '#ff8c00']
        }
      />

      {screen === 'landing' ? (
        <LandingScreen onStartGame={handleStartGame} />
      ) : (
        <div className="w-full flex flex-col items-center max-w-xl mx-auto animate-fade-in">
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-black tracking-widest uppercase text-slate-500">
              NEON GRID
            </h2>
          </div>

          {/* Score Board */}
          <ScoreBoard 
            scores={scores} 
            gameMode={gameMode} 
            p1Name={p1Name} 
            p2Name={p2Name} 
            activePlayer={activePlayer}
            playerColors={playerColors}
            isGameOver={!!winner}
          />

          {/* Match Status Bar */}
          <div className="glass-panel px-6 py-3 rounded-full border border-white/5 mb-6 text-center text-xs md:text-sm font-bold tracking-widest uppercase">
            STATUS: <span className={getStatusTextClass()}>{statusMessage}</span>
          </div>

          {/* Main Board */}
          <GameBoard 
            board={board} 
            onCellClick={handleCellClick} 
            winningLine={winningLine} 
            playerColors={playerColors}
            isAiTurn={isAiTurn}
          />

          {/* Controllers */}
          <GameControls 
            onRestart={resetMatch} 
            onBackToMenu={() => setScreen('landing')} 
            soundEnabled={soundEnabledState}
            onToggleSound={handleToggleSound}
          />

        </div>
      )}

      {/* Futuristic Watermark */}
      <div className="mt-8 text-[10px] md:text-xs text-slate-600 tracking-widest uppercase text-center font-bold pointer-events-none select-none z-10">
        POWERED BY DEEPMIND ANTIGRAVITY // MODEL GEMINI 3 FLASH
      </div>

    </main>
  );
}
