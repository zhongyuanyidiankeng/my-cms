import axios from 'axios';
import * as cheerio from 'cheerio';
import GitHubRepo from '../models/GitHubRepo';

export async function trendingGitHub(period: string = 'daily', language: string = ''): Promise<GitHubRepo[]> {
    return new Promise<GitHubRepo[]>((resolve, reject) => axios
        .get(`https://github.com/trending/${encodeURIComponent(language)}?since=${period}`, {
            headers: {
                Accept: 'text/html',
            },
        })
        .then((response) => {
            const $ = cheerio.load(response.data);
            const repos: GitHubRepo[] = [];

            $('article').each((index, repo) => {
                const title = $(repo).find('h2.h3 a').text().replace(/\s/g, '');
                console.log(title);
                const owner = title.split('/')[0];
                const name = title.split('/')[1];
                const starLink = `/${title.replace(/ /g, '')}/stargazers`;
                const language = $(repo).find('[itemprop=programmingLanguage]').text().trim();

                let text = '';
                if (period === 'daily') {
                    text = 'stars today';
                } else if (period === 'weekly') {
                    text = 'stars this week';
                } else {
                    text = 'stars this month';
                }

                const indexRepo: GitHubRepo = {
                    owner,
                    name,
                    url: `https://github.com/${owner}/${name}`,
                    description: $(repo).find('p').text().trim() || '',
                    language: $(repo).find('[itemprop=programmingLanguage]').text().trim(),
                    languageColor: getLanguageColor(language || ''),
                    stars: parseInt($(repo).find(`[href="${starLink}"]`).text().trim()
                        .replace(',', '') || '0', 0),
                };

                repos.push(indexRepo);
            });

            resolve(repos);
        })
        .catch((err) => {
            reject(err);
        }))
};

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