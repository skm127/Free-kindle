export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL parameter required' });

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }
    if (['localhost', '127.0.0.1'].includes(parsed.hostname) || parsed.hostname.startsWith('192.168.') || parsed.hostname.startsWith('10.')) {
      return res.status(403).json({ error: 'Local addresses not allowed' });
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'FreeKindle/1.0' },
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) return res.status(response.status).json({ error: 'Upstream error' });

    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');

    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (max 100MB)' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}
