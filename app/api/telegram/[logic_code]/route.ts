import { NextRequest, NextResponse } from 'next/server';
import { deleteTelegramMessage } from '../../../services/telegramMessageService';

export async function DELETE(req: NextRequest, context: { params: Promise<{ logic_code: string }> }) {
    console.log('request method:', req.method);
    const params = await context.params;
    const logic_code = params.logic_code;

    if (!logic_code) {
        return NextResponse.json({ error: '缺少消息标识' }, { status: 400 });
    }

    try {
        await deleteTelegramMessage(logic_code);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`删除Telegram消息失败 (ID: ${logic_code}):`, error);
        return NextResponse.json(
            { error: '删除消息失败' },
            { status: 500 }
        );
    }
}