import { NextResponse } from 'next/server';
import { deleteTelegramMessage } from '../../../services/telegramMessageService';
import { NextApiRequest } from 'next';

// 修复类型定义，使用正确的参数结构
export async function DELETE(
    req: NextApiRequest
) {
    const { id } = req.query;

    if (!id) {
        return NextResponse.json({ error: '缺少消息ID' }, { status: 400 });
    }

    try {
        await deleteTelegramMessage(String(id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`删除Telegram消息失败 (ID: ${id}):`, error);
        return NextResponse.json(
            { error: '删除消息失败' },
            { status: 500 }
        );
    }
}