'use client';

import { useState } from 'react';
import styles from './json.module.css';
import BackToTools from '../../components/BackToTools';
import BackToHome from '../../components/BackToHome';
import yaml from 'js-yaml';

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

  const handleJsonToYaml = () => {
    try {
      if (!inputJson.trim()) {
        setOutputJson('');
        setError('');
        return;
      }
      
      const parsed = JSON.parse(inputJson);
      const yamlString = yaml.dump(parsed);
      setOutputJson(yamlString);
      setError('');
    } catch (err) {
      setError('JSON 格式错误：' + String(err));
      setOutputJson('');
    }
  };

  const handleYamlToJson = () => {
    try {
      if (!inputJson.trim()) {
        setOutputJson('');
        setError('');
        return;
      }
      
      const parsed = yaml.load(inputJson);
      const jsonString = JSON.stringify(parsed, null, 2);
      setOutputJson(jsonString);
      setError('');
    } catch (err) {
      setError('YAML 格式错误：' + String(err));
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
        <h1>JSON/YAML 格式化</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.inputSection}>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="请输入需要格式化的 JSON 或 YAML"
            className={styles.textarea}
          />
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.actions}>
          <button onClick={handleFormat} className={styles.button}>格式化 JSON</button>
          <button onClick={handleCompress} className={styles.button}>压缩 JSON</button>
          <button onClick={handleJsonToYaml} className={styles.button}>JSON 转 YAML</button>
          <button onClick={handleYamlToJson} className={styles.button}>YAML 转 JSON</button>
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