import QRCode from 'qrcode';
import { UserSession, VpnSettings } from '../types/vpn';

export function buildVlessUri(session: UserSession, settings?: VpnSettings): string {
  const host = session.host || 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio';
  const port = session.port || 443;
  const transport = settings?.transport || session.transport || 'ws';
  const path = encodeURIComponent(settings?.path || session.path || '/nexus-tunnel');
  const sni = encodeURIComponent(settings?.bugHostSni || session.sni || host);
  const remark = encodeURIComponent(`NexusTunnel-${session.countryCode}-${session.fullName.split(' ')[0]}`);

  // Standard VLESS URI format:
  // vless://UUID@HOST:PORT?security=tls&encryption=none&headerType=none&type=ws&sni=SNI&path=PATH#REMARK
  return `vless://${session.uid}@${host}:${port}?security=tls&encryption=none&headerType=none&type=${transport}&sni=${sni}&path=${path}#${remark}`;
}

export function buildClashVlessYaml(session: UserSession, settings?: VpnSettings): string {
  const host = session.host || 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio';
  const transport = settings?.transport || session.transport || 'ws';
  const path = settings?.path || session.path || '/nexus-tunnel';
  const sni = settings?.bugHostSni || session.sni || host;

  return `
- name: "NexusTunnel [${session.countryFlag} ${session.countryName}]"
  type: vless
  server: ${host}
  port: 443
  uuid: ${session.uid}
  network: ${transport}
  tls: true
  udp: true
  sni: ${sni}
  skip-cert-verify: false
  ws-opts:
    path: ${path}
    headers:
      Host: ${sni}
`.trim();
}

export function buildXrayClientJson(session: UserSession, settings?: VpnSettings): string {
  const host = session.host || 'nexus-tunnel-d-ploiement-gestionnaire-vless.ai.studio';
  const path = settings?.path || session.path || '/nexus-tunnel';
  const sni = settings?.bugHostSni || session.sni || host;

  return JSON.stringify(
    {
      log: { loglevel: 'warning' },
      inbounds: [
        {
          port: 10808,
          listen: '127.0.0.1',
          protocol: 'socks',
          settings: { auth: 'noauth', udp: true },
          sniffing: { enabled: true, destOverride: ['http', 'tls'] },
        },
        {
          port: 10809,
          listen: '127.0.0.1',
          protocol: 'http',
          settings: { timeout: 300 },
        },
      ],
      outbounds: [
        {
          protocol: 'vless',
          settings: {
            vnext: [
              {
                address: host,
                port: 443,
                users: [{ id: session.uid, encryption: 'none', level: 0 }],
              },
            ],
          },
          streamSettings: {
            network: settings?.transport || 'ws',
            security: 'tls',
            tlsSettings: { serverName: sni, allowInsecure: false },
            wsSettings: { path: path, headers: { Host: sni } },
          },
          tag: 'proxy',
        },
        { protocol: 'freedom', tag: 'direct' },
        { protocol: 'blackhole', tag: 'block' },
      ],
    },
    null,
    2
  );
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 2,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0.00 Mo';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} Ko/s`;
  return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} Mo/s`;
}

export function getTimeRemaining(expirationIsoString: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formattedText: string;
} {
  const total = Date.parse(expirationIsoString) - Date.now();
  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formattedText: 'EXPIRÉ',
    };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  let formatted = '';
  if (days > 0) formatted += `${days}j `;
  formatted += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formattedText: formatted,
  };
}
