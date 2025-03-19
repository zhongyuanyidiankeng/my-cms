'use client';

import { getAllCmsModules } from '../services/programKnowledgeService';
import styles from './page.module.css';
import KnowledgeList from './components/KnowledgeList';

export default async function KnowledgePage() {
  const knowledgeItems = await getAllCmsModules();

  return (
    <div className={styles.knowledgeContainer}>
      <h1 className={styles.title}>知识库</h1>
      <KnowledgeList items={knowledgeItems} />
    </div>
  );
}