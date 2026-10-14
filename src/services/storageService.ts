import { MembershipRequest, UserSession, DeviceInfo, VpnSettings } from '../types/vpn';

const STORAGE_KEYS = {
  REQUESTS: 'nexus_membership_requests',
  CURRENT_REQUEST_ID: 'nexus_current_request_id',
  CURRENT_SESSION: 'nexus_current_session',
  SETTINGS: 'nexus_vpn_settings',
  SERVER_CONFIG: 'nexus_server_config',
  ADMIN_TOKEN: 'nexus_admin_token',
};

export const DEFAULT_HOST = 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio';
export const DEFAULT_PORT = 443;
export const DEFAULT_PATH = '/nexus-tunnel';

export const DEFAULT_SETTINGS: VpnSettings = {
  killSwitch: true,
  bugHostSni: 'm.facebook.com',
  customDns: '1.1.1.1 (Cloudflare)',
  transport: 'ws',
  path: '/nexus-tunnel',
  splitTunneling: false,
  selectedApps: ['WhatsApp', 'Telegram', 'YouTube', 'Chrome'],
  udpGw: true,
  autoReconnect: true,
  mtu: 1420,
};

// Generate realistic Android device info
export function getSimulatedDeviceInfo(): DeviceInfo {
  const models = [
    'Samsung Galaxy S24 Ultra (SM-S928B)',
    'Tecno Camon 30 Pro 5G',
    'Infinix Note 40 Pro+',
    'Xiaomi Redmi Note 13 Pro',
    'Google Pixel 8 Pro',
    'Oppo Reno 11 5G'
  ];
  const randModel = models[Math.floor(Math.random() * models.length)];
  const randOctet = Math.floor(Math.random() * 200) + 10;
  
  return {
    model: randModel,
    platform: 'Android 14 (API 34) - ARM64-v8a',
    ip: `197.149.${randOctet}.${Math.floor(Math.random() * 250) + 2}`,
    fingerprint: `NEXUS-HW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    userAgent: 'NexusTunnel-Android/3.2.0 (Linux; Android 14; Mobile)'
  };
}

// Generate unique custom UID for VLESS
export function generateVlessUid(prefix: string = 'nexus'): string {
  // Format standard UUID-v4 or clean hexadecimal
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-a${s4().substr(0, 3)}-${s4()}${s4()}${s4()}`;
}

// Generate secure authentication token
export function generateAuthToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = 'NXT-';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) token += '-';
  }
  return token;
}

// Initial seed requests
const SEED_REQUESTS: MembershipRequest[] = [
  {
    id: 'req_seed_cm_01',
    fullName: 'Christian Eyenga',
    countryCode: 'CM',
    countryName: 'Cameroun',
    countryFlag: '🇨🇲',
    commType: 'whatsapp',
    commValue: '+237 699 44 21 88',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    deviceInfo: {
      model: 'Samsung Galaxy A54 5G',
      platform: 'Android 14',
      ip: '197.149.204.12',
      fingerprint: 'NEXUS-HW-A8F29C01',
      userAgent: 'NexusTunnel-Android/3.2.0'
    }
  },
  {
    id: 'req_seed_ci_02',
    fullName: 'Yasmine Kouamé',
    countryCode: 'CI',
    countryName: 'Côte d\'Ivoire',
    countryFlag: '🇨🇮',
    commType: 'telegram',
    commValue: '@yasmine_kouame',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    assignedUid: '7f9c2d14-b819-4c80-9281-9b4e72a0f81d',
    assignedToken: 'NXT-7A2B-9K4M-2P8X-1V3Z',
    quotaGb: 25,
    expirationDate: new Date(Date.now() + 86400 * 1000 * 28).toISOString(),
    deviceInfo: {
      model: 'Tecno Spark 20 Pro',
      platform: 'Android 13',
      ip: '160.155.84.90',
      fingerprint: 'NEXUS-HW-C492B19D',
      userAgent: 'NexusTunnel-Android/3.2.0'
    }
  },
  {
    id: 'req_seed_sn_03',
    fullName: 'Mamadou Diallo',
    countryCode: 'SN',
    countryName: 'Sénégal',
    countryFlag: '🇸🇳',
    commType: 'whatsapp',
    commValue: '+221 77 412 80 91',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    deviceInfo: {
      model: 'Infinix Zero 30',
      platform: 'Android 14',
      ip: '154.125.10.45',
      fingerprint: 'NEXUS-HW-99120AF8',
      userAgent: 'NexusTunnel-Android/3.2.0'
    }
  }
];

