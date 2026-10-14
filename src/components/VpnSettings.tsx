import React, { useState } from 'react';
import { VpnSettings, UserSession } from '../types/vpn';
import { StorageService } from '../services/storageService';
import {
  ShieldAlert,
  Globe2,
  Cpu,
  Layers,
  Save,
  Check,
  RotateCcw,
  Smartphone,
  Network,
  Lock,
  Zap,
  Info
} from 'lucide-react';

interface VpnSettingsProps {
  session: UserSession;
  settings: VpnSettings;
  onUpdateSettings: (newSettings: VpnSettings) => void;
}

export const VpnSettingsComponent: React.FC<VpnSettingsProps> = ({
  session,
  settings,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState<VpnSettings>(settings);
  const [saved, setSaved] = useState(false);

  const SNI_PRESETS = [
    { label: 'Host Par Défaut (Nexus Host)', value: session.host },
    { label: 'WhatsApp Bypass (SNI)', value: 'whatsapp.net' },
    { label: 'Cloudflare CDN Fast', value: 'cdn.cloudflare.net' },
    { label: 'Facebook Free (Afrique)', value: 'm.facebook.com' },
    { label: 'Google Services', value: 'm.youtube.com' },
  ];

  const DNS_PRESETS = [
    '1.1.1.1 (Cloudflare Ultra Fast)',
    '8.8.8.8 (Google Public DNS)',
    '9.9.9.9 (Quad9 Malveillance Bloquée)',
    '94.140.14.14 (AdGuard Anti-Pubs)',
  ];

  const APPS_LIST = [
    { id: 'whatsapp', name: 'WhatsApp Messenger', icon: '💬' },
    { id: 'telegram', name: 'Telegram Pro', icon: '✈️' },
    { id: 'youtube', name: 'YouTube & Streaming', icon: '▶️' },
    { id: 'chrome', name: 'Google Chrome Browser', icon: '🌐' },
    { id: 'facebook', name: 'Facebook & Lite', icon: '👥' },
    { id: 'tiktok', name: 'TikTok Video', icon: '🎵' },
  ];

  const handleToggleApp = (appName: string) => {
    const exists = form.selectedApps.includes(appName);
    const updated = exists
      ? form.selectedApps.filter((a) => a !== appName)
      : [...form.selectedApps, appName];
    setForm({ ...form, selectedApps: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(form);
    onUpdateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const def = StorageService.getSettings();
    setForm(def);
  };

  return (
    <form onSubmit={handleSave} className="flex-1 flex flex-col p-4 sm:p-5 bg-[#060912] text-slate-100 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-cyber font-bold tracking-wide text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" />
            PARAMÈTRES PRO & SÉCURITÉ STRICTE
          </h2>
          <p className="text-[11px] text-slate-400">Optimisations réseau, SNI Bug Host et cryptage</p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Défaut</span>
        </button>
      </div>

      {/* 1. KILL SWITCH */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Kill Switch Strict (Anti-Fuite IP)</div>
              <div className="text-[10px] text-slate-400">Bloque immédiatement tout trafic si le tunnel coupe</div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.killSwitch}
              onChange={(e) => setForm({ ...form, killSwitch: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>
      </div>

      {/* 2. BUG HOST / SNI SPOOFING */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>Bug Host / SNI Spoofing (Afrique)</span>
          </div>
          <span className="text-[9px] uppercase font-mono bg-cyan-950/60 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">
            Contournement DPI
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Injectez un nom d'hôte SNI autorisé par votre opérateur (Orange, MTN, Moov, Airtel) pour contourner le filtrage réseau.
        </p>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SNI_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setForm({ ...form, bugHostSni: preset.value })}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors border ${
                form.bugHostSni === preset.value
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="pt-1">
          <input
            type="text"
            value={form.bugHostSni}
            onChange={(e) => setForm({ ...form, bugHostSni: e.target.value })}
            placeholder="Nom de domaine SNI (ex: m.facebook.com)"
            className="w-full bg-slate-950 font-mono text-xs border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* 3. PROTOCOLE & TRANSPORT */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Couche de Transport & Path VLESS</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['ws', 'grpc', 'httpupgrade'] as const).map((trans) => (
            <button
              key={trans}
              type="button"
              onClick={() => setForm({ ...form, transport: trans })}
              className={`py-2 px-2 rounded-lg border text-xs font-mono uppercase text-center transition-all ${
                form.transport === trans
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {trans}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[10px] text-slate-400 mb-1">Chemin WebSocket (Path)</label>
          <input
            type="text"
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            className="w-full bg-slate-950 font-mono text-xs border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* 4. SERVEURS DNS SÉCURISÉS */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Network className="w-4 h-4 text-teal-400" />
          <span>Résolution DNS Chiffrée (DoH / DoT)</span>
        </div>

        <select
          value={form.customDns}
          onChange={(e) => setForm({ ...form, customDns: e.target.value })}
          className="w-full bg-slate-950 text-xs border border-slate-700/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
        >
          {DNS_PRESETS.map((dns, idx) => (
            <option key={idx} value={dns}>
              {dns}
            </option>
          ))}
        </select>
      </div>

      {/* 5. SPLIT TUNNELING */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Split Tunneling (Routage par Application)</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.splitTunneling}
              onChange={(e) => setForm({ ...form, splitTunneling: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {form.splitTunneling && (
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] text-slate-400">Applications routées à travers Nexus Tunnel :</div>
            <div className="grid grid-cols-2 gap-2">
              {APPS_LIST.map((app) => {
                const isSelected = form.selectedApps.includes(app.name);
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleToggleApp(app.name)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all text-xs ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span className="text-base">{app.icon}</span>
                    <span className="text-[11px] truncate">{app.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-2 sticky bottom-0 bg-[#060912]/90 backdrop-blur-md pb-1">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>PARAMÈTRES APPLIQUÉS !</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>ENREGISTRER LES CONFIGURATIONS PRO</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
