import { NextRequest, NextResponse } from 'next/server';
import { getTelegramMessagesByDate } from '../../services/telegramMessageService';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  
  if (!date) {
    return NextResponse.json({ error: '缺少日期参数' }, { status: 400 });
  }

  try {
    const messages = await getTelegramMessagesByDate(date);
    const result = messages.map((message) => ({
      id: message._id.toHexString(),
      text: message.text,
      image: message.image,
      create_at: message.create_at,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取Telegram消息失败:', error);
    return NextResponse.json(
      { error: '获取Telegram消息失败' }, 
      { status: 500 }
    );
  }
}