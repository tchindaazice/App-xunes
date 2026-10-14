import React, { useState, useEffect } from 'react';
import { UserSession, VpnSettings, ConnectionStatus, ConnectionMetrics, VpnLog } from '../types/vpn';
import { StorageService } from '../services/storageService';
import { formatBytes, formatSpeed, getTimeRemaining } from '../services/vlessConfig';
import {
  Power,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  Activity,
  Clock,
  HardDrive,
  Globe,
  Smartphone,
  Copy,
  Check,
  Terminal,
  Settings,
  QrCode,
  LogOut,
  Radio,
  Zap,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

interface VpnDashboardProps {
  session: UserSession;
  settings: VpnSettings;
  connectionStatus: ConnectionStatus;
  metrics: ConnectionMetrics;
  onToggleConnect: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenApk: () => void;
  onLogout: () => void;
  onOpenWebPanel: () => void;
}

export const VpnDashboard: React.FC<VpnDashboardProps> = ({
  session,
  settings,
  connectionStatus,
  metrics,
  onToggleConnect,
  onOpenLogs,
  onOpenSettings,
  onOpenExport,
  onOpenApk,
  onLogout,
  onOpenWebPanel,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [countdown, setCountdown] = useState(() => getTimeRemaining(session.expirationDate));

  // Refresh expiration countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeRemaining(session.expirationDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [session.expirationDate]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(session.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Quota calculation
  const totalBytes = session.totalQuotaBytes || 20 * 1024 * 1024 * 1024;
  const usedBytes = Math.min(totalBytes, session.usedQuotaBytes || 0);
  const remainingBytes = Math.max(0, totalBytes - usedBytes);
  const usedPercent = Math.min(100, Math.round((usedBytes / totalBytes) * 100));
  const remainingPercent = 100 - usedPercent;

  // Format elapsed connection time
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    return `${hrs.toString().padStart(2, '0')}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-[#090e1b] via-[#070b16] to-[#04060c] text-slate-100 select-none">
      {/* 1. TOP HEADER WITH USER PROFILE & WEBPANEL SHORTCUT */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="text-2xl leading-none">{session.countryFlag}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white truncate max-w-[130px] sm:max-w-[180px]">
                  {session.fullName}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-1 rounded border border-cyan-800/40">
                  {session.countryCode}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                {session.commValue}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenWebPanel}
              className="text-[10px] font-cyber font-bold px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 transition-colors flex items-center gap-1"
              title="Console WebPanel"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>WebPanel</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. AUTHENTICATION TOKEN CARD (Obligatoire) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="truncate">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Token d'Accès Sécurisé (Admin)
              </div>
              <div className="font-mono text-xs font-bold text-cyan-300 tracking-wider truncate">
                {session.token}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyToken}
            className="p-1 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 border border-slate-700 transition-colors shrink-0"
          >
            {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedToken ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        {/* 3. DUAL HERO CARDS: QUOTA EN TEMPS RÉEL + EXPIRATION */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* QUOTA CARD */}
          <div className="bg-gradient-to-br from-slate-900/80 to-[#0c1424] border border-cyan-500/20 rounded-2xl p-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-cyber font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" /> Quota Données
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                remainingPercent > 20
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
              }`}>
                {remainingPercent}%
              </span>
            </div>

            <div className="text-sm sm:text-base font-cyber font-extrabold text-white truncate">
              {formatBytes(remainingBytes)}
            </div>
            <div className="text-[10px] text-slate-400 mb-2 truncate">
              restants sur {formatBytes(totalBytes)}
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remainingPercent > 20
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(4, remainingPercent)}%` }}
              />
            </div>
          </div>

          {/* EXPIRATION COUNTDOWN CARD */}
          <div className="bg-gradient-to-br from-slate-900/80 to-[#0c1424] border border-indigo-500/20 rounded-2xl p-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-cyber font-bold tracking-wider text-indigo-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" /> Expiration
              </span>
              <span className="text-[9px] font-mono bg-indigo-950/60 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                {countdown.isExpired ? 'Expiré' : 'Actif'}
              </span>
            </div>

            <div className="text-xs sm:text-sm font-mono font-bold text-white truncate">
              {countdown.formattedText}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-1">
              Fin : {new Date(session.expirationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>

            {/* Small expiry progress indicator */}
            <div className="mt-2 text-[9px] font-mono text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              <span>Validé par WebPanel</span>
            </div>
          </div>
        </div>

        {/* 4. THE PRO CENTRAL POWER BUTTON WITH CYBER GLOW */}
        <div className="flex flex-col items-center justify-center my-2 sm:my-3">
          <div className="relative">
            {/* Outer animated rings */}
            {isConnected && (
              <>
                <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                <div className="absolute -inset-2 rounded-full border border-emerald-500/40 animate-ping duration-1000" />
              </>
            )}

            {isConnecting && (
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-cyan-400 animate-spin" />
            )}

            {/* Power Button */}
            <button
              onClick={onToggleConnect}
              disabled={isConnecting}
              className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl ${
                isConnected
                  ? 'bg-gradient-to-b from-emerald-950 via-[#0a2016] to-[#04120c] border-[3px] border-emerald-400 text-emerald-300 glow-active'
                  : isConnecting
                  ? 'bg-gradient-to-b from-cyan-950 via-[#0a1e2a] to-[#041118] border-[3px] border-cyan-400 text-cyan-300 glow-connecting'
                  : 'bg-gradient-to-b from-slate-900 via-[#101728] to-[#090d18] border-[3px] border-slate-700/80 text-slate-400 hover:border-cyan-500/60 hover:text-cyan-300'
              }`}
            >
              <Power className={`w-12 h-12 sm:w-14 sm:h-14 mb-1 transition-transform ${isConnected ? 'text-emerald-400 scale-105' : isConnecting ? 'text-cyan-400 animate-spin' : ''}`} />
              <span className="font-cyber font-bold text-xs uppercase tracking-wider">
                {isConnected ? 'CONNECTÉ' : isConnecting ? 'TUNNEL...' : 'CONNEXION'}
              </span>
            </button>
          </div>

          {/* Connection status message */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-ping' : isConnecting ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className={isConnected ? 'text-emerald-300 font-cyber' : isConnecting ? 'text-cyan-300' : 'text-slate-400'}>
                {isConnected
                  ? `TUNNEL VLESS SÉCURISÉ [${formatDuration(metrics.durationSeconds)}]`
                  : isConnecting
                  ? 'Négociation TLS 1.3 & VLESS Handshake...'
                  : 'Prêt à établir la connexion VLESS'}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Host: nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio:443
            </div>
          </div>
        </div>

        {/* 5. LIVE METRICS & SPEED BAR (UPLOAD / DOWNLOAD / PING) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-2.5 sm:p-3 mb-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-medium">
              <ArrowDown className="w-3 h-3" />
              <span>Download</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {isConnected ? formatSpeed(metrics.downloadSpeed) : '0.00 Ko/s'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 font-medium">
              <ArrowUp className="w-3 h-3" />
              <span>Upload</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {isConnected ? formatSpeed(metrics.uploadSpeed) : '0.00 Ko/s'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-400 font-medium">
              <Activity className="w-3 h-3" />
              <span>Latence</span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5">
              {isConnected ? `${metrics.ping} ms` : '-- ms'}
            </div>
          </div>
        </div>

        {/* 6. STRICT SECURITY & TRANSPORT BADGE */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-semibold text-slate-200">Sécurité Stricte : </span>
              <span className="text-slate-400">
                {settings.killSwitch ? 'Kill Switch Activé' : 'Standard'} • SNI: {settings.bugHostSni}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950/70 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">
            {settings.transport.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 7. INTEGRATED BOTTOM NAVIGATION TOOLBAR */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-1.5">
        <button
          onClick={onOpenLogs}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-cyber font-medium">Logs</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-cyber font-medium">Paramètres</span>
        </button>

        <button
          onClick={onOpenExport}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-cyber font-medium">QR / VLESS</span>
        </button>

        <button
          onClick={onOpenApk}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-cyber font-medium">APK Android</span>
        </button>
      </div>
    </div>
  );
};
