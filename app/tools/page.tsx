import styles from './tools.module.css';
import BackToHome from '../components/BackToHome';
import ToolCard from './components/ToolCard';

// 导出工具列表以便在首页使用
export const tools = [
  {
    id: 'timestamp',
    title: '时间戳转换',
    description: '在时间戳和日期时间之间进行转换',
    icon: '🕒',
    path: '/tools/timestamp'
  },
  {
    id: 'json',
    title: 'JSON 格式化',
    description: '格式化和验证 JSON 数据',
    icon: '📝',
    path: '/tools/json'
  },
  {
    id: 'crontab',
    title: 'Crontab 表达式',
    description: '查看 Crontab 表达式的执行时间',
    icon: '⏰',
    path: '/tools/crontab'
  }
];

export default function ToolsPage() {
  return (
    <div className={styles.container}>
      <BackToHome />
      
      <header className={styles.header}>
        <h1>实用工具</h1>
        <p className={styles.subtitle}>常用开发工具集合</p>
      </header>

      <div className={styles.toolGrid}>
        {tools.map(tool => (
          <ToolCard key={tool.id} {...tool} />
        ))}
      </div>
    </div>
  );
}