import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ytSearch = require('yt-search');
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  try {
    console.log(`[API] Searching YouTube for: ${query}`);
    const r = await ytSearch(query);
    const videos = r.videos || [];

    // Map to normalized Track type
    const tracks = videos.slice(0, 20).map((v: any) => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      duration: v.timestamp,
      thumbnail: v.thumbnail,
    }));

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('[API] Search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
