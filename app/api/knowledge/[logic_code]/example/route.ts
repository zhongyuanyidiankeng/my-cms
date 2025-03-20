import { NextResponse } from 'next/server';
import { addExample } from '../../../../services/programKnowledgeService';
import { Example } from '../../../../models/ProgramKnowledge';

export async function POST(
  request: Request,
  context: {params: Promise<{ logic_code: string}>}
) {
  try {
    const { logic_code } = await context.params;
    const data = await request.json() as Example;
    
    if (!data.desc || !data.code) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    const success = await addExample(logic_code, data);
    
    if (success) {
      return NextResponse.json({ success: true }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: '添加示例失败，可能不存在该模块' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('添加示例失败:', error);
    return NextResponse.json({ error: '添加示例失败' }, { status: 500 });
  }
}