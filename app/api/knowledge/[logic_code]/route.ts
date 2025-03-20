import { NextResponse } from 'next/server';
import { deleteProgramKnowledge } from '../../../services/programKnowledgeService';

export async function DELETE(
  request: Request,
  context: {params: Promise<{ logic_code: string}>}
) {
  try {
    console.log("request method", request.method);
    const { logic_code } = await context.params;
    const success = await deleteProgramKnowledge(logic_code);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: '删除知识模块失败，可能不存在该模块' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('删除知识模块失败:', error);
    return NextResponse.json({ error: '删除知识模块失败' }, { status: 500 });
  }
}