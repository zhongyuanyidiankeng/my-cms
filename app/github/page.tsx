import { GitHubRepo } from '../services/githubService';
import GitHubTrending from './components/GitHubTrending';

export default async function GitHubPage() {
  const initialRepos: GitHubRepo[] = [];

  return <GitHubTrending initialRepos={initialRepos} />;
}