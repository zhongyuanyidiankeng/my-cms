'use client';

import { useState, useEffect } from 'react';
import { TelegramDateContext } from '../contexts/TelegramDateContext';

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const handleDateSelected = (e: CustomEvent) => {
      setSelectedDate(new Date(e.detail));
    };

    window.addEventListener('dateSelected', handleDateSelected as EventListener);
    
    return () => {
      window.removeEventListener('dateSelected', handleDateSelected as EventListener);
    };
  }, []);

  return (
    <TelegramDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </TelegramDateContext.Provider>
  );
}