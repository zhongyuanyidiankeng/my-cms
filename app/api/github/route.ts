import { trendingGitHub } from '@/app/services/gitHubService';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const language = searchParams.get('language') || '';
    const since = searchParams.get('since') || 'daily'; // daily, weekly, monthly
    // 使用 trending-github 获取趋势数据
    const trendingData = await trendingGitHub(since, language);
    return NextResponse.json(trendingData);
  } catch (error) {
    console.error('获取 GitHub 趋势数据失败:', error);
    return NextResponse.json(
      { error: '获取 GitHub 趋势数据失败' }, 
      { status: 500 }
    );
  }
}



