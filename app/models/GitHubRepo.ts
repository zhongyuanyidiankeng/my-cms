export interface GitHubRepo {
    owner: string;
    name: string;
    url: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
    forks: number;
}

export default GitHubRepo;