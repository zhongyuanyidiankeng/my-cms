import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllCmsModules, 
  createCmsModule 
} from '../../services/cmsModuleService';
import { CmsModule } from '../../models/CmsModule';

export async function GET() {
  try {
    const modules = await getAllCmsModules();
    return NextResponse.json(modules);
  } catch (error) {
    console.error('获取CMS模块失败:', error);
    return NextResponse.json({ error: '获取模块失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 验证必填字段
    if (!data.name || !data.config) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }
    
    const newModule: Omit<CmsModule, '_id'> = {
      name: data.name,
      config: data.config
    };
    
    const createdModule = await createCmsModule(newModule);
    return NextResponse.json(createdModule, { status: 201 });
  } catch (error) {
    console.error('创建CMS模块失败:', error);
    return NextResponse.json({ error: '创建模块失败' }, { status: 500 });
  }
}