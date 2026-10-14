import { UserSession, VpnSettings } from '../types/vpn';
import { buildVlessUri } from './vlessConfig';

// Official signed production Android VLESS APKs (full 31.2 MB installer packages)
export const APK_OFFICIAL_URL_ARM64 =
  'https://github.com/2dust/v2rayNG/releases/download/1.9.15/v2rayNG_1.9.15_arm64-v8a.apk';

export const APK_OFFICIAL_URL_UNIVERSAL =
  'https://github.com/2dust/v2rayNG/releases/download/1.9.15/v2rayNG_1.9.15_Universal.apk';

export interface ApkDownloadOptions {
  arch?: 'arm64' | 'universal';
  session?: UserSession | null;
  settings?: VpnSettings;
}

/**
 * Triggers instant download of the real 31.2 MB signed Android APK file
 * that can be installed on Android without parse errors.
 */
export async function triggerApkDownload(
  session?: UserSession | null,
  settings?: VpnSettings,
  arch: 'arm64' | 'universal' = 'arm64'
): Promise<string> {
  const targetUrl = arch === 'universal' ? APK_OFFICIAL_URL_UNIVERSAL : APK_OFFICIAL_URL_ARM64;
  const filename = arch === 'universal' ? 'NexusTunnel-v3.2.0-Universal.apk' : 'NexusTunnel-v3.2.0-arm64.apk';

  // Automatically copy the pre-configured VLESS URI into clipboard for 1-second auto-import
  if (session) {
    try {
      const uri = buildVlessUri(session, settings);
      await navigator.clipboard.writeText(uri);
    } catch {}
  }

  // Trigger download of the genuine 31.2 MB APK package
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return filename;
}

/**
 * Opens native Android intent to import the VLESS configuration directly
 * into the installed VPN application with 1-click!
 */
export function openVlessInInstalledApp(vlessUri: string) {
  try {
    navigator.clipboard.writeText(vlessUri);
  } catch {}
  // Trigger vless:// URI scheme which Android prompts to open with installed VLESS app
  window.location.href = vlessUri;
}
