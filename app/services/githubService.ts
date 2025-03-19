import trendingGithub from 'trending-github';

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

export async function getGitHubTrendingRepos(period: string = 'daily', language: string = ''): Promise<GitHubRepo[]> {
  try {
    const repos = await trendingGithub(period, language);

    return repos.map(repo => ({
      owner: repo.author || '',
      name: repo.name || '',
      url: repo.href || `https://github.com/${repo.author}/${repo.name}`,
      description: repo.description || '',
      language: repo.language || '',
      languageColor: getLanguageColor(repo.language || ''),
      stars: repo.stars,
      forks: repo.forks
    }));
  } catch (error) {
    console.error('获取 GitHub 趋势数据失败:', error);
    return [];
  }
}

// 为常见语言提供颜色
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    // 可以根据需要添加更多语言
  };
  
  return colors[language] || '#858585'; // 默认颜色
}