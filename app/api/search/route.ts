import { NextResponse } from 'next/server';
import { TRACK_LIST } from '@/lib/tracks';

export const dynamic = 'force-dynamic';

// Public Invidious instances for failover if YT blocks Vercel
const INVIDIOUS_INSTANCES = [
  'https://yewtu.be',
  'https://vid.puffyan.us',
  'https://inv.riverside.rocks',
  'https://invidious.namazso.eu',
  'https://inv.tux.pizza'
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 });
  }

  const cleanQuery = query.trim();

  // 1. DIRECT ID / URL DETECTION (Highest priority)
  const ytIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const directIdMatch = cleanQuery.match(ytIdRegex) || cleanQuery.match(/^([^"&?\/\s]{11})$/);
  
  if (directIdMatch) {
    const videoId = directIdMatch[1];
    return NextResponse.json([{
      id: videoId,
      title: "Direct YouTube Link",
      artist: "Video ID",
      duration: "--:--",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    }]);
  }

  // 2. LOCAL SEARCH (Always works, no matter what)
  const localResults = TRACK_LIST.filter(t => 
     t.title.toLowerCase().includes(cleanQuery.toLowerCase()) || 
     t.artist.toLowerCase().includes(cleanQuery.toLowerCase())
  );

  let youtubeResults: any[] = [];
  
  try {
    // 3. PRIMARY: YouTube Modern API Scraper
    console.log(`[API] Primary Search: ${cleanQuery}`);
    try {
      const youTubeSearch = require('youtube-search-api');
      const r = await youTubeSearch.GetListByKeyword(cleanQuery, false, 25);
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
      console.warn("[API] Primary YT Search blocked. Falling back to Invidious...");
      
      // 4. SECONDARY: Invidious Failover (YouTube Mirrors)
      for (const instance of INVIDIOUS_INSTANCES) {
        try {
          const invRes = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(cleanQuery)}`, { signal: AbortSignal.timeout(3000) });
          if (invRes.ok) {
            const items = await invRes.json();
            if (Array.isArray(items)) {
              youtubeResults = items.slice(0, 20).map((v: any) => ({
                id: v.videoId,
                title: v.title,
                artist: v.author,
                duration: v.durationText || '0:00',
                thumbnail: v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
              }));
              if (youtubeResults.length > 0) break; // Found results!
            }
          }
        } catch (invError) {
          continue; // Try next instance
        }
      }
    }

    // 5. TERTIARY: Legacy Scraper (Last resort)
    if (youtubeResults.length === 0) {
      try {
        const ytSearchLegacy = require('yt-search');
        const rl = await ytSearchLegacy(cleanQuery);
        youtubeResults = (rl.videos || []).slice(0, 15).map((v: any) => ({
          id: v.videoId,
          title: v.title,
          artist: v.author.name,
          duration: v.timestamp,
          thumbnail: v.thumbnail,
        }));
      } catch (e) {}
    }

    // Merge and deduplicate
    const combined = [...localResults];
    const seenIds = new Set(localResults.map(t => t.id));

    youtubeResults.forEach(yt => {
      if (yt.id && !seenIds.has(yt.id)) {
        combined.push(yt);
        seenIds.add(yt.id);
      }
    });

    return NextResponse.json(combined.slice(0, 40));
  } catch (error) {
    console.error('[API] Fatal Error:', error);
    return NextResponse.json(localResults); // Return what we have
  }
}
