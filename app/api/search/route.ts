export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
      return Response.json({ songs: [] });
    }

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const html = await res.text();

    // 🔥 Extract ytInitialData safely
    const match = html.match(/var ytInitialData = (.*?);<\/script>/);

    if (!match || !match[1]) {
      console.log("No ytInitialData found");
      return Response.json({ songs: [] });
    }

    const data = JSON.parse(match[1]);

    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    let videos: any[] = [];

    contents.forEach((section: any) => {
      const items = section.itemSectionRenderer?.contents || [];

      items.forEach((item: any) => {
        const v = item.videoRenderer;
        if (!v) return;

        videos.push({
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || "No title",
          artist: v.ownerText?.runs?.[0]?.text || "Unknown",
          thumbnail: v.thumbnail?.thumbnails?.pop()?.url,
        });
      });
    });

    return Response.json({
      songs: videos.slice(0, 20),
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return Response.json({ songs: [] });
  }
}
