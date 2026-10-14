import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { MembershipRequest, UserSession } from '../types/vpn';
import { StorageService } from '../services/storageService';
import {
  Clock,
  CheckCircle,
  XCircle,
  Smartphone,
  Shield,
  Server,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
  Radio
} from 'lucide-react';

interface WaitingApprovalProps {
  requestId: string;
  onApproved: (session: UserSession) => void;
  onCancel: () => void;
  onOpenWebPanel: () => void;
}

export const WaitingApproval: React.FC<WaitingApprovalProps> = ({
  requestId,
  onApproved,
  onCancel,
  onOpenWebPanel,
}) => {
  const [request, setRequest] = useState<MembershipRequest | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  // Poll for approval status
  useEffect(() => {
    const checkStatus = () => {
      const requests = StorageService.getRequests();
      const current = requests.find((r) => r.id === requestId);
      if (current) {
        setRequest(current);
        if (current.status === 'approved' && current.assignedUid && current.assignedToken) {
          triggerSuccess(current);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2500);

    // Listen to local storage events
    const handleStorageEvent = (e: any) => {
      if (e.detail?.type === 'approval_event' || e.detail?.type === 'requests_updated') {
        checkStatus();
      }
    };
    window.addEventListener('nexus_storage_event', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('nexus_storage_event', handleStorageEvent);
    };
  }, [requestId]);

  const triggerSuccess = (req: MembershipRequest) => {
    setJustApproved(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b']
      });
    } catch {}

    setTimeout(() => {
      // Ensure session is loaded
      let session = StorageService.getCurrentSession();
      if (!session && req.assignedUid && req.assignedToken) {
        session = {
          uid: req.assignedUid,
          token: req.assignedToken,
          requestId: req.id,
          fullName: req.fullName,
          countryCode: req.countryCode,
          countryName: req.countryName,
          countryFlag: req.countryFlag,
          commType: req.commType,
          commValue: req.commValue,
          totalQuotaBytes: (req.quotaGb || 20) * 1024 * 1024 * 1024,
          usedQuotaBytes: 0,
          expirationDate: req.expirationDate || new Date(Date.now() + 30 * 86400 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          deviceInfo: req.deviceInfo,
          host: 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio',
          port: 443,
          protocol: 'vless',
          transport: 'ws',
          sni: 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio',
          path: '/nexus-tunnel',
        };
        StorageService.saveSession(session);
      }
      if (session) {
        onApproved(session);
      }
    }, 1800);
  };

  const handleManualCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      const requests = StorageService.getRequests();
      const current = requests.find((r) => r.id === requestId);
      if (current) {
        setRequest(current);
        if (current.status === 'approved') {
          triggerSuccess(current);
        }
      }
      setIsChecking(false);
    }, 600);
  };

  const handleQuickApproveSimulation = () => {
    // Quick admin simulation for testing directly in UI
    const result = StorageService.approveRequest(requestId, {
      quotaGb: 20,
      expirationDays: 30,
    });
    if (result) {
      triggerSuccess(result.request);
    }
  };

  if (!request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Chargement de votre demande d'adhésion...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-[#080d19] via-[#060912] to-[#04060b] text-slate-100">
      <div>
        {/* Animated Radar/Ping status indicator */}
        <div className="flex flex-col items-center justify-center text-center my-4">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                {justApproved ? (
                  <CheckCircle className="w-10 h-10 text-emerald-400 animate-bounce" />
                ) : (
                  <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold font-cyber tracking-wide text-white">
            {justApproved ? 'ADHÉSION APPROUVÉE !' : 'DEMANDE EN ATTENTE DE VALIDATION'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {justApproved
              ? 'L\'administrateur vous a attribué un UID et un quota. Installation du VPN en cours...'
              : 'Votre demande a été transmise avec succès au WebPanel de gestion Nexus Tunnel.'}
          </p>
        </div>

        {/* Server transmission status banner */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Server className="w-3.5 h-3.5" />
              <span>WebPanel Host Cible</span>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Écoute Active
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950/70 p-2 rounded border border-slate-800/80">
            https://nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio
          </div>
        </div>

        {/* Request details summary card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 space-y-2.5 mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Détails de votre demande</span>
            <span className="text-[10px] font-mono text-slate-500">ID: {request.id.slice(-8)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Nom Complet</div>
              <div className="font-semibold text-slate-200 truncate">{request.fullName}</div>
            </div>

            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div className="text-[10px] text-slate-500">Pays d'origine</div>
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                <span>{request.countryFlag}</span>
                <span className="truncate">{request.countryName}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500">Moyen de Communication</div>
              <div className="font-mono text-slate-200 font-medium">{request.commValue}</div>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              {request.commType}
            </span>
          </div>

          {/* Registered Device hardware info */}
          <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>{request.deviceInfo.model}</span>
            </div>
            <span className="font-mono text-slate-500">IP: {request.deviceInfo.ip}</span>
          </div>
        </div>

        {/* If Rejected notice */}
        {request.status === 'rejected' && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl mb-4 text-xs text-red-300">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Demande non approuvée</span>
            </div>
            <p className="text-[11px] text-red-300/80">
              {request.rejectedReason || 'L\'administrateur a refusé cette demande.'}
            </p>
          </div>
        )}

        {/* Quick Testing Actions (Admin switch & Quick approve) */}
        <div className="space-y-2 mb-2">
          <button
            type="button"
            onClick={onOpenWebPanel}
            className="w-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl py-2 px-3 text-xs text-cyan-300 font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              Basculer vers le WebPanel Admin
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handleQuickApproveSimulation}
            className="w-full bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500/40 rounded-xl py-2 px-3 text-xs font-cyber font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            SIMULER APPROBATION ADMIN IMMÉDIATE (TEST)
          </button>
        </div>
      </div>

      {/* Bottom Refresh and Cancel bar */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Modifier mes informations
        </button>

        <button
          type="button"
          onClick={handleManualCheck}
          disabled={isChecking}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
          <span>Vérifier statut</span>
        </button>
      </div>
    </div>
  );
};
