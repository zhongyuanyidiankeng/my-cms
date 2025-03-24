import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, context: {params: Promise<{ filename: string}>}) {
  try {
    const filename = (await context.params).filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    console.log('File path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      console.log('File is readable');
    } catch (err) {
      console.error('File is not readable:', err);
    }
    try {
      const stats = fs.statSync(filePath);
      console.log('File stats:', stats);
    } catch (err) {
      console.error('Failed to get file stats:', err);
    }
    
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