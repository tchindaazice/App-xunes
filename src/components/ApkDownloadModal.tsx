import React, { useState } from 'react';
import { UserSession, VpnSettings } from '../types/vpn';
import { buildVlessUri, buildXrayClientJson } from '../services/vlessConfig';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

import { triggerApkDownload } from '../services/apkBuilder';

interface ApkDownloadModalProps {
  session: UserSession;
  settings: VpnSettings;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  session,
  settings,
  onClose,
}) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);
  const [copiedVless, setCopiedVless] = useState(false);

  const handleDownloadApkPackage = async () => {
    try {
      setDownloadStarted(true);
      const filename = await triggerApkDownload(session, settings);
      setDownloadedFileName(filename);
      setTimeout(() => setDownloadStarted(false), 2000);
    } catch {
      setDownloadStarted(false);
    }
  };


  const handleCopyUri = () => {
    navigator.clipboard.writeText(buildVlessUri(session, settings));
    setCopiedVless(true);
    setTimeout(() => setCopiedVless(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0b101e] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-cyber font-bold text-white">INSTALLATION CLIENT ANDROID (.APK / PWA)</h3>
              <p className="text-[11px] text-slate-400">Package VLESS Pro pour {session.countryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Main APK Download Card */}
          <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-blue-950/40 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-cyber font-bold text-cyan-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                Package Android Standalone
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                v3.2.0 Signed APK
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Téléchargez le paquet d'application contenant votre identifiant UID pré-configuré, les règles strictes de contournement réseau africain et la synchronisation continue avec votre WebPanel Nexus Tunnel.
            </p>

            <button
              onClick={handleDownloadApkPackage}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadStarted ? 'TÉLÉCHARGEMENT DU PACKAGE (31.2 Mo)...' : 'TÉLÉCHARGER LE FICHIER .APK (31.2 Mo)'}
              </span>
            </button>

            {downloadedFileName && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Téléchargement du package officiel lancé (31.2 Mo).</span>
              </div>
            )}
          </div>

          {/* Quick 1-Click Import after installation */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/50 to-blue-950/50 rounded-2xl border border-cyan-500/40 space-y-2.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Une fois installé : Activer dans l'application</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Appuyez sur le bouton ci-dessous pour ouvrir l'application installée et y injecter instantanément votre serveur VLESS.
            </p>
            <button
              onClick={() => {
                const uri = buildVlessUri(session, settings);
                window.location.href = uri;
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-cyber font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>ACTIVER ET CONNECTER EN 1-CLIC (INTENT VLESS)</span>
            </button>
          </div>

          {/* Quick PWA Installation for direct phone usage */}
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Option 2 : Installer directement sur votre écran d'accueil Android</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-400">
              <li>Ouvrez ce lien dans Google Chrome sur votre smartphone Android.</li>
              <li>Appuyez sur le menu <strong className="text-slate-200">⋮ (trois points)</strong> en haut à droite.</li>
              <li>Sélectionnez <strong className="text-cyan-300">« Ajouter à l'écran d'accueil »</strong> ou <strong className="text-cyan-300">« Installer l'application »</strong>.</li>
              <li>L'application s'ouvre comme une vraie application native Android sans barre de navigateur !</li>
            </ol>
          </div>

          {/* Option 3: v2rayNG / Sing-box / Nekobox import */}
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Option 3 : Importer dans v2rayNG / Sing-box</span>
              </span>
              <button
                onClick={handleCopyUri}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedVless ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVless ? 'Copié' : 'Copier VLESS'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Ouvrez v2rayNG sur Android, appuyez sur <strong className="text-slate-200">+</strong> puis <strong className="text-cyan-300">« Importer la configuration depuis le presse-papiers »</strong>.
            </p>
          </div>

          {/* Device & session recap */}
          <div className="p-3 bg-black/60 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>UID: {session.uid.substring(0, 16)}...</span>
            <span className="text-cyan-400">HOST: {session.host.substring(0, 18)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
