'use client';

import { useState } from 'react';
import styles from './json.module.css';
import BackToTools from '../../components/BackToTools';
import BackToHome from '../../components/BackToHome';

export default function JsonPage() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState('');

  const handleFormat = () => {
    try {
      if (!inputJson.trim()) {
        setOutputJson('');
        setError('');
        return;
      }
      
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      setError('');
    } catch (err) {
      setError('JSON 格式错误：' + String(err));
      setOutputJson('');
    }
  };

  const handleCompress = () => {
    try {
      if (!inputJson.trim()) {
        setOutputJson('');
        setError('');
        return;
      }
      
      const parsed = JSON.parse(inputJson);
      const compressed = JSON.stringify(parsed);
      setOutputJson(compressed);
      setError('');
    } catch (err) {
      setError('JSON 格式错误：' + String(err));
      setOutputJson('');
    }
  };

  const handleClear = () => {
    setInputJson('');
    setOutputJson('');
    setError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <BackToTools />
        <BackToHome />
      </div>
      
      <header className={styles.header}>
        <h1>JSON 格式化</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.inputSection}>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="请输入需要格式化的 JSON"
            className={styles.textarea}
          />
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.actions}>
          <button onClick={handleFormat} className={styles.button}>格式化</button>
          <button onClick={handleCompress} className={styles.button}>压缩</button>
          <button onClick={handleClear} className={styles.buttonSecondary}>清空</button>
        </div>

        <div className={styles.outputSection}>
          <pre className={styles.output}>
            {outputJson || '格式化结果将显示在这里'}
          </pre>
        </div>
      </div>
    </div>
  );
}