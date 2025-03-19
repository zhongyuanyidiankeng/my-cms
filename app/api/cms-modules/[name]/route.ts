import { NextRequest, NextResponse } from 'next/server';
import { 
  updateCmsModule, 
  deleteCmsModule 
} from '../../../services/cmsModuleService';


export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const data = await request.json();
    const updated = await updateCmsModule(params.name, data);
    
    if (!updated) {
      return NextResponse.json({ error: '模块不存在或未更新' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`更新名称为${params.name}的CMS模块失败:`, error);
    return NextResponse.json({ error: '更新模块失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const deleted = await deleteCmsModule(params.name);
    
    if (!deleted) {
      return NextResponse.json({ error: '模块不存在或删除失败' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`删除名称为${params.name}的CMS模块失败:`, error);
    return NextResponse.json({ error: '删除模块失败' }, { status: 500 });
  }
}