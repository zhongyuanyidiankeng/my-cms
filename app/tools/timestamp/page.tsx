'use client';

import { useState, useEffect } from 'react';
import styles from './timestamp.module.css';
import BackToHome from '../../components/BackToHome';
import BackToTools from '../../components/BackToTools';

export default function TimestampPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState({
    seconds: Math.floor(Date.now() / 1000),
    milliseconds: Date.now()
  });
  const [inputTimestamp, setInputTimestamp] = useState('');
  const [dateResult, setDateResult] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [timestampResult, setTimestampResult] = useState({
    seconds: '',
    milliseconds: ''
  });

  // 更新当前时间戳
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp({
        seconds: Math.floor(Date.now() / 1000),
        milliseconds: Date.now()
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 添加复制功能
  // 添加新的状态来跟踪哪个时间戳被复制
  const [copiedType, setCopiedType] = useState<'seconds' | 'milliseconds' | null>(null);
  
  // 修改复制功能
  const handleCopyTimestamp = (text: string, type: 'seconds' | 'milliseconds') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  // 修改时间戳转日期的格式化方法
  const handleTimestampConvert = () => {
    if (!inputTimestamp) return;
    
    try {
      const timestamp = parseInt(inputTimestamp);
      let date;
      
      if (inputTimestamp.length === 13) {
        date = new Date(timestamp);
      } else if (inputTimestamp.length === 10) {
        date = new Date(timestamp * 1000);
      } else {
        setDateResult('请输入10位或13位时间戳');
        return;
      }
      
      if (isNaN(date.getTime())) {
        setDateResult('无效的时间戳');
        return;
      }

      const formatDate = (date: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      };

      setDateResult(formatDate(date));
    } catch (error) {
      setDateResult('转换失败');
    }
  };

  // 日期转时间戳
  const handleDateConvert = () => {
    if (!inputDate) return;
    
    try {
      const date = new Date(inputDate.replace(/\s+/g, 'T'));
      
      if (isNaN(date.getTime())) {
        setTimestampResult({
          seconds: '无效的日期格式',
          milliseconds: '无效的日期格式'
        });
        return;
      }

      setTimestampResult({
        seconds: Math.floor(date.getTime() / 1000).toString(),
        milliseconds: date.getTime().toString()
      });
    } catch (error) {
      setTimestampResult({
        seconds: '转换失败',
        milliseconds: '转换失败'
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const inputName = (e.target as HTMLInputElement).name;
    
    if (inputName === 'timestamp') {
      setInputTimestamp(pastedText);
    } else if (inputName === 'date') {
      setInputDate(pastedText);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <BackToTools />
        <BackToHome />
      </div>
      
      <header className={styles.header}>
        <h1>时间戳转换</h1>
      </header>

      <div className={styles.currentTime}>
        <h2>当前时间戳</h2>
        <div className={styles.timestamps}>
          <div>
            <span>秒级时间戳：</span>
            <div className={styles.timestampWrapper}>
              <span 
                className={styles.timestamp} 
                onClick={() => handleCopyTimestamp(currentTimestamp.seconds.toString(), 'seconds')}
                title="双击复制"
              >
                {currentTimestamp.seconds}
              </span>
              {copiedType === 'seconds' && <span className={styles.copySuccess}>✓</span>}
            </div>
          </div>
          <div>
            <span>毫秒级时间戳：</span>
            <div className={styles.timestampWrapper}>
              <span 
                className={styles.timestamp}
                onClick={() => handleCopyTimestamp(currentTimestamp.milliseconds.toString(), 'milliseconds')}
                title="双击复制"
              >
                {currentTimestamp.milliseconds}
              </span>
              {copiedType === 'milliseconds' && <span className={styles.copySuccess}>✓</span>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.convertSection}>
        <div className={styles.convertBox}>
          <h2>时间戳转日期</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="timestamp"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value)}
              onPaste={handlePaste}
              placeholder="请输入时间戳"
              className={styles.input}
            />
            <button onClick={handleTimestampConvert} className={styles.button}>
              转换
            </button>
          </div>
          <div className={styles.result}>
            结果：{dateResult || '等待输入...'}
          </div>
        </div>

        <div className={styles.convertBox}>
          <h2>日期转时间戳</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              onPaste={handlePaste}
              placeholder="格式：2024-01-01 12:00:00"
              className={styles.input}
            />
            <button onClick={handleDateConvert} className={styles.button}>
              转换
            </button>
          </div>
          <div className={styles.result}>
            <div>秒级时间戳：{timestampResult.seconds || '等待输入...'}</div>
            <div>毫秒级时间戳：{timestampResult.milliseconds || '等待输入...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}