import styles from './tools.module.css';
import BackToHome from '../components/BackToHome';
import ToolCard from './components/ToolCard';
import { tools } from './toolsData'; // 导入tools数组

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