'use client';

import { useState, useEffect } from 'react';
import { getGitHubTrendingRepos } from '../../services/githubService';
import styles from '../github.module.css';
import type { GitHubRepo } from '../../services/githubService';
import BackToHome from '../../components/BackToHome';

export default function GitHubTrending({ initialRepos }: { initialRepos: GitHubRepo[] }) {
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [period, setPeriod] = useState('daily');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchRepos(newPeriod: string, newLanguage: string) {
    setLoading(true);
    try {
      const data = await getGitHubTrendingRepos(newPeriod, newLanguage);
      setRepos(data);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRepos(period, language);
  }, [period, language]);

  return (
    <div className={styles.container}>
      <BackToHome />
      
      <header className={styles.header}>
        <h1>Trending</h1>
        <p className={styles.subtitle}>See what the GitHub community is most excited about today.</p>
      </header>
      
      <div className={styles.filterBar}>
        <div className={styles.tabGroup}>
          <button className={`${styles.tab} ${styles.active}`}>Repositories</button>
          <button className={styles.tab}>Developers</button>
        </div>
        
        <div className={styles.filters}>
          <div className={styles.filter}>
            <span>Spoken Language:</span>
            <select>
              <option>Any</option>
            </select>
          </div>
          <div className={styles.filter}>
            <span>Language:</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Any</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="c++">C++</option>
              <option value="csharp">C#</option>
            </select>
          </div>
          <div className={styles.filter}>
            <span>Date range:</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="daily">Today</option>
              <option value="weekly">This week</option>
              <option value="monthly">This month</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loading}>加载中...</div>
      ) : (
        <div className={styles.repoList}>
          {repos.map((repo, index) => (
            <div key={index} className={styles.repoCard}>
              <div className={styles.repoHeader}>
                <div className={styles.repoIcon}>
                  <svg viewBox="0 0 16 16" width="16" height="16">
                    <path fillRule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                  </svg>
                </div>
                <div className={styles.repoName}>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer">
                    {repo.owner} / <span className={styles.repoNameText}>{repo.name}</span>
                  </a>
                </div>
                <div className={styles.repoActions}>
                  <button className={styles.starButton}>
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
                    </svg>
                    Star
                  </button>
                </div>
              </div>
              
              <div className={styles.repoDescription}>
                <p>{repo.description}</p>
              </div>
              
              <div className={styles.repoFooter}>
                <div className={styles.repoStats}>
                  {repo.language && (
                    <span className={styles.language}>
                      <span 
                        className={styles.languageColor} 
                        style={{ backgroundColor: repo.languageColor }}
                      ></span>
                      {repo.language}
                    </span>
                  )}
                  <span className={styles.stars}>
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
                    </svg>
                    {repo.stars.toLocaleString()}
                  </span>
                  <span className={styles.forks}>
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                    </svg>
                    {repo.forks.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}