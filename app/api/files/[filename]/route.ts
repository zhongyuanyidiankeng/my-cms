import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const filename = searchParams.get('filename') || "";

    const filePath = path.join(process.cwd(), 'uploads', filename);
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return NextResponse.json(
            { error: '文件不存在' },
            { status: 404 }
          );;
    }

    // 读取文件内容
    const fileBuffer = fs.readFileSync(filePath);
    
    // 返回文件内容，设置正确的Content-Type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': "image/jpeg",
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('读取文件失败:', error);
    return NextResponse.json(
      { error: '读取文件失败' }, 
      { status: 500 }
    );
  }
}