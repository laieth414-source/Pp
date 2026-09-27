const https = require('https');

function search(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      const urls = html.match(/https?:\/\/[^"'\s<>]+\.(png|webp|jpg|jpeg)/gi) || [];
      console.log('Results for', query, ':', [...new Set(urls)].slice(0, 10));
    });
  });
}

search('site:pngimg.com/uploads/robot robot_PNG');
