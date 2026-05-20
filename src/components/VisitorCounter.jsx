import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // 1. Determine local development vs monolithic production routing
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    
    // 2. Session tracking checks to prevent spam increments on local refresh/hot-reloads
    const hasVisited = sessionStorage.getItem('neon-grid-visited');
    
    const incrementCount = async () => {
      try {
        await fetch(`${baseUrl}/api/visitors/increment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        sessionStorage.setItem('neon-grid-visited', 'true');
      } catch (err) {
        console.warn('Backend offline: Visitor increment failed.');
      }
    };

    if (!hasVisited) {
      incrementCount();
    }

    // 3. Establish real-time EventSource connection
    const eventSource = new EventSource(`${baseUrl}/api/visitors/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setVisitorCount(data.count);
        setIsSynced(true);
      } catch (err) {
        console.error('Failed to parse streaming visitor count:', err);
      }
    };

    eventSource.onerror = () => {
      setIsSynced(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-300 hover:border-cyan-500/20">
      
      {/* Left side details */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
          <Users className="w-5 h-5 text-cyan-400 text-neon-cyan animate-pulse" />
        </div>
        <div className="text-left">
          <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Total Players Visited
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isSynced ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isSynced ? 'Live Synchronized' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Right side live counter display */}
      <div className="text-right">
        {visitorCount !== null ? (
          <span className="text-2xl md:text-3xl font-black text-cyan-400 text-neon-cyan tracking-wider tabular-nums animate-fade-in">
            {visitorCount.toLocaleString()}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            CONNECTING...
          </span>
        )}
      </div>

    </div>
  );
}
