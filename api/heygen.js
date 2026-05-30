// Vercel serverless proxy — forwards requests to HeyGen API
// Needed because browsers block direct cross-origin calls to api.heygen.com

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const p = req.query.p;
  if (!p) { res.status(400).json({ error: 'Missing path param ?p=' }); return; }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) { res.status(401).json({ error: 'Missing x-api-key header' }); return; }

  try {
    const url = `https://api.heygen.com/${p}`;
    const opts = {
      method: req.method,
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
    };
    if (req.method !== 'GET' && req.body) {
      opts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    const upstream = await fetch(url, opts);
    const json = await upstream.json();
    res.status(upstream.status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
