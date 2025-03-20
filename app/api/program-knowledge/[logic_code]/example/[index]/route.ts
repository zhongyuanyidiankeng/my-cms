import { NextResponse } from 'next/server';
import { deleteExample } from '../../../../../services/programKnowledgeService';

export async function DELETE(
  request: Request,
  { params }: { params: { logic_code: string, index: string } }
) {
  try {
    console.log("request method", request.method);
    const { logic_code, index } = params;
    const exampleIndex = parseInt(index, 10);
    
    if (isNaN(exampleIndex)) {
      return NextResponse.json(
        { error: '无效的示例索引' },
        { status: 400 }
      );
    }
    
    const success = await deleteExample(logic_code, exampleIndex);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: '删除示例失败，可能不存在该模块或示例' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('删除示例失败:', error);
    return NextResponse.json({ error: '删除示例失败' }, { status: 500 });
  }
}