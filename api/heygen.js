// Proxy for HeyGen & LiveAvatar APIs — bypasses CORS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, X-API-KEY, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const p    = req.query.p;
  const host = req.query.host || 'heygen'; // 'heygen' | 'liveavatar'
  if (!p) { res.status(400).json({ error: 'Missing ?p= path' }); return; }

  const baseUrl = host === 'liveavatar'
    ? 'https://api.liveavatar.com'
    : 'https://api.heygen.com';

  const headers = { 'Content-Type': 'application/json' };
  if (req.headers['x-api-key'])    headers['X-API-KEY']     = req.headers['x-api-key'];
  if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];

  try {
    const opts = { method: req.method, headers };
    if (req.method !== 'GET' && req.body) {
      opts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    const upstream = await fetch(`${baseUrl}/${p}`, opts);
    const text = await upstream.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    res.status(upstream.status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
