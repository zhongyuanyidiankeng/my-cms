import Link from 'next/link';
import styles from './BackToTools.module.css';

export default function BackToTools() {
  return (
    <div className={styles.backButton}>
      <Link href="/tools" className={styles.backLink}>
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path fillRule="evenodd" d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"></path>
        </svg>
        返回工具页
      </Link>
    </div>
  );
}