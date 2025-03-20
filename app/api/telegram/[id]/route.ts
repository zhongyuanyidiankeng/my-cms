import { deleteTelegramMessage } from '../../../services/telegramMessageService';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query;

        if (typeof id !== 'string') {
            return res.status(400).json({ error: '缺少或无效的 ID 参数' });
        }

        try {
            // 在此处添加删除逻辑，例如从数据库中删除对应的记录
            // 假设使用某种数据库删除函数 deleteItemById(id)
            const result = await deleteTelegramMessage(id);

            if (result) {
                return res.status(200).json({ message: '删除成功' });
            } else {
                return res.status(404).json({ error: '未找到要删除的项目' });
            }
        } catch (error) {
            return res.status(500).json({ error: '服务器错误' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `方法 ${req.method} 不被允许` });
    }
}