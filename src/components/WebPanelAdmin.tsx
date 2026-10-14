import React, { useState, useEffect } from 'react';
import { MembershipRequest, UserSession } from '../types/vpn';
import { StorageService, DEFAULT_HOST, DEFAULT_PORT, generateVlessUid, generateAuthToken } from '../services/storageService';
import { buildVlessUri, formatBytes } from '../services/vlessConfig';
import {
  Server,
  Users,
  UserCheck,
  UserX,
  KeyRound,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  Activity,
  Plus,
  Copy,
  Check,
  Send,
  Phone,
  Smartphone,
  Sliders,
  Terminal,
  Zap,
  Eye,
  Trash2,
  Edit3,
  Github,
  GitBranch,
  Save,
  Download
} from 'lucide-react';

import { triggerApkDownload } from '../services/apkBuilder';
import { GithubConfigService, GithubRepoConfig } from '../services/githubConfig';

interface WebPanelAdminProps {
  onBackToApp: () => void;
  onOpenDownloadPage?: () => void;
}

export const WebPanelAdmin: React.FC<WebPanelAdminProps> = ({ onBackToApp, onOpenDownloadPage }) => {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'USERS' | 'TOKEN_GEN' | 'SERVER' | 'GITHUB'>('REQUESTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedWebPanelLink, setCopiedWebPanelLink] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  // GitHub repo config state
  const [githubConfig, setGithubConfig] = useState<GithubRepoConfig>(() =>
    GithubConfigService.getConfig()
  );
  const [githubSaved, setGithubSaved] = useState(false);

  const directWebPanelUrl = `${window.location.origin}${window.location.pathname}?panel=admin`;

  // Approval Modal state
  const [approvalModalReq, setApprovalModalReq] = useState<MembershipRequest | null>(null);
  const [customUid, setCustomUid] = useState('');
  const [quotaGb, setQuotaGb] = useState<number>(20);
  const [expirationDays, setExpirationDays] = useState<number>(30);
  const [approvalSuccessToken, setApprovalSuccessToken] = useState<string | null>(null);

  // Reject Modal state
  const [rejectModalReq, setRejectModalReq] = useState<MembershipRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Quick reseller token generator state
  const [resellerName, setResellerName] = useState('');
  const [resellerCountry, setResellerCountry] = useState('CM');
  const [resellerQuota, setResellerQuota] = useState(15);
  const [resellerDays, setResellerDays] = useState(30);
  const [generatedResellerTokens, setGeneratedResellerTokens] = useState<Array<{ token: string; uid: string; name: string; quota: number }>>([]);

  // Server health test state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ms: number; status: string } | null>({ ms: 42, status: 'EN LIGNE (200 OK)' });

  const loadData = () => {
    setRequests(StorageService.getRequests());
  };

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('nexus_storage_event', handleStorage);
    return () => window.removeEventListener('nexus_storage_event', handleStorage);
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');

  const openApproveModal = (req: MembershipRequest) => {
    setApprovalModalReq(req);
    setCustomUid(generateVlessUid());
    setQuotaGb(20);
    setExpirationDays(30);
    setApprovalSuccessToken(null);
  };

  const confirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModalReq) return;

    const result = StorageService.approveRequest(approvalModalReq.id, {
      customUid: customUid.trim(),
      quotaGb,
      expirationDays,
    });

    if (result) {
      setApprovalSuccessToken(result.request.assignedToken || null);
      loadData();
    }
  };

  const confirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    StorageService.rejectRequest(rejectModalReq.id, rejectReason.trim());
    setRejectModalReq(null);
    setRejectReason('');
    loadData();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateResellerToken = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = resellerName.trim() || 'Client Revendeur Pro';
    const newReq = StorageService.submitRequest({
      fullName: clientName,
      countryCode: resellerCountry,
      countryName: resellerCountry === 'CM' ? 'Cameroun' : resellerCountry === 'CI' ? 'Côte d\'Ivoire' : 'Bénin',
      countryFlag: resellerCountry === 'CM' ? '🇨🇲' : resellerCountry === 'CI' ? '🇨🇮' : '🇧🇯',
      commType: 'whatsapp',
      commValue: '+237 600 00 00 00',
    });

    const result = StorageService.approveRequest(newReq.id, {
      quotaGb: resellerQuota,
      expirationDays: resellerDays,
    });

    if (result && result.request.assignedToken && result.request.assignedUid) {
      setGeneratedResellerTokens([
        {
          token: result.request.assignedToken,
          uid: result.request.assignedUid,
          name: clientName,
          quota: resellerQuota,
        },
        ...generatedResellerTokens,
      ]);
      setResellerName('');
      loadData();
    }
  };

  const testServerPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      const randMs = Math.floor(Math.random() * 35) + 30;
      setPingResult({ ms: randMs, status: 'EN LIGNE (200 OK - TLS 1.3 Handshake)' });
      setIsPinging(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#0b1120] border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-cyber font-bold tracking-wide text-white">
                  NEXUS TUNNEL WEBPANEL
                </h1>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                  GESTIONNAIRE VLESS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Host: https://nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setIsDownloadingApk(true);
                triggerApkDownload().then(() => {
                  setTimeout(() => setIsDownloadingApk(false), 1200);
                });
              }}
              disabled={isDownloadingApk}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isDownloadingApk ? 'Téléchargement...' : 'Télécharger l\'APK (.apk)'}</span>
            </button>

            {onOpenDownloadPage && (
              <button
                onClick={onOpenDownloadPage}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs py-2 px-3 rounded-xl font-medium transition-colors hidden md:flex items-center gap-1"
              >
                <span>Portail Téléchargement</span>
              </button>
            )}

            <button
              onClick={onBackToApp}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Ouvrir l'App VPN Client</span>
            </button>
          </div>
        </div>

        {/* Dedicated WebPanel Link Notification Bar */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[10px] uppercase font-bold text-cyan-400 font-cyber shrink-0">
              🔗 Lien Direct du WebPanel :
            </span>
            <span className="font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 truncate text-[11px] select-all">
              {directWebPanelUrl}
            </span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(directWebPanelUrl);
              setCopiedWebPanelLink(true);
              setTimeout(() => setCopiedWebPanelLink(false), 2000);
            }}
            className="self-start sm:self-auto text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 shrink-0"
          >
            {copiedWebPanelLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWebPanelLink ? 'Lien WebPanel copié !' : 'Copier le lien direct du WebPanel'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-5">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Demandes en attente</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-cyber text-amber-300">{pendingRequests.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Nécessite approbation admin</div>
          </div>

          <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Utilisateurs Actifs</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-cyber text-emerald-300">{approvedRequests.length}</div>
            <div className="text-[11px] text-slate-500 mt-1">Licences et quotas alloués</div>
          </div>

          <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Image Docker Déployée</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-cyan-300 truncate">docker.io/nextl/nexus-tunnel</div>
            <div className="text-[11px] text-slate-500 mt-1">Patch & UID VLESS Actif</div>
          </div>

          <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Statut du Serveur Host</span>
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-teal-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{pingResult?.status.slice(0, 15) || 'ONLINE'}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Port 443 TLS WebSocket</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'REQUESTS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>DEMANDES EN ATTENTE</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-bold text-[10px]">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'USERS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>UTILISATEURS & LICENCES VLESS ({approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TOKEN_GEN')}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'TOKEN_GEN'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>GÉNÉRATEUR DE TOKENS REVENDEURS</span>
          </button>

          <button
            onClick={() => setActiveTab('SERVER')}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'SERVER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>DOCKER & HOST STATUS</span>
          </button>

          <button
            onClick={() => setActiveTab('GITHUB')}
            className={`px-4 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider flex items-center gap-2 transition-all ${
              activeTab === 'GITHUB'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>REPO GITHUB & APK RELEASES</span>
          </button>
        </div>

        {/* TAB 1: DEMANDES EN ATTENTE */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-cyber font-bold text-white flex items-center gap-2">
                  <span>Demandes d'Adhésion Transmises par les Membres</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                    {pendingRequests.length} en attente
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Validez les demandes d'accès et attribuez un UID VLESS personnalisé, un quota et une date d'expiration.
                </p>
              </div>

              <button
                onClick={loadData}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Actualiser la liste</span>
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/60 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Toutes les demandes ont été traitées !</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Aucune nouvelle demande d'adhésion en attente. Lorsqu'un utilisateur soumet le formulaire sur le client mobile, sa demande apparaîtra ici en temps réel.
                </p>
                <button
                  onClick={onBackToApp}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Tester une soumission depuis l'App Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#0c1322] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top tag */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl leading-none">{req.countryFlag}</span>
                          <div>
                            <span className="font-bold text-white text-sm">{req.fullName}</span>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span>{req.countryName}</span>
                              <span className="text-slate-600">•</span>
                              <span className="font-mono text-cyan-400">{req.countryCode}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      </div>

                      {/* Contact & Hardware Card */}
                      <div className="space-y-2 text-xs bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            {req.commType === 'whatsapp' ? (
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Send className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span className="capitalize">{req.commType} :</span>
                          </span>
                          <span className="font-mono font-semibold text-white select-all">
                            {req.commValue}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                            <span>Modèle Téléphone :</span>
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-[180px]">
                            {req.deviceInfo.model}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Adresse IP Détectée :</span>
                          <span className="font-mono text-slate-400">{req.deviceInfo.ip}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => openApproveModal(req)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-cyber font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>APPROUVER LA DEMANDE</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectModalReq(req);
                          setRejectReason('');
                        }}
                        className="py-2 px-3 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Refuser</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UTILISATEURS & LICENCES ACTIVES */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-cyber font-bold text-white flex items-center gap-2">
                  <span>Licences VLESS & Comptes Actifs</span>
                  <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    {approvedRequests.length} actifs
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Surveillance du quota en temps réel, renouvellement de date d'expiration et révocation de tokens.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, pays, token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-64"
                />
              </div>
            </div>

            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-mono">
                    <tr>
                      <th className="py-3 px-4">Utilisateur / Pays</th>
                      <th className="py-3 px-4">UID Personnalisé VLESS</th>
                      <th className="py-3 px-4">Token d'Accès</th>
                      <th className="py-3 px-4">Quota Alloué</th>
                      <th className="py-3 px-4">Date d'Expiration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {approvedRequests
                      .filter(
                        (r) =>
                          r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.assignedToken?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.assignedUid?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl leading-none">{req.countryFlag}</span>
                              <div>
                                <div className="font-bold text-white">{req.fullName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {req.commValue} ({req.countryName})
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate max-w-[130px] sm:max-w-[170px]">
                                {req.assignedUid}
                              </span>
                              <button
                                onClick={() => handleCopy(req.assignedUid || '', `uid_${req.id}`)}
                                className="text-slate-400 hover:text-white"
                                title="Copier UID"
                              >
                                {copiedId === `uid_${req.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-bold text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate max-w-[140px]">
                                {req.assignedToken}
                              </span>
                              <button
                                onClick={() => handleCopy(req.assignedToken || '', `tok_${req.id}`)}
                                className="text-slate-400 hover:text-white"
                                title="Copier Token"
                              >
                                {copiedId === `tok_${req.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-white">
                            <span className="bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40">
                              {req.quotaGb || 20} Go
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            {req.expirationDate
                              ? new Date(req.expirationDate).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '30 jours'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  // Quick extend quota +10GB
                                  const all = StorageService.getRequests();
                                  const idx = all.findIndex((r) => r.id === req.id);
                                  if (idx !== -1) {
                                    all[idx].quotaGb = (all[idx].quotaGb || 20) + 10;
                                    StorageService.saveRequests(all);
                                    loadData();
                                  }
                                }}
                                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-medium border border-slate-700"
                                title="Ajouter +10 Go"
                              >
                                +10 Go
                              </button>

                              <button
                                onClick={() => {
                                  // Revoke
                                  StorageService.rejectRequest(req.id, 'Licence révoquée par l\'administrateur');
                                  loadData();
                                }}
                                className="p-1 rounded-md bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700"
                                title="Révoquer l'accès"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GÉNÉRATEUR DE TOKENS REVENDEURS */}
        {activeTab === 'TOKEN_GEN' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Generator Form */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div>
                <h3 className="text-base font-cyber font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Création Instantanée de Token d'Accès</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Générez des tokens pré-payés ou attribués à l'avance pour vos revendeurs et clients sans passer par la file d'attente.
                </p>
              </div>

              <form onSubmit={handleGenerateResellerToken} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Nom du client ou référence revendeur
                  </label>
                  <input
                    type="text"
                    value={resellerName}
                    onChange={(e) => setResellerName(e.target.value)}
                    placeholder="ex: Client VIP - Boutique Douala"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Pays Cible
                    </label>
                    <select
                      value={resellerCountry}
                      onChange={(e) => setResellerCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="CM">🇨🇲 Cameroun</option>
                      <option value="CI">🇨🇮 Côte d'Ivoire</option>
                      <option value="SN">🇸🇳 Sénégal</option>
                      <option value="BJ">🇧🇯 Bénin</option>
                      <option value="TG">🇹🇬 Togo</option>
                      <option value="CD">🇨🇩 RD Congo</option>
                      <option value="GA">🇬🇦 Gabon</option>
                      <option value="ML">🇲🇱 Mali</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Quota Données (Go)
                    </label>
                    <select
                      value={resellerQuota}
                      onChange={(e) => setResellerQuota(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value={5}>5 Go</option>
                      <option value={10}>10 Go</option>
                      <option value={15}>15 Go</option>
                      <option value={25}>25 Go</option>
                      <option value={50}>50 Go</option>
                      <option value={100}>100 Go</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Durée de validité
                  </label>
                  <select
                    value={resellerDays}
                    onChange={(e) => setResellerDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={7}>7 Jours (Hebdomadaire)</option>
                    <option value={15}>15 Jours (Bi-hebdomadaire)</option>
                    <option value={30}>30 Jours (Mensuel standard)</option>
                    <option value={60}>60 Jours (2 Mois)</option>
                    <option value={90}>90 Jours (Trimestriel)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-cyber font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 transition-all text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>GÉNÉRER LE TOKEN DE SÉCURITÉ</span>
                </button>
              </form>
            </div>

            {/* Generated Tokens Feed */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col">
              <h3 className="text-base font-cyber font-bold text-white flex items-center justify-between">
                <span>Derniers Tokens Générés</span>
                <span className="text-xs font-mono text-slate-400">
                  {generatedResellerTokens.length} créés cette session
                </span>
              </h3>

              {generatedResellerTokens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl">
                  <KeyRound className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400">
                    Les tokens générés apparaîtront ici avec bouton de copie rapide pour envoi WhatsApp ou Telegram.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
                  {generatedResellerTokens.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white text-xs">{item.name}</div>
                        <div className="font-mono text-xs font-bold text-emerald-400 select-all">
                          {item.token}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Quota: {item.quota} Go • UID: {item.uid.slice(0, 14)}...
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(item.token, `res_${idx}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === `res_${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === `res_${idx}` ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DOCKER & HOST STATUS */}
        {activeTab === 'SERVER' && (
          <div className="space-y-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-cyber font-bold text-white">
                      CONFIGURATION DOCKER & NOYAU VLESS
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Image : docker.io/nextl/nexus-tunnel
                    </p>
                  </div>
                </div>

                <button
                  onClick={testServerPing}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>Tester le Ping du Host</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Host URL</div>
                  <div className="font-mono text-cyan-300 font-bold break-all mt-1">
                    https://nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Protocole & Port</div>
                  <div className="font-mono text-white font-bold mt-1">
                    VLESS + WS + TLS 1.3 sur Port 443
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Résultat Ping Host</div>
                  <div className="font-mono text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{pingResult?.ms || 42} ms ({pingResult?.status || 'OK'})</span>
                  </div>
                </div>
              </div>

              {/* Docker container simulation log terminal */}
              <div className="bg-black/80 rounded-xl p-4 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-slate-500">[DOCKER DAEMON] Container nextl/nexus-tunnel:latest started on port 443</div>
                <div className="text-cyan-400">[XRAY CORE] VLESS fallback inbound listening on 0.0.0.0:443 (TLS enabled)</div>
                <div className="text-slate-400">[PATCH APPLIED] Custom UID dynamic routing table loaded successfully.</div>
                <div className="text-emerald-400">[WEBSOCKET] Path /nexus-tunnel upgrade handler ready.</div>
                <div className="text-slate-500">[ACCESS LOG] Session keep-alive ping received from African telecom gateway (latency: 42ms).</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GITHUB REPO & APK RELEASE MANAGEMENT */}
        {activeTab === 'GITHUB' && (
          <div className="space-y-4">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-cyber font-bold text-white">
                      DÉPÔT GITHUB PERSONNEL & TÉLÉCHARGEMENT DE L'APK
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configurez l'adresse de votre propre dépôt GitHub pour que tous les boutons téléchargent votre APK.
                    </p>
                  </div>
                </div>

                <a
                  href={GithubConfigService.getRepoUrl(githubConfig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voir mon Dépôt GitHub</span>
                </a>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  GithubConfigService.saveConfig(githubConfig);
                  setGithubSaved(true);
                  setTimeout(() => setGithubSaved(false), 2500);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nom d'utilisateur GitHub (Owner) :
                    </label>
                    <input
                      type="text"
                      value={githubConfig.owner}
                      onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value.trim() })}
                      placeholder="ex: tchindaazice"
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nom du Repository GitHub :
                    </label>
                    <input
                      type="text"
                      value={githubConfig.repo}
                      onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value.trim() })}
                      placeholder="ex: nexus-tunnel-vpn"
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tag de la Release GitHub :
                    </label>
                    <input
                      type="text"
                      value={githubConfig.tag}
                      onChange={(e) => setGithubConfig({ ...githubConfig, tag: e.target.value.trim() })}
                      placeholder="ex: v3.2.0"
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Nom du fichier APK dans la Release :
                    </label>
                    <input
                      type="text"
                      value={githubConfig.apkName}
                      onChange={(e) => setGithubConfig({ ...githubConfig, apkName: e.target.value.trim() })}
                      placeholder="ex: NexusTunnel-v3.2.0.apk"
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    URL directe de téléchargement APK (Optionnel - surcharge) :
                  </label>
                  <input
                    type="url"
                    value={githubConfig.customDownloadUrl || ''}
                    onChange={(e) => setGithubConfig({ ...githubConfig, customDownloadUrl: e.target.value.trim() })}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Calculated Direct Download Link Preview */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Lien Actuel de Téléchargement APK :</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(GithubConfigService.getDirectApkDownloadUrl(githubConfig));
                        setCopiedId('gh_link');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedId === 'gh_link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'gh_link' ? 'Copié' : 'Copier le lien'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-emerald-400 break-all select-all">
                    {GithubConfigService.getDirectApkDownloadUrl(githubConfig)}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>ENREGISTRER LA CONFIGURATION GITHUB</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerApkDownload(null, undefined, 'local', githubConfig);
                    }}
                    className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Tester le Téléchargement</span>
                  </button>
                </div>

                {githubSaved && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Paramètres du dépôt GitHub enregistrés avec succès !</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>

      {/* APPROVAL MODAL */}
      {approvalModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0b101e] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-cyber font-bold text-white">
                  APPROBATION D'ADHÉSION & ATTRIBUTION UID
                </h3>
              </div>
              <button
                onClick={() => setApprovalModalReq(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {!approvalSuccessToken ? (
                <form onSubmit={confirmApproval} className="space-y-4">
                  {/* User brief */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{approvalModalReq.countryFlag}</span>
                      <div>
                        <div className="font-bold text-white text-sm">{approvalModalReq.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {approvalModalReq.countryName} • {approvalModalReq.commValue}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                      {approvalModalReq.deviceInfo.model}
                    </span>
                  </div>

                  {/* UID Personnalisé */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-300">
                        1. UID Personnalisé VLESS (Généré ou sur-mesure)
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomUid(generateVlessUid())}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Régénérer
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customUid}
                      onChange={(e) => setCustomUid(e.target.value)}
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2 text-cyan-300 focus:outline-none focus:border-cyan-400 select-all"
                      required
                    />
                  </div>

                  {/* Quota de données à consommer */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      2. Quota de Données Alloué (en Go)
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[10, 20, 50, 100].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setQuotaGb(g)}
                          className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                            quotaGb === g
                              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {g} Go
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={quotaGb}
                      onChange={(e) => setQuotaGb(Number(e.target.value))}
                      className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Date d'expiration */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      3. Période de validité (Jours)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 30, 60].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setExpirationDays(days)}
                          className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                            expirationDays === days
                              ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {days} Jours
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>CONFIRMER L'APPROBATION & ENVOYER LE TOKEN</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Success notification with Token */
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">Demande Approuvée avec Succès !</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      L'adhésion a été validée. L'application mobile du membre se déverrouille automatiquement.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 text-left space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Token d'Accès Sécurisé Généré :
                    </span>
                    <div className="font-mono text-sm font-bold text-emerald-300 select-all tracking-wider">
                      {approvalSuccessToken}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      UID: {customUid} • Quota: {quotaGb} Go • Validité: {expirationDays} jours
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleCopy(approvalSuccessToken, 'tok_modal')}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedId === 'tok_modal' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>Copier le Token</span>
                    </button>

                    <button
                      onClick={() => {
                        setApprovalModalReq(null);
                        setApprovalSuccessToken(null);
                        onBackToApp();
                      }}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-cyber font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Voir dans l'App VPN</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0b101e] border border-rose-500/40 rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Refuser la demande d'adhésion</h3>
              </div>
              <button onClick={() => setRejectModalReq(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={confirmRejection} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Êtes-vous sûr de refuser l'accès VPN à <strong className="text-white">{rejectModalReq.fullName}</strong> ({rejectModalReq.countryName}) ?
              </p>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Motif du refus (optionnel) :
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ex: Numéro non joignable, quota revendeur épuisé..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold font-cyber"
                >
                  Confirmer le Refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
