import styles from './page.module.css';
import ModulesLoader from './components/ModulesLoader';

export default async function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>啦啦啦</h1>
      <ModulesLoader />
    </main>
  );
}
