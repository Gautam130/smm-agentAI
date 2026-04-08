export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Content-Length', '0');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { handle } = req.body;
  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({ error: 'Handle is required' });
  }

  const cleanHandle = handle.replace('@', '').trim();
  const instagramUrl = `https://www.instagram.com/${cleanHandle}/`;

  try {
    const response = await fetch(instagramUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const status = response.status;

    if (status === 200 && contentType.includes('text/html')) {
      return res.status(200).json({
        exists: true,
        handle: cleanHandle,
        url: instagramUrl,
        public: true,
        message: 'Profile exists and is public'
      });
    } else if (status === 404) {
      return res.status(200).json({
        exists: false,
        handle: cleanHandle,
        url: instagramUrl,
        public: false,
        message: 'Profile does not exist or has been deleted'
      });
    } else if (status === 403) {
      return res.status(200).json({
        exists: null,
        handle: cleanHandle,
        url: instagramUrl,
        public: false,
        message: 'Profile may be private or blocked'
      });
    } else {
      return res.status(200).json({
        exists: null,
        handle: cleanHandle,
        url: instagramUrl,
        public: null,
        message: `Unable to verify (status: ${status})`
      });
    }
  } catch (error) {
    console.error('Instagram verification error:', error.message);
    return res.status(200).json({
      exists: null,
      handle: cleanHandle,
      url: instagramUrl,
      public: null,
      message: 'Verification failed - try again',
      error: error.message
    });
  }
}