export const StorageService = {
  // Get all membership requests
  getRequests(): MembershipRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
        return SEED_REQUESTS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_REQUESTS;
    }
  },

  // Save requests list
  saveRequests(requests: MembershipRequest[]) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.broadcastUpdate('requests_updated');
  },

  // Submit new membership request from the client app
  submitRequest(data: {
    fullName: string;
    countryCode: string;
    countryName: string;
    countryFlag: string;
    commType: 'whatsapp' | 'telegram';
    commValue: string;
    deviceInfo?: DeviceInfo;
  }): MembershipRequest {
    const requests = this.getRequests();
    const newReq: MembershipRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: data.fullName.trim(),
      countryCode: data.countryCode,
      countryName: data.countryName,
      countryFlag: data.countryFlag,
      commType: data.commType,
      commValue: data.commValue.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      deviceInfo: data.deviceInfo || getSimulatedDeviceInfo()
    };

    requests.unshift(newReq);
    this.saveRequests(requests);
    localStorage.setItem(STORAGE_KEYS.CURRENT_REQUEST_ID, newReq.id);
    return newReq;
  },

  // Approve a membership request from the WebPanel
  approveRequest(
    requestId: string,
    params: {
      customUid?: string;
      quotaGb: number;
      expirationDays: number;
    }
  ): { request: MembershipRequest; session: UserSession } | null {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return null;

    const req = requests[index];
    const uid = params.customUid?.trim() || generateVlessUid();
    const token = generateAuthToken();
    const expDate = new Date(Date.now() + params.expirationDays * 86400 * 1000).toISOString();

    req.status = 'approved';
    req.assignedUid = uid;
    req.assignedToken = token;
    req.quotaGb = params.quotaGb;
    req.expirationDate = expDate;

    requests[index] = req;
    this.saveRequests(requests);

    // Create session object
    const session: UserSession = {
      uid,
      token,
      requestId: req.id,
      fullName: req.fullName,
      countryCode: req.countryCode,
      countryName: req.countryName,
      countryFlag: req.countryFlag,
      commType: req.commType,
      commValue: req.commValue,
      totalQuotaBytes: params.quotaGb * 1024 * 1024 * 1024,
      usedQuotaBytes: 0,
      expirationDate: expDate,
      createdAt: new Date().toISOString(),
      deviceInfo: req.deviceInfo,
      host: DEFAULT_HOST,
      port: DEFAULT_PORT,
      protocol: 'vless',
      transport: 'ws',
      sni: DEFAULT_HOST,
      path: DEFAULT_PATH,
    };

    // If this was the current user's request, save as active session
    const currentRequestId = localStorage.getItem(STORAGE_KEYS.CURRENT_REQUEST_ID);
    if (currentRequestId === requestId) {
      this.saveSession(session);
    }

    this.broadcastUpdate('approval_event', { requestId, session });
    return { request: req, session };
  },

  // Reject a membership request
  rejectRequest(requestId: string, reason?: string): boolean {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return false;

    requests[index].status = 'rejected';
    requests[index].rejectedReason = reason || 'Refusé par l\'administrateur du WebPanel Nexus Tunnel';
    this.saveRequests(requests);
    this.broadcastUpdate('rejection_event', { requestId });
    return true;
  },

  // Get current user session (when logged in to VPN)
  getCurrentSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // Save current user session
  saveSession(session: UserSession | null) {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    }
    this.broadcastUpdate('session_updated', session);
  },

  // Update consumed quota bytes in real time
  updateUsedQuota(bytesConsumed: number) {
    const session = this.getCurrentSession();
    if (!session) return;
    session.usedQuotaBytes = Math.min(session.totalQuotaBytes, session.usedQuotaBytes + bytesConsumed);
    this.saveSession(session);
  },

  // Get user's current pending request ID
  getCurrentRequestId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_REQUEST_ID);
  },

  // Reset/Logout client to test onboarding from scratch
  resetClientState() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_REQUEST_ID);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    this.broadcastUpdate('client_reset');
  },

  // Direct login by Token
  loginWithToken(tokenToSearch: string): UserSession | null {
    const requests = this.getRequests();
    const found = requests.find((r) => r.assignedToken?.toUpperCase() === tokenToSearch.trim().toUpperCase() && r.status === 'approved');
    if (!found || !found.assignedUid || !found.assignedToken || !found.quotaGb || !found.expirationDate) {
      return null;
    }

    const session: UserSession = {
      uid: found.assignedUid,
      token: found.assignedToken,
      requestId: found.id,
      fullName: found.fullName,
      countryCode: found.countryCode,
      countryName: found.countryName,
      countryFlag: found.countryFlag,
      commType: found.commType,
      commValue: found.commValue,
      totalQuotaBytes: found.quotaGb * 1024 * 1024 * 1024,
      usedQuotaBytes: 1024 * 1024 * 250, // 250 MB initial used
      expirationDate: found.expirationDate,
      createdAt: found.createdAt,
      deviceInfo: found.deviceInfo,
      host: DEFAULT_HOST,
      port: DEFAULT_PORT,
      protocol: 'vless',
      transport: 'ws',
      sni: DEFAULT_HOST,
      path: DEFAULT_PATH,
    };

    this.saveSession(session);
    return session;
  },

  // Load VPN settings
  getSettings(): VpnSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  // Save VPN settings
  saveSettings(settings: VpnSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.broadcastUpdate('settings_updated', settings);
  },

  // Get server configuration
  getServerConfig() {
    return {
      host: DEFAULT_HOST,
      port: DEFAULT_PORT,
      path: DEFAULT_PATH,
      dockerImage: 'docker.io/nextl/nexus-tunnel',
      tunnelCore: 'VLESS-XTLS-Xray Core v1.8.16',
      status: 'ONLINE',
      uptime: '14j 08h 22m',
      activeConnections: 142,
    };
  },

  // Broadcast events to other components or tabs
  broadcastUpdate(type: string, detail?: any) {
    try {
      window.dispatchEvent(new CustomEvent('nexus_storage_event', { detail: { type, detail } }));
    } catch {}
  }
};
