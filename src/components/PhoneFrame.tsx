import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Monitor, ShieldCheck, Radio } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isConnected: boolean;
  activeTabTitle?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isConnected,
  activeTabTitle = 'Nexus Tunnel Pro'
}) => {
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(() => {
    return window.innerWidth >= 768;
  });
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Top Toggle Bar for Preview Mode */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs uppercase tracking-wider font-cyber text-cyan-400 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Client Mobile Android v3.2 (VLESS APK)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setIsPhoneMode(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              isPhoneMode ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Cadre Smartphone
          </button>
          <button
            onClick={() => setIsPhoneMode(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              !isPhoneMode ? 'bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Plein Écran
          </button>
        </div>
      </div>

      {isPhoneMode ? (
        /* Realistic Modern Smartphone Shell */
        <div className="relative w-full max-w-[420px] bg-[#0c1220] rounded-[48px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-slate-700/50 shadow-cyan-950/40">
          {/* Outer edge highlight */}
          <div className="absolute inset-0 rounded-[42px] pointer-events-none border border-slate-700/40" />

          {/* Volume and Power Buttons */}
          <div className="absolute -left-[10px] top-28 w-[4px] h-14 bg-slate-700 rounded-l-md" />
          <div className="absolute -left-[10px] top-48 w-[4px] h-14 bg-slate-700 rounded-l-md" />
          <div className="absolute -right-[10px] top-36 w-[4px] h-18 bg-slate-700 rounded-r-md" />

          {/* Phone Screen Container */}
          <div className="relative bg-[#080d1a] rounded-[38px] overflow-hidden flex flex-col min-h-[780px] max-h-[860px] border border-slate-800/80">
            {/* Android Status Bar */}
            <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-2 text-[11px] text-slate-300 select-none bg-slate-950/70 backdrop-blur-md border-b border-slate-800/40">
              <span className="font-mono font-semibold">{currentTime}</span>

              {/* Punch hole camera */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2 w-4 h-4 rounded-full bg-black border border-slate-700 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-cyan-500/30" />
              </div>

              <div className="flex items-center gap-1.5">
                {isConnected && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/30">
                    <ShieldCheck className="w-2.5 h-2.5" /> VPN
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400">5G</span>
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
                <Battery className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>

            {/* Screen Content Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
              {children}
            </div>

            {/* Android Navigation Pill Bar */}
            <div className="h-4 bg-slate-950/90 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Responsive Card */
        <div className="w-full max-w-xl bg-[#0a0f1d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[700px] flex flex-col">
          <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-cyber font-bold text-slate-200">{activeTabTitle}</span>
            </div>
            {isConnected && (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Tunnel VLESS Actif
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
