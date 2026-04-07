export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const base  = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const h     = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const body  = req.body;
    const ops   = [];

    const set = (key, val) => ops.push(
      fetch(`${base}/set/${key}`, { method: 'POST', headers: h, body: JSON.stringify(val) })
    );

    if (body.state   !== undefined) set('lt-state',   body.state);
    if (body.style   !== undefined) set('lt-style',   body.style);
    if (body.entries !== undefined) set('lt-entries', body.entries);
    if (body.presets !== undefined) set('lt-presets', body.presets);
    if (body.history !== undefined) set('lt-history', body.history);

    await Promise.all(ops);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
