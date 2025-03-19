import Link from 'next/link';
import styles from './ToolCard.module.css';

interface ToolCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

export default function ToolCard({ title, description, icon, path }: ToolCardProps) {
  return (
    <Link href={path} className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </Link>
  );
}