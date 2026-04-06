export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
    const token   = process.env.UPSTASH_REDIS_REST_TOKEN;
    const body    = req.body;

    const ops = [];

    // Update state (nama yang sedang tampil + visibility)
    if (body.state !== undefined) {
      ops.push(
        fetch(`${baseUrl}/set/lt-state`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify(body.state),
        })
      );
    }

    // Update style global (posisi, warna, ukuran font)
    if (body.style !== undefined) {
      ops.push(
        fetch(`${baseUrl}/set/lt-style`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify(body.style),
        })
      );
    }

    // Update daftar nama
    if (body.entries !== undefined) {
      ops.push(
        fetch(`${baseUrl}/set/lt-entries`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify(body.entries),
        })
      );
    }

    await Promise.all(ops);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
