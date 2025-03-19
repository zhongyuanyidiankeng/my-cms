'use client';

import { createContext, useContext } from 'react';

interface TelegramDateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export const TelegramDateContext = createContext<TelegramDateContextType>({
  selectedDate: new Date(),
  setSelectedDate: () => {},
});

export const useTelegramDate = () => useContext(TelegramDateContext);