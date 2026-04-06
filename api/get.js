export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
    const token   = process.env.UPSTASH_REDIS_REST_TOKEN;

    const [stateRes, styleRes, entriesRes] = await Promise.all([
      fetch(`${baseUrl}/get/lt-state`,   { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${baseUrl}/get/lt-style`,   { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${baseUrl}/get/lt-entries`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const stateJson   = await stateRes.json();
    const styleJson   = await styleRes.json();
    const entriesJson = await entriesRes.json();

    const state   = safeParse(stateJson.result,   { visible: false, nama: '', jabatan: '' });
    const style   = safeParse(styleJson.result,   defaultStyle());
    const entries = safeParse(entriesJson.result, defaultEntries());

    return res.status(200).json({ state, style, entries });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Handle nilai yang mungkin single atau double encoded
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const first = JSON.parse(raw);
    // Jika hasilnya masih string, parse sekali lagi (data lama double-encoded)
    if (typeof first === 'string') return JSON.parse(first);
    return first;
  } catch(e) {
    return fallback;
  }
}

function defaultStyle() {
  return {
    posX:         285,
    posY:         308,
    namaSize:     38,
    jabatanSize:  26,
    namaColor:    '#ffffff',
    jabatanColor: '#e0f0ff',
  };
}

function defaultEntries() {
  return [
    { nama: 'Andra Soni, S.M., M.A.P',                    jabatan: 'Gubernur Banten' },
    { nama: 'Dr. H.R.A. Dimyati Natakusumah, S.H., M.H.', jabatan: 'Wakil Gubernur Banten' },
    { nama: 'H. Deden Apriandhi H, S.STP., M.Si.',        jabatan: 'Sekda Banten' },
    { nama: 'Drs. H. Jamaluddin, M.Pd.',                  jabatan: 'Kepala Dinas Pendidikan Prov. Banten' },
    { nama: 'Teguh Setiawan, S.Pd., M.Si.',               jabatan: 'Kepala KCD' },
    { nama: 'Ust. Asbur',                                  jabatan: 'Sambutan Yayasan' },
  ];
}
