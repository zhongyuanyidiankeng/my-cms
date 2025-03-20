import { getAllCmsModules } from './services/cmsModuleService';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
// 导入工具列表
import { tools } from './tools/page';
import ToolIconsClient from './components/ToolIconsClient';

export default async function Home() {
  const modules = await getAllCmsModules();
  
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>啦啦啦</h1>
      
      <div className={styles.cardContainer}>
        {modules.map((module) => {
          // 为每个模块设置图标和描述
          const icon = module.config.icon;
          const description = module.config.desc;
          
          return (
            <Link 
              href={module.route || `/${module.name.toLowerCase()}`} 
              key={module.name}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <Image src={icon} alt={`${module.name} 图标`} width={60} height={60} />
                  </div>
                  <h2 className={styles.cardTitle}>{module.name}</h2>
                </div>
                <p>{description}</p>
                
                {/* 如果是Tools模块，展示工具图标 */}
                {module.name === "Tools" && tools && tools.length > 0 && (
                  <ToolIconsClient tools={tools} />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
