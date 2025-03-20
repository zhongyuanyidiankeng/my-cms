import { NextRequest, NextResponse } from 'next/server';
import trending from 'trending-github';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const language = searchParams.get('language') || '';
    const since = searchParams.get('since') || 'daily'; // daily, weekly, monthly
    console.log("language:",language);
    console.log("since:",since);
    // 使用 trending-github 获取趋势数据
    const trendingData = await trending(language, since);
    
    const result = trendingData.map(repo => ({
      owner: repo.author || '',
      name: repo.name || '',
      url: repo.href || `https://github.com/${repo.author}/${repo.name}`,
      description: repo.description || '',
      language: repo.language || '',
      languageColor: getLanguageColor(repo.language || ''),
      stars: repo.stars,
      forks: repo.forks
    }));
    console.log("github:",result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取 GitHub 趋势数据失败:', error);
    return NextResponse.json(
      { error: '获取 GitHub 趋势数据失败' }, 
      { status: 500 }
    );
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

