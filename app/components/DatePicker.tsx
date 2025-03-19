'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  defaultValue: string; // 格式为 yyyy-mm-dd
}

export default function DatePicker({ defaultValue }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(defaultValue);
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // 使用客户端导航更新页面内容
    // 这里我们不在URL中添加参数，而是通过状态管理或Context API来传递日期
    // 为了简单起见，我们可以使用一个自定义事件
    const event = new CustomEvent('dateSelected', { detail: newDate });
    window.dispatchEvent(event);
    
    // 重新加载页面以获取新日期的数据
    router.refresh();
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