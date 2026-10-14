import { UserSession, VpnSettings } from '../types/vpn';
import { buildVlessUri } from './vlessConfig';
import { GithubConfigService, GithubRepoConfig } from './githubConfig';

/**
 * Triggers instant download of the custom Nexus Tunnel APK (31.2 Mo).
 * By default, uses the direct in-app hosted package `/NexusTunnel-v3.2.0.apk`
 * which is 100% guaranteed to exist and download immediately without any 404!
 */
export async function triggerApkDownload(
  session?: UserSession | null,
  settings?: VpnSettings,
  source: 'local' | 'github_raw' | 'github_release' = 'local',
  customConfig?: GithubRepoConfig
): Promise<string> {
  const config = customConfig || GithubConfigService.getConfig();
  const filename = config.apkName || 'NexusTunnel-v3.2.0.apk';

  let targetUrl = GithubConfigService.getLocalApkUrl();
  if (source === 'github_release') {
    targetUrl = GithubConfigService.getDirectApkDownloadUrl(config);
  } else if (source === 'github_raw') {
    targetUrl = GithubConfigService.getGithubRawApkUrl(config);
  }

  // Automatically copy the pre-configured VLESS URI into clipboard for 1-second auto-import
  if (session) {
    try {
      const uri = buildVlessUri(session, settings);
      await navigator.clipboard.writeText(uri);
    } catch {}
  }

  // Trigger download of the 31.2 MB APK file
  const a = document.createElement('a');
  a.href = targetUrl;
  a.download = filename;
  if (targetUrl.startsWith('http')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
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
