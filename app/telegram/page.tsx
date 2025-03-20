'use client';

import { useState, useEffect } from 'react';
import styles from './telegram.module.css';
import { formatDate } from '../utils/dateUtils';
import DatePicker from '../components/DatePicker';
import BackToHome from '../components/BackToHome';
import { useTelegramDate } from '../contexts/TelegramDateContext';
import TelegramMessage from '../models/TelegramMessage';

export default function TelegramPage() {
  // 默认使用当天日期
  const today = new Date();
  const formattedToday = formatDate(today);
  
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedDate } = useTelegramDate();
  
  // 格式化选中的日期
  const formattedSelectedDate = formatDate(selectedDate);
  
  // 当日期变化时获取数据
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const response = await fetch(`/api/telegram?date=${formattedSelectedDate}`);
        if (!response.ok) {
          throw new Error('获取消息失败');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('获取消息失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessages();
  }, [formattedSelectedDate]);
  
  return (
    <div className={styles.container}>
      <BackToHome />
      <header className={styles.header}>
        <h1>Telegram 消息</h1>
        <div className={styles.dateFilter}>
          <DatePicker defaultValue={formattedToday} />
        </div>
      </header>
      
      <main className={styles.messageGrid}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={styles.messageCard}>
              {message.image && message.image.map((img, imgIndex) => {
                // 提取url中的实际图片链接
                const urlMatch = img.match(/url\("(.+?)"\)/);
                const imageUrl = urlMatch ? urlMatch[1] : null;
                return imageUrl ? (
                  <div key={imgIndex} className={styles.imageContainer}>
                    <img src={imageUrl} alt={`Image ${imgIndex + 1}`} className={styles.image} />
                  </div>
                ) : null;
              })}
              
              {message.text && (
                <div 
                  className={styles.textContent}
                  dangerouslySetInnerHTML={{ __html: message.text }}
                />
              )}
            </div>
          ))
        ) : (
          <div className={styles.noMessages}>当天没有消息</div>
        )}
      </main>
    </div>
  );
}