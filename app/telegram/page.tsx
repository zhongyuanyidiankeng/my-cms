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
  
  // 添加状态用于图片放大功能
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
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
  
  // 处理图片点击放大
  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };
  
  // 关闭放大的图片
  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };
  
  // 根据图片数量决定展示方式
  const renderImages = (images: string[]) => {
    // 提取所有有效的图片URL
    const validImages = images
      .map(img => {
        const urlMatch = img.match(/url\("(.+?)"\)/);
        return urlMatch ? urlMatch[1] : null;
      })
      .filter(url => url !== null) as string[];
    
    if (validImages.length === 0) return null;
    
    // 根据图片数量选择不同的展示方式
    if (validImages.length === 1) {
      // 单张图片正常展示
      return (
        <div className={styles.singleImageContainer}>
          <img 
            src={validImages[0]} 
            alt="单张图片" 
            className={styles.singleImage}
            onClick={() => handleImageClick(validImages[0])}
          />
        </div>
      );
    } else if (validImages.length <= 3) {
      // 2-3张图片横向排列
      return (
        <div className={styles.smallImageGrid}>
          {validImages.map((url, index) => (
            <div key={index} className={styles.smallImageContainer}>
              <img 
                src={url} 
                alt={`图片 ${index + 1}`} 
                className={styles.smallImage}
                onClick={() => handleImageClick(url)}
              />
            </div>
          ))}
        </div>
      );
    } else {
      // 4张及以上图片使用网格布局，只显示前4张，并标注总数
      return (
        <div className={styles.imageGrid}>
          {validImages.slice(0, 4).map((url, index) => (
            <div 
              key={index} 
              className={styles.gridImageContainer}
              onClick={() => handleImageClick(url)}
            >
              <img 
                src={url} 
                alt={`图片 ${index + 1}`} 
                className={styles.gridImage}
              />
              {index === 3 && validImages.length > 4 && (
                <div className={styles.moreImagesOverlay}>
                  +{validImages.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };
  
  // 添加状态用于控制删除确认对话框
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    visible: boolean;
    messageId: string | null;
  }>({ visible: false, messageId: null });
  
  // 处理删除消息
  const handleDeleteMessage = async (logicCode: string) => {
    try {
      const response = await fetch(`/api/telegram/${logicCode}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除消息失败');
      }
      
      // 删除成功后更新消息列表
      setMessages(messages.filter(msg => msg.logic_code !== logicCode));
      setDeleteConfirmation({ visible: false, messageId: null });
    } catch (error) {
      console.error('删除消息失败:', error);
      alert('删除消息失败，请重试');
    }
  };
  
  // 显示删除确认对话框
  const showDeleteConfirmation = (messageId: string) => {
    setDeleteConfirmation({ visible: true, messageId });
  };
  
  // 关闭删除确认对话框
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ visible: false, messageId: null });
  };
  
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
              {/* 添加三点菜单 */}
              <div className={styles.cardActions}>
                <button 
                  className={styles.menuButton}
                  onClick={() => showDeleteConfirmation(message.logic_code)}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>
              
              {message.image && renderImages(message.image)}
              
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
      
      {/* 图片放大查看器 */}
      {enlargedImage && (
        <div className={styles.imageViewer} onClick={closeEnlargedImage}>
          <div className={styles.imageViewerContent}>
            <img 
              src={enlargedImage} 
              alt="放大图片" 
              className={styles.enlargedImage} 
            />
            <button className={styles.closeButton} onClick={closeEnlargedImage}>
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* 删除确认对话框 */}
      {deleteConfirmation.visible && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmDialog}>
            <h3>确认删除</h3>
            <p>确定要删除这条消息吗？此操作无法撤销。</p>
            <div className={styles.dialogButtons}>
              <button 
                className={styles.cancelButton}
                onClick={closeDeleteConfirmation}
              >
                取消
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteMessage(deleteConfirmation.messageId!)}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}