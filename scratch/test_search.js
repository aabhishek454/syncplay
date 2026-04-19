const ytSearch = require('yt-search');

async function test() {
  try {
    console.log("Searching for Pasoori...");
    const r = await ytSearch('Pasoori');
    console.log("Results found:", r.videos.length);
    r.videos.slice(0, 3).forEach(v => {
      console.log(`- ${v.title} (${v.videoId})`);
    });
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
