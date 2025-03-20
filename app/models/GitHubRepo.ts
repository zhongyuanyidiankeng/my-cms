export interface GitHubRepo {
    owner: string;
    name: string;
    url: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
}

export default GitHubRepo;