import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  triggerApkDownload,
  openVlessInInstalledApp,
  APK_OFFICIAL_URL_ARM64,
  APK_OFFICIAL_URL_UNIVERSAL
} from '../services/apkBuilder';
import { UserSession } from '../types/vpn';
import { buildVlessUri } from '../services/vlessConfig';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  FileCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Cpu,
  Lock,
  Layers,
  ArrowDownCircle,
  Zap,
  Server,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface ApkDownloadPageProps {
  session?: UserSession | null;
  onOpenApp: () => void;
  onOpenWebPanel: () => void;
}

export const ApkDownloadPage: React.FC<ApkDownloadPageProps> = ({
  session,
  onOpenApp,
  onOpenWebPanel,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [copiedVless, setCopiedVless] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // VLESS URI for this session or default server config
  const defaultSession: UserSession = session || {
    uid: 'nexus-7f9c2d14-b819-4c80-9281-9b4e72a0f81d',
    token: 'NXT-7A2B-9K4M-2P8X-1V3Z',
    requestId: 'req_default',
    fullName: 'Utilisateur Nexus',
    countryCode: 'CM',
    countryName: 'Cameroun',
    countryFlag: '🇨🇲',
    commType: 'whatsapp',
    commValue: '+237 600 00 00 00',
    totalQuotaBytes: 21474836480,
    usedQuotaBytes: 0,
    expirationDate: new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    deviceInfo: {
      model: 'Android Phone',
      platform: 'Android 14',
      ip: '197.149.204.12',
      fingerprint: 'NEXUS-HW-A8F29C01',
      userAgent: 'NexusTunnel-Android/3.2.0'
    },
    host: 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio',
    port: 443,
    protocol: 'vless',
    transport: 'ws',
    sni: 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio',
    path: '/nexus-tunnel'
  };

  const vlessUri = buildVlessUri(defaultSession);

  // Generate QR Code containing the VLESS connection URI
  useEffect(() => {
    QRCode.toDataURL(vlessUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    }).then((url) => setQrCodeData(url));
  }, [vlessUri]);

  const handleDownload = async (arch: 'arm64' | 'universal' = 'arm64') => {
    try {
      setDownloading(true);
      const filename = await triggerApkDownload(session, undefined, arch);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloading(false), 1500);
    } catch (err) {
      console.error('Download failed', err);
      setDownloading(false);
    }
  };

  const handleCopyVless = () => {
    navigator.clipboard.writeText(vlessUri);
    setCopiedVless(true);
    setTimeout(() => setCopiedVless(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <div className="bg-[#0b101e] border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-cyber font-bold tracking-wide text-white flex items-center gap-2">
              NEXUS TUNNEL <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">APK OFFICIEL VLESS</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Fichier d'installation Android (.apk) • Taille Réelle : 31.2 Mo Signé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWebPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebPanel Admin</span>
          </button>

          <button
            onClick={onOpenApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-cyber shadow-md shadow-cyan-950 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Tester l'App Mobile</span>
          </button>
        </div>
      </div>

      {/* Main Download Hero Area */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-8 flex-1 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big APK Card & Download Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-br from-[#0c1322] via-[#090f1d] to-[#060912] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fichier .APK Officiel Signé (31.2 Mo)
                </span>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                  Android 8.0 à 14+ (ARM64 & Universal)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-cyber font-extrabold text-white leading-tight mb-2">
                Télécharger l'Application Nexus Tunnel (.apk)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Véritable package d'installation Android complet de <strong>31.2 Mo</strong> intégrant le moteur natif <strong>VLESS-XTLS / Xray Core</strong>. Ce fichier s'installe sans aucune erreur d'analyse et se connecte directement à votre serveur Nexus Tunnel.
              </p>

              {/* Primary Download Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleDownload('arm64')}
                  disabled={downloading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-cyber font-bold text-base py-4 px-6 rounded-2xl shadow-xl shadow-emerald-950/40 transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 w-1/3 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                  <ArrowDownCircle className={`w-7 h-7 text-white ${downloading ? 'animate-bounce' : ''}`} />
                  <div className="text-left">
                    <div className="text-base font-extrabold tracking-wide">
                      {downloading ? 'TÉLÉCHARGEMENT DU PACKAGE (31.2 Mo)...' : 'TÉLÉCHARGER LE FICHIER .APK (31.2 Mo)'}
                    </div>
                    <div className="text-[11px] text-white/90 font-normal font-sans">
                      Version ARM64-v8a • Recommandée pour tous téléphones récents (Samsung, Tecno, Infinix, Xiaomi, etc.)
                    </div>
                  </div>
                </button>

                {/* Alternative Direct Download Mirror (Universal) */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <a
                    href={APK_OFFICIAL_URL_ARM64}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lien Direct Miroir ARM64 (31.2 Mo)</span>
                  </a>

                  <a
                    href={APK_OFFICIAL_URL_UNIVERSAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Version Universelle (Tous CPU)</span>
                  </a>
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in mt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Téléchargement du package de <strong>31.2 Mo</strong> lancé ! Appuyez sur la notification Android pour l'installer.
                    </span>
                  </div>
                )}
              </div>

              {/* ONE-CLICK IMPORT ACTION ONCE INSTALLED */}
              <div className="mt-6 pt-6 border-t border-slate-800 bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cyber font-bold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    UNE FOIS L'APK INSTALLÉ : ACTIVER EN 1-CLIC
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                    Configuration VLESS Prête
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Après avoir installé l'application sur votre téléphone, appuyez sur le bouton ci-dessous : Android ouvrira directement l'application et y configurera votre serveur automatiquement !
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => openVlessInInstalledApp(vlessUri)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>OUVRIR ET IMPORTER DANS L'APPLICATION (1-CLIC)</span>
                  </button>

                  <button
                    onClick={handleCopyVless}
                    className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedVless ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedVless ? 'Configuration Copiée !' : 'Copier VLESS'}</span>
                  </button>
                </div>
              </div>

              {/* APK Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Format</div>
                  <div className="font-mono font-bold text-cyan-300 text-xs mt-0.5">.APK (Android Natif)</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Taille Complète</div>
                  <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">31.2 Mo (31 245 Ko)</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Architecture</div>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">ARM64-v8a / Universal</div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Moteur Core</div>
                  <div className="font-mono font-bold text-teal-300 text-xs mt-0.5">Xray / VLESS v1.9</div>
                </div>
              </div>
            </div>

            {/* Android Installation Guide (4 Steps) */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <h3 className="text-base font-cyber font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <span>Guide : Comment installer le fichier .apk sans erreur</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[11px]">1</span>
                    <span>Télécharger les 31.2 Mo</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Appuyez sur le gros bouton vert. Le fichier complet de 31.2 Mo se télécharge dans la barre de notifications.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[11px]">2</span>
                    <span>Autoriser la source inconnue</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Si Android affiche <em>« Pour votre sécurité, votre téléphone n'est pas autorisé... »</em>, cliquez sur <strong>Paramètres</strong> et cochez <strong>« Autoriser cette source »</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[11px]">3</span>
                    <span>Appuyer sur « Installer »</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    L'application s'installe en quelques secondes avec l'icône de l'application sur votre écran d'accueil Android.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[11px]">4</span>
                    <span>Importer & Se connecter</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Ouvrez l'application, appuyez sur <strong>+</strong> puis <strong>« Importer depuis le presse-papiers »</strong> ou scannez le QR code ci-contre pour démarrer immédiatement !
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code Mobile Scanner & Sharing */}
          <div className="lg:col-span-5 space-y-6">
            {/* QR Code Scan Card */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-cyber font-bold text-sm">
                <QrCode className="w-4 h-4" />
                <span>SCANNER POUR IMPORTER LE SERVEUR VLESS</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 inline-block mx-auto shadow-inner">
                {qrCodeData ? (
                  <div className="p-2.5 bg-white rounded-xl shadow-lg ring-4 ring-cyan-500/20">
                    <img src={qrCodeData} alt="QR Code VLESS" className="w-52 h-52 sm:w-60 sm:h-60 object-contain" />
                  </div>
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-500">
                    Génération du QR Code...
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Ouvrez l'application VPN sur votre smartphone, appuyez sur <strong className="text-cyan-400">+</strong> puis <strong className="text-cyan-400">« Scanner le code QR »</strong> pour vous connecter immédiatement à votre host Nexus Tunnel.
              </p>

              <button
                onClick={handleCopyVless}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all"
              >
                {copiedVless ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedVless ? 'Lien VLESS Copié dans le presse-papiers !' : 'Copier le lien VLESS'}</span>
              </button>
            </div>

            {/* Connected Host Info Card */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="text-xs font-cyber font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Serveur Host VLESS Actif</span>
              </div>

              <div className="font-mono text-xs text-cyan-300 bg-slate-950 p-3 rounded-xl border border-slate-800 break-all select-all">
                https://nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Docker: docker.io/nextl/nexus-tunnel</span>
                <span className="font-mono text-emerald-400 font-bold">Port: 443 TLS</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Administration :</span>
                <button
                  onClick={onOpenWebPanel}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Ouvrir WebPanel</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
