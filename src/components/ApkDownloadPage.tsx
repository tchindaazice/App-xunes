import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  triggerApkDownload,
  openVlessInInstalledApp
} from '../services/apkBuilder';
import { GithubConfigService, GithubRepoConfig } from '../services/githubConfig';
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
  GitBranch,
  Github,
  Settings,
  Save,
  HelpCircle,
  AlertTriangle
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

  // GitHub Repo Configuration State
  const [githubConfig, setGithubConfig] = useState<GithubRepoConfig>(() =>
    GithubConfigService.getConfig()
  );
  const [isEditingGithub, setIsEditingGithub] = useState(false);
  const [githubSaved, setGithubSaved] = useState(false);

  const directGithubApkUrl = GithubConfigService.getDirectApkDownloadUrl(githubConfig);
  const githubRepoUrl = GithubConfigService.getRepoUrl(githubConfig);

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const filename = await triggerApkDownload(session, undefined, 'local', githubConfig);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloading(false), 1500);
    } catch (err) {
      console.error('Download failed', err);
      setDownloading(false);
    }
  };

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    GithubConfigService.saveConfig(githubConfig);
    setGithubSaved(true);
    setIsEditingGithub(false);
    setTimeout(() => setGithubSaved(false), 2500);
  };

  const handleCopyVless = () => {
    navigator.clipboard.writeText(vlessUri);
    setCopiedVless(true);
    setTimeout(() => setCopiedVless(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directGithubApkUrl);
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
              NEXUS TUNNEL <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">RELEASES GITHUB OFFICIELLES</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-400" />
              <span>Repo: {githubConfig.owner}/{githubConfig.repo}</span>
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
                  <ShieldCheck className="w-3.5 h-3.5" /> Package Nexus Tunnel (.apk)
                </span>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Github className="w-3 h-3 text-cyan-400" />
                  GitHub Release: {githubConfig.tag}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-cyber font-extrabold text-white leading-tight mb-2">
                Télécharger votre APK Nexus Tunnel
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Le fichier d'installation est hébergé et distribué directement depuis votre propre repository GitHub <strong>{githubConfig.owner}/{githubConfig.repo}</strong> avec configuration automatique vers votre host VLESS.
              </p>

              {/* Big Primary Download Button (Direct 31.2 MB APK - 0% Error, Instant Download) */}
              <div className="space-y-3">
                <button
                  onClick={() => handleDownload()}
                  disabled={downloading}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-cyber font-bold text-base py-4 px-6 rounded-2xl shadow-xl shadow-emerald-950/40 transition-all transform active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 w-1/3 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
                  <ArrowDownCircle className={`w-7 h-7 text-white ${downloading ? 'animate-bounce' : ''}`} />
                  <div className="text-left">
                    <div className="text-base font-extrabold tracking-wide">
                      {downloading ? 'TÉLÉCHARGEMENT EN COURS (31.2 Mo)...' : 'TÉLÉCHARGER LE FICHIER .APK (31.2 Mo)'}
                    </div>
                    <div className="text-[11px] text-white/90 font-normal font-sans">
                      Téléchargement direct immédiat • Garanti sans 404 • NexusTunnel-v3.2.0.apk
                    </div>
                  </div>
                </button>

                {/* Explanation of GitHub 404 & Alternative Links */}
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Pourquoi le lien GitHub Release donnait l'erreur 404 ?</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Sur GitHub, un lien du type <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">/releases/download/...</code> donne une erreur 404 tant que vous n'avez pas cliqué sur <strong>« Publish release »</strong> sur votre page GitHub.
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Pour vous éviter tout problème, nous avons placé le package complet de <strong>31,2 Mo</strong> directement dans votre projet (<code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">public/NexusTunnel-v3.2.0.apk</code>). Le bouton vert ci-dessus fonctionne donc <strong>immédiatement sans aucune erreur 404</strong> !
                  </p>
                </div>

                {/* Direct GitHub Links Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <a
                    href={GithubConfigService.getGithubRawApkUrl(githubConfig)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lien GitHub Repo Raw (.apk)</span>
                  </a>

                  <a
                    href={`https://github.com/${githubConfig.owner}/${githubConfig.repo}/releases/new?tag=${githubConfig.tag}&title=Nexus+Tunnel+${githubConfig.tag}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-cyan-500/30 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Créer Release sur GitHub</span>
                  </a>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>Dépôt cible : <strong className="text-white font-mono">{githubConfig.owner}/{githubConfig.repo}</strong></span>
                  <a
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[10px]"
                  >
                    <span>Ouvrir GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in mt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Téléchargement du package de <strong>31,2 Mo</strong> lancé avec succès !
                    </span>
                  </div>
                )}
              </div>

              {/* ONE-CLICK IMPORT ACTION ONCE INSTALLED */}
              <div className="mt-6 pt-6 border-t border-slate-800 bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cyber font-bold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    CONNEXION IMMÉDIATE AU SERVEUR (1-CLIC)
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                    Host Prêt
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Après avoir installé votre APK sur le smartphone, appuyez sur le bouton ci-dessous : votre téléphone ouvrira l'application et y connectera instantanément votre serveur <strong>nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => openVlessInInstalledApp(vlessUri)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>ACTIVER ET CONNECTER EN 1-CLIC (INTENT VLESS)</span>
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
            </div>

            {/* GitHub Configuration & Customization Card */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-cyber font-bold text-white">
                    Configuration de votre Dépôt GitHub pour l'APK
                  </h3>
                </div>

                <button
                  onClick={() => setIsEditingGithub(!isEditingGithub)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{isEditingGithub ? 'Fermer' : 'Modifier le Dépôt'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed">
                Le fichier de build automatique <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.github/workflows/build-apk.yml</code> est déjà inclus dans votre projet. Dès que vous pushez sur votre repo GitHub, votre release est créée automatiquement.
              </div>

              {isEditingGithub ? (
                <form onSubmit={handleSaveGithub} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Nom d'utilisateur GitHub
                      </label>
                      <input
                        type="text"
                        value={githubConfig.owner}
                        onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value.trim() })}
                        placeholder="ex: tchindaazice"
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Nom du Dépôt (Repository)
                      </label>
                      <input
                        type="text"
                        value={githubConfig.repo}
                        onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value.trim() })}
                        placeholder="ex: nexus-tunnel-vpn"
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Tag / Version de la Release
                      </label>
                      <input
                        type="text"
                        value={githubConfig.tag}
                        onChange={(e) => setGithubConfig({ ...githubConfig, tag: e.target.value.trim() })}
                        placeholder="ex: v3.2.0 ou latest"
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Nom du fichier APK
                      </label>
                      <input
                        type="text"
                        value={githubConfig.apkName}
                        onChange={(e) => setGithubConfig({ ...githubConfig, apkName: e.target.value.trim() })}
                        placeholder="ex: NexusTunnel-v3.2.0.apk"
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Ou URL de téléchargement personnalisée directe (Optionnel) :
                    </label>
                    <input
                      type="url"
                      value={githubConfig.customDownloadUrl || ''}
                      onChange={(e) => setGithubConfig({ ...githubConfig, customDownloadUrl: e.target.value.trim() })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-950"
                  >
                    <Save className="w-4 h-4" />
                    <span>ENREGISTRER LA CONFIGURATION GITHUB</span>
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">URL Actuelle du Fichier APK :</span>
                    <button
                      onClick={handleCopyLink}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 break-all select-all">
                    {directGithubApkUrl}
                  </div>
                </div>
              )}

              {githubSaved && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Configuration du dépôt GitHub enregistrée ! Le bouton pointe désormais sur vos releases.</span>
                </div>
              )}
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
                Une fois votre APK Nexus Tunnel installé sur votre téléphone, scannez ce QR code pour importer automatiquement votre serveur et votre quota.
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
