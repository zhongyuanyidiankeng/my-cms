import { NextRequest, NextResponse } from 'next/server';
import { deleteTelegramMessage } from '../../../services/telegramMessageService';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    console.log('request method:', req.method);
    const params = await context.params;
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: '缺少消息ID' }, { status: 400 });
    }

    try {
        await deleteTelegramMessage(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`删除Telegram消息失败 (ID: ${id}):`, error);
        return NextResponse.json(
            { error: '删除消息失败' },
            { status: 500 }
        );
    }
}