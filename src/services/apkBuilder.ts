import { UserSession, VpnSettings } from '../types/vpn';
import { buildVlessUri } from './vlessConfig';
import { GithubConfigService, GithubRepoConfig } from './githubConfig';

/**
 * Triggers instant download of the custom Nexus Tunnel APK from the user's GitHub repository
 */
export async function triggerApkDownload(
  session?: UserSession | null,
  settings?: VpnSettings,
  arch: 'arm64' | 'universal' = 'arm64',
  customConfig?: GithubRepoConfig
): Promise<string> {
  const config = customConfig || GithubConfigService.getConfig();
  const targetUrl = GithubConfigService.getDirectApkDownloadUrl(config);
  const filename = config.apkName || 'NexusTunnel-v3.2.0.apk';

  // Automatically copy the pre-configured VLESS URI into clipboard for 1-second auto-import
  if (session) {
    try {
      const uri = buildVlessUri(session, settings);
      await navigator.clipboard.writeText(uri);
    } catch {}
  }

  // Trigger download from the user's GitHub repository release
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
  // Trigger vless:// URI scheme which Android prompts to open with installed Nexus Tunnel app
  window.location.href = vlessUri;
}
