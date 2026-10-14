import React, { useState, useEffect } from 'react';
import { UserSession, VpnSettings } from '../types/vpn';
import { buildVlessUri, buildClashVlessYaml, buildXrayClientJson, generateQrDataUrl } from '../services/vlessConfig';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  X,
  FileCode,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface VlessExportModalProps {
  session: UserSession;
  settings: VpnSettings;
  onClose: () => void;
  onOpenApkModal: () => void;
}

export const VlessExportModal: React.FC<VlessExportModalProps> = ({
  session,
  settings,
  onClose,
  onOpenApkModal,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedUri, setCopiedUri] = useState(false);
  const [activeTab, setActiveTab] = useState<'URI' | 'CLASH' | 'JSON'>('URI');

  const vlessUri = buildVlessUri(session, settings);
  const clashConfig = buildClashVlessYaml(session, settings);
  const jsonConfig = buildXrayClientJson(session, settings);

  useEffect(() => {
    generateQrDataUrl(vlessUri).then((url) => setQrCodeUrl(url));
  }, [vlessUri]);

  const handleCopyUri = () => {
    navigator.clipboard.writeText(vlessUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-tunnel-${session.countryCode.toLowerCase()}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0a0f1d] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-cyber font-bold text-white">EXPORTATION CONFIGURATION VLESS</h3>
              <p className="text-[10px] text-slate-400">Compatible v2rayNG, Sing-box, Clash & Nekobox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
            {qrCodeUrl ? (
              <div className="relative p-2 bg-white rounded-xl shadow-lg ring-4 ring-cyan-500/20">
                <img src={qrCodeUrl} alt="VLESS QR Code" className="w-48 h-48 sm:w-52 sm:h-52 object-contain" />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-slate-900 rounded-xl">
                <span className="text-xs text-slate-500">Génération du QR Code...</span>
              </div>
            )}
            <span className="mt-2.5 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Scannez directement avec votre téléphone Android
            </span>
          </div>

          {/* Quick copy URI bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Lien VLESS Standard :</span>
              <button
                type="button"
                onClick={handleCopyUri}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUri ? 'Lien copié !' : 'Copier VLESS'}</span>
              </button>
            </div>
            <div className="bg-black/70 p-2 rounded-lg font-mono text-[10px] text-cyan-300 break-all border border-slate-800/80 select-all max-h-20 overflow-y-auto">
              {vlessUri}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadJson}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Télécharger .JSON</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenApkModal();
              }}
              className="py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Installer l'APK / PWA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
