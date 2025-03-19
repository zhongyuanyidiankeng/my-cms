import { NextRequest, NextResponse } from 'next/server';
import { 
  getTelegramMessageById, 
  updateTelegramMessage, 
  deleteTelegramMessage 
} from '../../../services/telegramMessageService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updated = await updateTelegramMessage(params.id, data);
    
    if (!updated) {
      return NextResponse.json({ error: '消息不存在或未更新' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`更新ID为${params.id}的Telegram消息失败:`, error);
    return NextResponse.json({ error: '更新消息失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteTelegramMessage(params.id);
    
    if (!deleted) {
      return NextResponse.json({ error: '消息不存在或删除失败' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`删除ID为${params.id}的Telegram消息失败:`, error);
    return NextResponse.json({ error: '删除消息失败' }, { status: 500 });
  }
}