import { NextResponse } from 'next/server';
import { getAllProgramKnowledges, createProgramKnowledge } from '../../services/programKnowledgeService';
import { ProgramKnowledge } from '../../models/ProgramKnowledge';

export async function GET() {
  try {
    const modules = await getAllProgramKnowledges();
    console.log(modules);
    return NextResponse.json(modules);
  } catch (error) {
    console.error('获取知识模块失败:', error);
    return NextResponse.json({ error: '获取知识模块失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as Omit<ProgramKnowledge, '_id'>;
    
    if (!data.logic_code || !Array.isArray(data.example)) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }
    
    const newModule = await createProgramKnowledge(data);
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error('创建知识模块失败:', error);
    return NextResponse.json({ error: '创建知识模块失败' }, { status: 500 });
  }
}