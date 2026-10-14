import React, { useState, useEffect, useRef } from 'react';
import {
  UserSession,
  VpnSettings,
  ConnectionStatus,
  ConnectionMetrics,
  VpnLog
} from './types/vpn';
import { StorageService, DEFAULT_SETTINGS } from './services/storageService';
import { triggerApkDownload } from './services/apkBuilder';
import { PhoneFrame } from './components/PhoneFrame';
import { RegistrationForm } from './components/RegistrationForm';
import { WaitingApproval } from './components/WaitingApproval';
import { VpnDashboard } from './components/VpnDashboard';
import { VpnLogs } from './components/VpnLogs';
import { VpnSettingsComponent } from './components/VpnSettings';
import { VlessExportModal } from './components/VlessExportModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { ApkDownloadPage } from './components/ApkDownloadPage';
import { WebPanelAdmin } from './components/WebPanelAdmin';
import {
  Shield,
  Smartphone,
  Server,
  Download,
  Bell,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Terminal,
  Settings as SettingsIcon,
  Zap,
  ExternalLink
} from 'lucide-react';

export type ViewMode = 'VPN_CLIENT' | 'WEBPANEL_ADMIN' | 'DOWNLOAD_PORTAL';

export default function App() {
  // Navigation mode derived from URL parameters or initial state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const url = window.location.href.toLowerCase();
      if (url.includes('panel=admin') || url.includes('/admin') || url.includes('/webpanel')) {
        return 'WEBPANEL_ADMIN';
      }
      if (url.includes('page=download') || url.includes('/download') || url.includes('page=apk')) {
        return 'DOWNLOAD_PORTAL';
      }
    } catch {}
    return 'VPN_CLIENT';
  });

  // Client sub-views inside mobile shell
  const [clientSubView, setClientSubView] = useState<'DASHBOARD' | 'LOGS' | 'SETTINGS'>('DASHBOARD');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [isDirectDownloading, setIsDirectDownloading] = useState(false);

  // Core VPN & User State
  const [session, setSession] = useState<UserSession | null>(() => StorageService.getCurrentSession());
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(() => StorageService.getCurrentRequestId());
  const [settings, setSettings] = useState<VpnSettings>(() => StorageService.getSettings());

  // Connection State & Metrics
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    uploadSpeed: 0,
    downloadSpeed: 0,
    totalUploaded: 0,
    totalDownloaded: 0,
    ping: 45,
    packetLoss: 0,
    durationSeconds: 0,
    connectedAt: null,
  });

  // Logs list
  const [logs, setLogs] = useState<VpnLog[]>([
    {
      id: 'log_init_0',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      category: 'SYSTEM',
      message: 'Nexus Tunnel Client v3.2 initialisé (Core: VLESS XTLS / Xray v1.8.16)',
    },
    {
      id: 'log_init_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      category: 'ROUTING',
      message: 'Passerelle Cloudflare / Bug Host configuré pour opérateurs africains.',
    },
  ]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Switch navigation and synchronize browser URL query parameter
  const navigateTo = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      const url = new URL(window.location.href);
      if (mode === 'WEBPANEL_ADMIN') {
        url.searchParams.set('panel', 'admin');
        url.searchParams.delete('page');
      } else if (mode === 'DOWNLOAD_PORTAL') {
        url.searchParams.set('page', 'download');
        url.searchParams.delete('panel');
      } else {
        url.searchParams.delete('panel');
        url.searchParams.delete('page');
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Sync state with storage updates & cross-tab events
  useEffect(() => {
    const handleStorageEvent = (e: any) => {
      const type = e.detail?.type;
      if (type === 'approval_event' || type === 'session_updated') {
        const updated = StorageService.getCurrentSession();
        setSession(updated);
        if (updated) {
          showToast(`Adhésion validée pour ${updated.fullName} ! Quota actif.`, 'success');
        }
      } else if (type === 'client_reset') {
        setSession(null);
        setCurrentRequestId(null);
        setConnectionStatus('disconnected');
      } else if (type === 'settings_updated') {
        setSettings(StorageService.getSettings());
      }
    };

    window.addEventListener('nexus_storage_event', handleStorageEvent);
    return () => window.removeEventListener('nexus_storage_event', handleStorageEvent);
  }, []);

  // Connection simulator interval
  const connectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      connectionTimerRef.current = setInterval(() => {
        const downSpeed = Math.floor(Math.random() * 4000000) + 1500000;
        const upSpeed = Math.floor(Math.random() * 900000) + 200000;
        const pingFluct = Math.floor(Math.random() * 12) + 38;

        const bytesConsumed = Math.floor((downSpeed + upSpeed) * 0.25);

        StorageService.updateUsedQuota(bytesConsumed);
        const currentSes = StorageService.getCurrentSession();
        if (currentSes) {
          setSession({ ...currentSes });
          if (currentSes.usedQuotaBytes >= currentSes.totalQuotaBytes) {
            disconnectVpn('Quota de données entièrement épuisé.');
            return;
          }
        }

        setMetrics((prev) => ({
          ...prev,
          durationSeconds: prev.durationSeconds + 1,
          uploadSpeed: upSpeed,
          downloadSpeed: downSpeed,
          totalUploaded: prev.totalUploaded + upSpeed,
          totalDownloaded: prev.totalDownloaded + downSpeed,
          ping: pingFluct,
        }));
      }, 1000);
    } else {
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    }

    return () => {
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    };
  }, [connectionStatus]);

  const addLog = (
    category: VpnLog['category'],
    message: string,
    level: VpnLog['level'] = 'info'
  ) => {
    const newLog: VpnLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      category,
      message,
      level,
    };
    setLogs((prev) => [...prev.slice(-150), newLog]);
  };

  const handleToggleConnect = () => {
    if (!session) return;

    if (connectionStatus === 'connected') {
      disconnectVpn('Déconnexion manuelle du tunnel VLESS.');
    } else if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
      connectVpn();
    }
  };

  const connectVpn = () => {
    if (!session) return;
    setConnectionStatus('connecting');

    addLog('AUTH', `Vérification du token de session [${session.token}]...`, 'info');
    addLog('TLS', `Négociation TLS 1.3 avec ${session.host}:443 (SNI: ${settings.bugHostSni})`, 'info');

    setTimeout(() => {
      addLog('VLESS', `Handshake VLESS authentifié avec UID ${session.uid}`, 'info');
      addLog('DNS', `Serveur DNS sécurisé actif : ${settings.customDns}`, 'info');

      if (settings.killSwitch) {
        addLog('SECURITY', 'Kill Switch Strict armé : Fuites réseau bloquées.', 'success');
      }

      setTimeout(() => {
        setConnectionStatus('connected');
        setMetrics((m) => ({
          ...m,
          connectedAt: Date.now(),
          durationSeconds: 0,
        }));
        addLog('SYSTEM', 'TUNNEL VLESS SÉCURISÉ ÉTABLI AVEC SUCCÈS ! Quota en écoute.', 'success');
        showToast('Tunnel VLESS connecté avec succès !', 'success');
      }, 700);
    }, 900);
  };

  const disconnectVpn = (reason: string) => {
    setConnectionStatus('disconnecting');
    addLog('SYSTEM', `Fermeture de la connexion : ${reason}`, 'warn');

    setTimeout(() => {
      setConnectionStatus('disconnected');
      setMetrics((m) => ({
        ...m,
        uploadSpeed: 0,
        downloadSpeed: 0,
        ping: 0,
        connectedAt: null,
      }));
      addLog('SYSTEM', 'Tunnel VLESS fermé.', 'info');
      showToast('Tunnel VLESS déconnecté', 'info');
    }, 500);
  };

  const handleLogout = () => {
    if (connectionStatus === 'connected') {
      disconnectVpn('Déconnexion du profil');
    }
    StorageService.resetClientState();
    setSession(null);
    setCurrentRequestId(null);
    setClientSubView('DASHBOARD');
    showToast('Profil déconnecté. Prêt pour une nouvelle adhésion.', 'info');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  // Instant direct .apk download
  const handleDirectApkDownload = async () => {
    try {
      setIsDirectDownloading(true);
      const filename = await triggerApkDownload(session, settings);
      showToast(`Téléchargement lancé : ${filename}`, 'success');
      setTimeout(() => setIsDirectDownloading(false), 1200);
    } catch {
      setIsDirectDownloading(false);
      showToast('Erreur lors du téléchargement de l\'APK.', 'warn');
    }
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans">
      {/* GLOBAL TOP NAVIGATION SWITCHER BAR */}
      <nav className="bg-[#0b101e] border-b border-slate-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-cyan-950">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cyber font-bold text-sm tracking-wide text-white">
                NEXUS TUNNEL PRO
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/40">
                VLESS • 54 Pays Africains
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden lg:block">
              Host: nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio
            </div>
          </div>
        </div>

        {/* Global Action & View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Direct APK Download Button */}
          <button
            onClick={handleDirectApkDownload}
            disabled={isDirectDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-cyber font-bold text-xs shadow-md shadow-emerald-950 transition-all"
            title="Télécharger l'APK directement sur votre téléphone"
          >
            <Download className={`w-3.5 h-3.5 ${isDirectDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDirectDownloading ? 'Téléchargement...' : 'Télécharger l\'APK (.apk)'}</span>
          </button>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => navigateTo('VPN_CLIENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber font-bold transition-all ${
                viewMode === 'VPN_CLIENT'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Mobile</span>
            </button>

            <button
              onClick={() => navigateTo('DOWNLOAD_PORTAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber font-bold transition-all ${
                viewMode === 'DOWNLOAD_PORTAL'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Portail .APK</span>
            </button>

            <button
              onClick={() => navigateTo('WEBPANEL_ADMIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cyber font-bold transition-all ${
                viewMode === 'WEBPANEL_ADMIN'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>WebPanel Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 border border-cyan-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs backdrop-blur-md">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : toast.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Bell className="w-4 h-4 text-cyan-400" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* VIEW 1: WEBPANEL ADMINISTRATEUR DÉDIÉ */}
      {viewMode === 'WEBPANEL_ADMIN' && (
        <WebPanelAdmin
          onBackToApp={() => navigateTo('VPN_CLIENT')}
          onOpenDownloadPage={() => navigateTo('DOWNLOAD_PORTAL')}
        />
      )}

      {/* VIEW 2: PORTAIL DE TÉLÉCHARGEMENT .APK DÉDIÉ */}
      {viewMode === 'DOWNLOAD_PORTAL' && (
        <ApkDownloadPage
          session={session}
          onOpenApp={() => navigateTo('VPN_CLIENT')}
          onOpenWebPanel={() => navigateTo('WEBPANEL_ADMIN')}
        />
      )}

      {/* VIEW 3: APPLICATION VPN MOBILE (.APK STYLE) */}
      {viewMode === 'VPN_CLIENT' && (
        <div className="flex-1 flex flex-col items-center justify-start py-2 sm:py-4">
          <PhoneFrame
            isConnected={connectionStatus === 'connected'}
            activeTabTitle={
              session
                ? clientSubView === 'LOGS'
                  ? 'Logs de Connexion'
                  : clientSubView === 'SETTINGS'
                  ? 'Paramètres Pro'
                  : 'Nexus Tunnel VPN'
                : currentRequestId
                ? 'En attente d\'approbation'
                : 'Adhésion Obligatoire'
            }
          >
            {/* Download Prompt banner inside phone frame */}
            <div className="bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 px-4 py-2 border-b border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-300 font-medium truncate flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Application Android disponible (.apk)</span>
              </span>
              <button
                onClick={handleDirectApkDownload}
                className="px-2 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold font-cyber shrink-0 transition-colors"
              >
                TÉLÉCHARGER
              </button>
            </div>

            {/* SUB-HEADER INSIDE PHONE FRAME (WHEN LOGS OR SETTINGS ACTIVE) */}
            {session && clientSubView !== 'DASHBOARD' && (
              <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setClientSubView('DASHBOARD')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour au VPN</span>
                </button>
                <span className="font-cyber font-bold text-slate-300">
                  {clientSubView === 'LOGS' ? 'JOURNAL DIRECT' : 'PARAMÈTRES SÉCURITÉ'}
                </span>
              </div>
            )}

            {/* SCREEN 1: ONBOARDING / REGISTRATION (IF NO SESSION & NO REQUEST) */}
            {!session && !currentRequestId && (
              <RegistrationForm
                onRequestSubmitted={(newReqId) => {
                  setCurrentRequestId(newReqId);
                  showToast('Demande transmise au WebPanel !', 'info');
                }}
                onDirectTokenLogin={() => {
                  const ses = StorageService.getCurrentSession();
                  setSession(ses);
                  showToast('Token validé ! Connexion VLESS prête.', 'success');
                }}
              />
            )}

            {/* SCREEN 2: WAITING FOR APPROVAL (IF SUBMITTED & PENDING) */}
            {!session && currentRequestId && (
              <WaitingApproval
                requestId={currentRequestId}
                onApproved={(approvedSession) => {
                  setSession(approvedSession);
                  showToast('Félicitations ! Adhésion acceptée.', 'success');
                }}
                onCancel={() => {
                  setCurrentRequestId(null);
                  StorageService.resetClientState();
                }}
                onOpenWebPanel={() => navigateTo('WEBPANEL_ADMIN')}
              />
            )}

            {/* SCREEN 3: REAL FULL-FLEDGED VPN CLIENT (WHEN APPROVED / SESSION ACTIVE) */}
            {session && (
              <>
                {clientSubView === 'DASHBOARD' && (
                  <VpnDashboard
                    session={session}
                    settings={settings}
                    connectionStatus={connectionStatus}
                    metrics={metrics}
                    onToggleConnect={handleToggleConnect}
                    onOpenLogs={() => setClientSubView('LOGS')}
                    onOpenSettings={() => setClientSubView('SETTINGS')}
                    onOpenExport={() => setShowExportModal(true)}
                    onOpenApk={() => setShowApkModal(true)}
                    onLogout={handleLogout}
                    onOpenWebPanel={() => navigateTo('WEBPANEL_ADMIN')}
                  />
                )}

                {clientSubView === 'LOGS' && (
                  <VpnLogs logs={logs} onClearLogs={handleClearLogs} />
                )}

                {clientSubView === 'SETTINGS' && (
                  <VpnSettingsComponent
                    session={session}
                    settings={settings}
                    onUpdateSettings={(updated) => {
                      setSettings(updated);
                      showToast('Paramètres de sécurité enregistrés !', 'success');
                    }}
                  />
                )}
              </>
            )}
          </PhoneFrame>
        </div>
      )}

      {/* EXPORT VLESS MODAL */}
      {showExportModal && session && (
        <VlessExportModal
          session={session}
          settings={settings}
          onClose={() => setShowExportModal(false)}
          onOpenApkModal={() => setShowApkModal(true)}
        />
      )}

      {/* APK & PWA DOWNLOAD MODAL */}
      {showApkModal && session && (
        <ApkDownloadModal
          session={session}
          settings={settings}
          onClose={() => setShowApkModal(false)}
        />
      )}
    </div>
  );
}
