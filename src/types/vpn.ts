export type CommunicationType = 'whatsapp' | 'telegram';

export interface AfricanCountry {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  telecoms: string[];
  region: 'Afrique de l\'Ouest' | 'Afrique Centrale' | 'Afrique du Nord' | 'Afrique de l\'Est' | 'Afrique Australe';
}

export interface DeviceInfo {
  model: string;
  platform: string;
  ip: string;
  fingerprint: string;
  userAgent: string;
}

export interface MembershipRequest {
  id: string;
  fullName: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  commType: CommunicationType;
  commValue: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  deviceInfo: DeviceInfo;
  assignedUid?: string;
  assignedToken?: string;
  quotaGb?: number;
  expirationDate?: string;
  rejectedReason?: string;
}

export interface UserSession {
  uid: string;
  token: string;
  requestId: string;
  fullName: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  commType: CommunicationType;
  commValue: string;
  totalQuotaBytes: number;
  usedQuotaBytes: number;
  expirationDate: string;
  createdAt: string;
  deviceInfo: DeviceInfo;
  host: string;
  port: number;
  protocol: 'vless';
  transport: 'ws' | 'grpc' | 'httpupgrade';
  sni: string;
  path: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface ConnectionMetrics {
  uploadSpeed: number; // in B/s
  downloadSpeed: number; // in B/s
  totalUploaded: number; // in bytes
  totalDownloaded: number; // in bytes
  ping: number; // in ms
  packetLoss: number; // in %
  durationSeconds: number;
  connectedAt: number | null;
}

export interface VpnLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  category: 'TLS' | 'VLESS' | 'DNS' | 'ROUTING' | 'AUTH' | 'SYSTEM' | 'SECURITY';
}

export interface VpnSettings {
  killSwitch: boolean;
  bugHostSni: string;
  customDns: string;
  transport: 'ws' | 'grpc' | 'httpupgrade';
  path: string;
  splitTunneling: boolean;
  selectedApps: string[];
  udpGw: boolean;
  autoReconnect: boolean;
  mtu: number;
}
