export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const base  = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    const h     = { Authorization: `Bearer ${token}` };

    const [stR, styR, entR, preR, hisR] = await Promise.all([
      fetch(`${base}/get/lt-state`,   { headers: h }),
      fetch(`${base}/get/lt-style`,   { headers: h }),
      fetch(`${base}/get/lt-entries`, { headers: h }),
      fetch(`${base}/get/lt-presets`, { headers: h }),
      fetch(`${base}/get/lt-history`, { headers: h }),
    ]);

    const [stJ, styJ, entJ, preJ, hisJ] = await Promise.all([
      stR.json(), styR.json(), entR.json(), preR.json(), hisR.json()
    ]);

    return res.status(200).json({
      state:   safeParse(stJ.result,  { visible: false, nama: '', jabatan: '' }),
      style:   safeParse(styJ.result, defaultStyle()),
      entries: safeParse(entJ.result, defaultEntries()),
      presets: safeParse(preJ.result, []),
      history: safeParse(hisJ.result, []),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return typeof v === 'string' ? JSON.parse(v) : v;
  } catch { return fallback; }
}

function defaultStyle() {
  return {
    posX: 285, posY: 308,
    namaSize: 38, jabatanSize: 26,
    gap: 4,
    namaColor: '#ffffff', jabatanColor: '#e0f0ff',
    fontFamily: 'Outfit',
    namaWeight: '700', jabatanWeight: '300',
    animationType: 'fade',
    autoHide: 0,
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
