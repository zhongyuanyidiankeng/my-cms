import { GitHubRepo } from '../models/GitHubRepo';
import GitHubTrending from './components/GitHubTrending';

export default async function GitHubPage() {
  const initialRepos: GitHubRepo[] = [];

  return <GitHubTrending initialRepos={initialRepos} />;
}