'use client';

import { useState } from 'react';
import styles from './crontab.module.css';
import BackToTools from '../../components/BackToTools';
import cronstrue from 'cronstrue/i18n';
import { CronExpressionParser } from 'cron-parser';
import BackToHome from '../../components/BackToHome';

export default function CrontabPage() {
  const [cronType, setCronType] = useState('linux');
  const [cronExpression, setCronExpression] = useState('');
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(''); // 添加描述状态

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCronExpression(value);
    setError(''); // 清除错误提示
  };

  const handleExecute = () => {
    if (!cronExpression.trim()) {
      setError('请输入 Cron 表达式');
      setNextExecutions([]);
      setDescription('');
      return;
    }

    try {
      let expression = cronExpression;
      
      // 配置解析选项
      const options: any = {
        currentDate: new Date(),
        tz: 'Asia/Shanghai',
        iterator: true
      };
      
      // 根据不同类型处理表达式
      if (cronType === 'spring' || cronType === 'quartz') {
        options.seconds = true;  // 启用秒级支持
        const parts = expression.split(' ').filter(Boolean);
        if (parts.length < 6) {
          setError('Spring/Quartz Cron 表达式需要6-7个字段');
          return;
        }
      } else {
        // Linux crontab
        const parts = expression.split(' ').filter(Boolean);
        if (parts.length > 5) {
          setError('Linux Crontab 表达式需要5个字段');
          return;
        } else if (parts.length !== 5) {
          setError('Linux Crontab 表达式需要5个字段');
          return;
        }
      }

      try {
        const desc = cronstrue.toString(cronExpression, { 
          locale: 'zh_CN',
          use24HourTimeFormat: true
        });
        setDescription(desc);
      } catch (err) {
        setDescription('？？？');
      }

      // 修改这里的解析方式
      const interval = CronExpressionParser.parse(expression, options);
      const times = Array.from({ length: 5 }, () => 
        interval.next().toDate().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      
      setNextExecutions(times);
      setError('');
    } catch (err) {
      console.error('Cron parsing error:', err);
      setError('Cron 表达式格式错误');
      setNextExecutions([]);
      setDescription('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <BackToTools />
        <BackToHome />
      </div>
      
      <header className={styles.header}>
        <h1>Crontab 表达式工具</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.typeSelector}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="cronType"
              value="linux"
              checked={cronType === 'linux'}
              onChange={(e) => setCronType(e.target.value)}
            />
            Linux Crontab
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="cronType"
              value="spring"
              checked={cronType === 'spring'}
              onChange={(e) => setCronType(e.target.value)}
            />
            Spring Cron
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="cronType"
              value="quartz"
              checked={cronType === 'quartz'}
              onChange={(e) => setCronType(e.target.value)}
            />
            Quartz Cron
          </label>
        </div>

        <div className={styles.inputSection}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={cronExpression}
              onChange={handleExpressionChange}
              placeholder="请输入 Cron 表达式，例如: * * * * *"
              className={styles.input}
            />
            <button onClick={handleExecute} className={styles.button}>
              执行
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.resultSection}>
          {description && (
            <div className={styles.description}>
              表达式说明：{description}
            </div>
          )}
          <h3>最近五次执行时间</h3>
          {nextExecutions.length > 0 ? (
            <ul className={styles.executionList}>
              {nextExecutions.map((time, index) => (
                <li key={index} className={styles.executionItem}>
                  {time}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.placeholder}>
              输入正确的 Cron 表达式查看执行时间
            </div>
          )}
        </div>
      </div>
    </div>
  );
}