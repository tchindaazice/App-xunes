export interface GithubRepoConfig {
  owner: string;
  repo: string;
  tag: string;
  apkName: string;
  customDownloadUrl?: string;
}

const GITHUB_CONFIG_KEY = 'nexus_github_repo_config';

export const DEFAULT_GITHUB_CONFIG: GithubRepoConfig = {
  owner: 'tchindaazice',
  repo: 'nexus-tunnel-vpn',
  tag: 'v3.2.0',
  apkName: 'NexusTunnel-v3.2.0.apk',
};

export const GithubConfigService = {
  getConfig(): GithubRepoConfig {
    try {
      const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_GITHUB_CONFIG;
  },

  saveConfig(config: GithubRepoConfig) {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
    try {
      window.dispatchEvent(
        new CustomEvent('nexus_github_config_updated', { detail: config })
      );
    } catch {}
  },

  getDirectApkDownloadUrl(config?: GithubRepoConfig): string {
    const conf = config || this.getConfig();
    if (conf.customDownloadUrl && conf.customDownloadUrl.trim().length > 5) {
      return conf.customDownloadUrl.trim();
    }
    const owner = conf.owner.trim() || 'tchindaazice';
    const repo = conf.repo.trim() || 'nexus-tunnel-vpn';
    const tag = conf.tag.trim() || 'v3.2.0';
    const apk = conf.apkName.trim() || 'NexusTunnel-v3.2.0.apk';

    // Standard GitHub Releases direct download URL
    return `https://github.com/${owner}/${repo}/releases/download/${tag}/${apk}`;
  },

  getLatestApkDownloadUrl(config?: GithubRepoConfig): string {
    const conf = config || this.getConfig();
    const owner = conf.owner.trim() || 'tchindaazice';
    const repo = conf.repo.trim() || 'nexus-tunnel-vpn';
    const apk = conf.apkName.trim() || 'NexusTunnel-v3.2.0.apk';

    return `https://github.com/${owner}/${repo}/releases/latest/download/${apk}`;
  },

  getRepoUrl(config?: GithubRepoConfig): string {
    const conf = config || this.getConfig();
    const owner = conf.owner.trim() || 'tchindaazice';
    const repo = conf.repo.trim() || 'nexus-tunnel-vpn';
    return `https://github.com/${owner}/${repo}`;
  },

  getReleasesPageUrl(config?: GithubRepoConfig): string {
    return `${this.getRepoUrl(config)}/releases`;
  }
};
