import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllTelegramMessages
} from '../../services/telegramMessageService';
import { TelegramMessage } from '../../models/TelegramMessage';

export async function GET() {
  try {
    const messages = await getAllTelegramMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('获取Telegram消息失败:', error);
    return NextResponse.json({ error: '获取消息失败' }, { status: 500 });
  }
}
