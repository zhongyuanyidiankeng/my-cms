import { NextResponse } from 'next/server';
import { getAllCmsModules } from '../../services/cmsModuleService';

export async function GET() {
  try {
    const modules = await getAllCmsModules();
    console.log("modules:",modules);
    return NextResponse.json(modules);
  } catch (error) {
    console.error('API获取模块失败:', error);
    return NextResponse.json({ error: '获取模块失败' }, { status: 500 });
  }
}