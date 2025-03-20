'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DatePicker.module.css';
import { useTelegramDate } from '../contexts/TelegramDateContext';

interface DatePickerProps {
  defaultValue: string; // 格式为 yyyy-mm-dd
}

export default function DatePicker({ defaultValue }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(defaultValue);
  const telegramContext = useTelegramDate();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // 更新Context中的日期
    telegramContext.setSelectedDate(new Date(newDate));
    
    // 仍然保留事件触发，以兼容其他可能使用此事件的组件
    const event = new CustomEvent('dateSelected', { detail: newDate });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.datePicker}>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className={styles.dateInput}
      />
    </div>
  );
}