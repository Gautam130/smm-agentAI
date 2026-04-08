import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { handle } = await request.json().catch(() => ({}));

  if (!handle || typeof handle !== 'string') {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  const cleanHandle = handle.replace('@', '').trim();
  const instagramUrl = `https://www.instagram.com/${cleanHandle}/`;

  try {
    const response = await fetch(instagramUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const status = response.status;

    if (status === 200 && contentType.includes('text/html')) {
      return NextResponse.json({
        exists: true,
        handle: cleanHandle,
        url: instagramUrl,
        public: true,
        message: 'Profile exists and is public'
      });
    } else if (status === 404) {
      return NextResponse.json({
        exists: false,
        handle: cleanHandle,
        url: instagramUrl,
        public: false,
        message: 'Profile does not exist'
      });
    } else if (status === 403) {
      return NextResponse.json({
        exists: null,
        handle: cleanHandle,
        url: instagramUrl,
        public: false,
        message: 'Profile may be private'
      });
    }
    return NextResponse.json({
      exists: null,
      handle: cleanHandle,
      url: instagramUrl,
      public: null,
      message: `Unable to verify (status: ${status})`
    });
  } catch (error) {
    return NextResponse.json({
      exists: null,
      handle: cleanHandle,
      url: instagramUrl,
      public: null,
      message: 'Verification failed',
      error: (error as Error).message
    });
  }
}