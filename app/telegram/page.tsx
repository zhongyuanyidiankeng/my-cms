import { getTelegramMessagesByDate } from '../services/telegramMessageService';
import styles from './telegram.module.css';
import { formatDate } from '../utils/dateUtils';
import DatePicker from '../components/DatePicker';
import BackToHome from '../components/BackToHome';

export default async function TelegramPage() {
  // 默认使用当天日期
  const today = new Date();
  const formattedToday = formatDate(today);
  
  // 获取指定日期的消息
  const messages = await getTelegramMessagesByDate(formattedToday);
  
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
        {messages.length > 0 ? (messages.map((message, index) => (
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
        ))) : (
            <div className={styles.noMessages}>当天没有消息</div>)}
      </main>
    </div>
  );
}