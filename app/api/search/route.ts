import { NextResponse } from 'next/server';
import { TRACK_LIST } from '@/lib/tracks';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  const cleanQuery = query.trim();

  // 1. DIRECT ID / URL DETECTION
  const ytIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const directIdMatch = cleanQuery.match(ytIdRegex) || cleanQuery.match(/^([^"&?\/\s]{11})$/);
  
  if (directIdMatch) {
    const videoId = directIdMatch[1];
    console.log(`[API] Direct ID Detected: ${videoId}`);
    return NextResponse.json([{
      id: videoId,
      title: "Direct Video Link",
      artist: "YouTube",
      duration: "--:--",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    }]);
  }

  try {
    // 2. LOCAL SEARCH FALLBACK (ALWAYS RELIABLE)
    const localResults = TRACK_LIST.filter(t => 
       t.title.toLowerCase().includes(cleanQuery.toLowerCase()) || 
       t.artist.toLowerCase().includes(cleanQuery.toLowerCase())
    );

    // 3. ROBUST YOUTUBE SEARCH
    console.log(`[API] Searching YouTube for: ${cleanQuery}`);
    
    // Attempt multi-source search
    let youtubeResults: any[] = [];
    
    try {
      const youTubeSearch = require('youtube-search-api');
      const r = await youTubeSearch.GetListByKeyword(cleanQuery, false, 20);
      if (r && r.items) {
        youtubeResults = r.items.map((v: any) => ({
          id: v.id,
          title: v.title,
          artist: v.channelTitle || 'YouTube',
          duration: v.length?.accessibility?.accessibilityData?.label || v.duration || '0:00',
          thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        }));
      }
    } catch (ytError) {
      console.error("[API] Modern YT Search failed, falling back to legacy scraper:", ytError);
      try {
        const ytSearchLegacy = require('yt-search');
        const rl = await ytSearchLegacy(cleanQuery);
        youtubeResults = (rl.videos || []).slice(0, 20).map((v: any) => ({
          id: v.videoId,
          title: v.title,
          artist: v.author.name,
          duration: v.timestamp,
          thumbnail: v.thumbnail,
        }));
      } catch (legacyError) {
        console.error("[API] All YouTube searches failed. Returning local results only.");
      }
    }

    // Merge results, prioritizing local ones, and deduplicate
    const combined = [...localResults];
    const seenIds = new Set(localResults.map(t => t.id));

    youtubeResults.forEach(yt => {
      if (!seenIds.has(yt.id)) {
        combined.push(yt);
        seenIds.add(yt.id);
      }
    });

    return NextResponse.json(combined.slice(0, 40));
  } catch (error) {
    console.error('[API] Fatal search error:', error);
    // Even if everything fails, return local results if any
    const localFallback = TRACK_LIST.filter(t => 
      t.title.toLowerCase().includes(cleanQuery.toLowerCase())
    );
    return NextResponse.json(localFallback);
  }
}
