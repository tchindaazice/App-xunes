import React, { useState, useEffect, useRef } from 'react';
import { VpnLog } from '../types/vpn';
import { Terminal, Copy, Check, Trash2, Shield, Filter } from 'lucide-react';

interface VpnLogsProps {
  logs: VpnLog[];
  onClearLogs: () => void;
}

export const VpnLogs: React.FC<VpnLogsProps> = ({ logs, onClearLogs }) => {
  const [copied, setCopied] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'info' | 'success' | 'warn' | 'error'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    return log.level === filterLevel;
  });

  const handleCopy = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.category}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'warn':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'error':
        return 'text-rose-400 bg-rose-950/40 border-rose-500/30';
      default:
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 bg-[#060913] text-slate-100 min-h-[500px]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-cyber font-bold tracking-wide text-slate-200">
            JOURNAL DE CONNEXION VLESS EN DIRECT
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
            title="Copier les logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copié' : 'Copier'}</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs transition-colors"
            title="Effacer le journal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto text-[10px] scrollbar-none">
        <Filter className="w-3 h-3 text-slate-500 shrink-0 mr-1" />
        {(['ALL', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-2 py-0.5 rounded-md font-mono uppercase transition-colors ${
              filterLevel === lvl
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {lvl === 'ALL' ? 'Tous' : lvl}
          </button>
        ))}
        <span className="text-slate-500 font-mono ml-auto">
          {filteredLogs.length} ligne{filteredLogs.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Terminal View */}
      <div
        ref={scrollRef}
        className="flex-1 bg-black/80 rounded-xl border border-slate-800/80 p-3 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 shadow-inner"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 text-center py-12 flex flex-col items-center">
            <Terminal className="w-6 h-6 text-slate-700 mb-2" />
            <span>Aucun log disponible pour ce filtre.</span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 group hover:bg-slate-900/50 p-0.5 rounded">
              <span className="text-slate-600 select-none shrink-0 text-[10px]">
                {log.timestamp}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase border shrink-0 ${getLevelColor(
                  log.level
                )}`}
              >
                {log.category}
              </span>
              <span
                className={`break-all ${
                  log.level === 'error'
                    ? 'text-rose-300 font-semibold'
                    : log.level === 'warn'
                    ? 'text-amber-300'
                    : log.level === 'success'
                    ? 'text-emerald-300'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Bottom status note */}
      <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-cyan-400" />
          Protocole VLESS-XTLS sur port 443 (Zero Packet Leakage)
        </span>
        <span className="text-slate-600 font-mono">Xray Core v1.8.16</span>
      </div>
    </div>
  );
};
