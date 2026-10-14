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
  repo: 'App-xunes',
  tag: 'v3.2.0',
  apkName: 'NexusTunnel-v3.2.0.apk',
};

export const GithubConfigService = {
  getConfig(): GithubRepoConfig {
    try {
      const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure exact repo if default was old
        if (parsed.repo === 'nexus-tunnel-vpn' || !parsed.repo) {
          parsed.repo = 'App-xunes';
        }
        return { ...DEFAULT_GITHUB_CONFIG, ...parsed };
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
    const repo = conf.repo.trim() || 'App-xunes';
    const tag = conf.tag.trim() || 'v3.2.0';
    const apk = conf.apkName.trim() || 'NexusTunnel-v3.2.0.apk';

    // Exact direct download URL for the user's release
    return `https://github.com/${owner}/${repo}/releases/download/${tag}/${apk}`;
  },

  getLatestApkDownloadUrl(config?: GithubRepoConfig): string {
    const conf = config || this.getConfig();
    const owner = conf.owner.trim() || 'tchindaazice';
    const repo = conf.repo.trim() || 'App-xunes';
    const apk = conf.apkName.trim() || 'NexusTunnel-v3.2.0.apk';

    return `https://github.com/${owner}/${repo}/releases/latest/download/${apk}`;
  },

  getRepoUrl(config?: GithubRepoConfig): string {
    const conf = config || this.getConfig();
    const owner = conf.owner.trim() || 'tchindaazice';
    const repo = conf.repo.trim() || 'App-xunes';
    return `https://github.com/${owner}/${repo}`;
  },

  getReleasesPageUrl(config?: GithubRepoConfig): string {
    return `${this.getRepoUrl(config)}/releases`;
  },

  getNewReleaseUrl(config?: GithubRepoConfig): string {
    return `${this.getRepoUrl(config)}/releases/new`;
  }
};
