import { getGitHubTrendingRepos } from '../services/githubService';
import GitHubTrending from './components/GitHubTrending';

export default async function GitHubPage() {
  const initialRepos = await getGitHubTrendingRepos();
  
  return <GitHubTrending initialRepos={initialRepos} />;
}