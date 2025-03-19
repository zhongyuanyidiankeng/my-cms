export interface GitHubRepo {
  name: string;
  owner: string;
  description: string;
  url: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  starsToday: number;
  contributors?: Array<{
    username: string;
    avatarUrl: string;
  }>;
  topics?: string[];
  builtBy?: Array<{
    username: string;
    href: string;
    avatar: string;
  }>;
}

export default GitHubRepo;