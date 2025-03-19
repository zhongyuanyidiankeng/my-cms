'use client';

import { ProgramKnowledge } from '../../models/ProgramKnowledge';
import styles from './KnowledgeList.module.css';

interface KnowledgeListProps {
  items: ProgramKnowledge[];
}

export default function KnowledgeList({ items }: KnowledgeListProps) {
  return (
    <div className={styles.knowledgeList}>
      {items.map((item) => (
        <div key={item.type} className={styles.knowledgeCard}>
          <h3 className={styles.knowledgeTitle}>{item.type}</h3>
          <div className={styles.examples}>
            {item.example.map((ex, index) => (
              <div key={index} className={styles.example}>
                <p className={styles.desc}>{ex.desc}</p>
                <pre className={styles.code}><code>{ex.code}</code></pre>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}