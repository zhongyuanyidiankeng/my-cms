'use client';

import { useEffect, useState } from 'react';
import styles from '../page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { tools } from '../tools/toolsData';
import ToolIconsClient from './ToolIconsClient';
import CmsModule from '../models/CmsModule';

export default function ModulesLoader() {
  const [modules, setModules] = useState<CmsModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadModules() {
      try {
        // 创建一个API端点来获取模块
        const response = await fetch('/api/modules');
        if (!response.ok) {
          throw new Error('加载模块失败');
        }
        const data = await response.json();
        setModules(data);
      } catch (err) {
        console.error('客户端加载模块失败:', err);
        setError("模块数据加载失败");
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, []);

  if (loading) return <div>正在加载模块...</div>;
  if (error) return <div>加载失败: {error}</div>;

  return (
    <div className={styles.cardContainer}>
      {modules.map((module) => {
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
              
              {module.name === "Tools" && tools && tools.length > 0 && (
                <ToolIconsClient tools={tools} />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}